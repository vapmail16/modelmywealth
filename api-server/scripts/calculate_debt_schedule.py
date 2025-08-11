#!/usr/bin/env python3
"""
Debt Schedule Calculation Script
Uses exact logic from streamlit_app.py to calculate 120-month debt schedule
"""

import psycopg2
import numpy_financial as npf
import pandas as pd
import sys
import json
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class DebtScheduleCalculator:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('POSTGRESQL_HOST', 'localhost'),
            'database': os.getenv('POSTGRESQL_DATABASE', 'refi_wizard'),
            'user': os.getenv('POSTGRESQL_USER', 'postgres'),
            'password': os.getenv('POSTGRESQL_PASSWORD', 'admin123'),
            'port': os.getenv('POSTGRESQL_PORT', '5432')
        }

    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)

    def get_debt_structure_data(self, project_id):
        """Get debt structure data from database"""
        conn = self.get_connection()
        try:
            query = """
                SELECT * FROM debt_structure_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """
            df = pd.read_sql_query(query, conn, params=[project_id])
            return df.iloc[0].to_dict() if not df.empty else None
        finally:
            conn.close()

    def get_balance_sheet_data(self, project_id):
        """Get balance sheet data from database"""
        conn = self.get_connection()
        try:
            query = """
                SELECT * FROM balance_sheet_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """
            df = pd.read_sql_query(query, conn, params=[project_id])
            return df.iloc[0].to_dict() if not df.empty else None
        finally:
            conn.close()

    def delete_existing_calculations(self, project_id):
        """Delete existing debt calculations for the project"""
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM debt_calculations WHERE project_id = %s",
                    [project_id]
                )
            conn.commit()
        finally:
            conn.close()

    def insert_calculation(self, calculation_data):
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                query = """
                    INSERT INTO debt_calculations (
                        project_id, month, year, opening_balance, payment, 
                        interest_payment, principal_payment, closing_balance, 
                        cumulative_interest, calculation_run_id
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    ) RETURNING id
                """
                values = (
                    calculation_data['project_id'],
                    calculation_data['month'],
                    calculation_data['year'],
                    calculation_data['opening_balance'],
                    calculation_data['payment'],
                    calculation_data['interest_payment'],
                    calculation_data['principal_payment'],
                    calculation_data['closing_balance'],
                    calculation_data['cumulative_interest'],
                    calculation_data.get('calculation_run_id')  # Can be None
                )
                
                cursor.execute(query, values)
                conn.commit()
                return cursor.fetchone()[0]
        except Exception as e:
            conn.rollback()
            raise Exception(f"Failed to insert calculation: {str(e)}")
        finally:
            conn.close()

    def calculate_debt_schedule(self, project_id, calculation_run_id=None):
        """Calculate 120-month debt schedule using exact Streamlit logic"""
        
        # Get input data
        debt_structure = self.get_debt_structure_data(project_id)
        balance_sheet = self.get_balance_sheet_data(project_id)
        
        if not debt_structure or not balance_sheet:
            raise ValueError("Required data not found")

        # Extract parameters (matching Streamlit logic exactly)
        # Senior Secured parameters
        senior_secured = float(balance_sheet.get('senior_secured', 0))
        additional_loan_senior_secured = float(debt_structure.get('additional_loan_senior_secured', 0))
        bank_base_rate_senior_secured = float(debt_structure.get('bank_base_rate_senior_secured', 0)) / 100
        liquidity_premiums_senior_secured = float(debt_structure.get('liquidity_premiums_senior_secured', 0)) / 100
        credit_risk_premiums_senior_secured = float(debt_structure.get('credit_risk_premiums_senior_secured', 0)) / 100
        maturity_y_senior_secured = int(debt_structure.get('maturity_y_senior_secured', 0))
        amortization_y_senior_secured = int(debt_structure.get('amortization_y_senior_secured', 0))

        # Short Term parameters
        debt_tranche1 = float(balance_sheet.get('debt_tranche1', 0))
        additional_loan_short_term = float(debt_structure.get('additional_loan_short_term', 0))
        bank_base_rate_short_term = float(debt_structure.get('bank_base_rate_short_term', 0)) / 100
        liquidity_premiums_short_term = float(debt_structure.get('liquidity_premiums_short_term', 0)) / 100
        credit_risk_premiums_short_term = float(debt_structure.get('credit_risk_premiums_short_term', 0)) / 100
        maturity_y_short_term = int(debt_structure.get('maturity_y_short_term', 0))
        amortization_y_short_term = int(debt_structure.get('amortization_y_short_term', 0))

        # Calculate interest rates (matching Streamlit logic)
        interest_rate_per_annum_senior_secured = bank_base_rate_senior_secured + liquidity_premiums_senior_secured + credit_risk_premiums_senior_secured
        interest_rate_per_month_senior_secured = interest_rate_per_annum_senior_secured / 12
        maturity_m_senior_secured = maturity_y_senior_secured * 12
        amortization_m_senior_secured = amortization_y_senior_secured * 12
        repayment_over_m_senior_secured = maturity_m_senior_secured - amortization_m_senior_secured

        interest_rate_per_annum_short_term = bank_base_rate_short_term + liquidity_premiums_short_term + credit_risk_premiums_short_term
        interest_rate_per_month_short_term = interest_rate_per_annum_short_term / 12
        maturity_m_short_term = maturity_y_short_term * 12
        amortization_m_short_term = amortization_y_short_term * 12
        repayment_over_m_short_term = maturity_m_short_term - amortization_m_short_term

        # Initialize calculation data (matching Streamlit logic)
        mc = 1
        y = 1
        mym = []
        while y < 11:
            for m in range(1, 13):
                mym.append([mc, y, m, 0, 0, 0, 0, 0, 0])
                mc += 1
            y += 1

        # Create DataFrames (matching Streamlit logic)
        debt_calc_lst = ['MonthCum', 'Year', 'Month', 'Opening', 'Additional_Loan', 'Amortisation', 'Interest', 'Repayment', 'Closing']
        debt_calc_senior_secured = pd.DataFrame(mym, columns=debt_calc_lst)
        debt_calc_senior_secured = debt_calc_senior_secured.set_index('MonthCum')
        debt_calc_short_term = pd.DataFrame(mym, columns=debt_calc_lst)
        debt_calc_short_term = debt_calc_short_term.set_index('MonthCum')

        # Senior Secured calculation (matching Streamlit logic exactly)
        repayment_init_senior_secured = 0
        out_aft_amortization_senior_secured = senior_secured + additional_loan_senior_secured
        flg_amort_senior_secured = 0

        for i in debt_calc_senior_secured.index:
            if i == 1:
                debt_calc_senior_secured.loc[i, 'Opening'] = senior_secured
                debt_calc_senior_secured.loc[i, 'Additional_Loan'] = additional_loan_senior_secured
                
                # Interest calculation - should be calculated on total outstanding balance
                debt_calc_senior_secured.loc[i, 'Interest'] = (debt_calc_senior_secured.loc[i, 'Opening'] + debt_calc_senior_secured.loc[i, 'Additional_Loan']) * interest_rate_per_month_senior_secured
                
                # Repayment calculation - during amortization period, no principal payments
                if i <= amortization_m_senior_secured:
                    debt_calc_senior_secured.loc[i, 'Repayment'] = 0.0
                else:
                    # After amortization period, calculate payment
                    if i > amortization_m_senior_secured and repayment_init_senior_secured == 0.0:
                        debt_calc_senior_secured.loc[i, 'Repayment'] = npf.pmt(interest_rate_per_month_senior_secured, repayment_over_m_senior_secured, out_aft_amortization_senior_secured)
                    else:
                        debt_calc_senior_secured.loc[i, 'Repayment'] = repayment_init_senior_secured
                
                debt_calc_senior_secured.loc[i, 'Closing'] = debt_calc_senior_secured.loc[i, ['Opening', 'Additional_Loan', 'Interest', 'Repayment']].sum()
                if abs(debt_calc_senior_secured.loc[i, 'Closing']) < 1:
                    debt_calc_senior_secured.loc[i, 'Closing'] = 0.0
            else:
                debt_calc_senior_secured.loc[i, 'Opening'] = debt_calc_senior_secured.loc[i-1, 'Closing']
                debt_calc_senior_secured.loc[i, 'Additional_Loan'] = 0.0
                
                # Interest calculation - should be calculated on outstanding balance
                debt_calc_senior_secured.loc[i, 'Interest'] = debt_calc_senior_secured.loc[i, 'Opening'] * interest_rate_per_month_senior_secured
                
                # Repayment calculation
                if i <= amortization_m_senior_secured:
                    # During amortization period, no principal payments
                    debt_calc_senior_secured.loc[i, 'Repayment'] = 0.0
                else:
                    # After amortization period
                    if debt_calc_senior_secured.loc[i-1, 'Closing'] < 1:
                        debt_calc_senior_secured.loc[i, 'Repayment'] = 0.0
                    else:
                        if i > amortization_m_senior_secured and debt_calc_senior_secured.loc[i-1, 'Repayment'] == 0.0:
                            if flg_amort_senior_secured == 0:
                                out_aft_amortization_senior_secured = debt_calc_senior_secured.loc[i-1, 'Closing']
                                flg_amort_senior_secured = 1
                            debt_calc_senior_secured.loc[i, 'Repayment'] = npf.pmt(interest_rate_per_month_senior_secured, repayment_over_m_senior_secured, out_aft_amortization_senior_secured)
                        else:
                            debt_calc_senior_secured.loc[i, 'Repayment'] = debt_calc_senior_secured.loc[i-1, 'Repayment']
                
                debt_calc_senior_secured.loc[i, 'Closing'] = debt_calc_senior_secured.loc[i, ['Opening', 'Additional_Loan', 'Interest', 'Repayment']].sum()
                if abs(debt_calc_senior_secured.loc[i, 'Closing']) < 1:
                    debt_calc_senior_secured.loc[i, 'Closing'] = 0.0

        # Short Term calculation (matching Streamlit logic exactly)
        repayment_init_short_term = 0
        out_aft_amortization_short_term = debt_tranche1 + additional_loan_short_term
        flg_amort_short_term = 0

        for i in debt_calc_short_term.index:
            if i == 1:
                debt_calc_short_term.loc[i, 'Opening'] = debt_tranche1
                debt_calc_short_term.loc[i, 'Additional_Loan'] = additional_loan_short_term
                
                # Interest calculation - should be calculated on total outstanding balance
                debt_calc_short_term.loc[i, 'Interest'] = (debt_calc_short_term.loc[i, 'Opening'] + debt_calc_short_term.loc[i, 'Additional_Loan']) * interest_rate_per_month_short_term
                
                # Repayment calculation - during amortization period, no principal payments
                if i <= amortization_m_short_term:
                    debt_calc_short_term.loc[i, 'Repayment'] = 0.0
                else:
                    # After amortization period, calculate payment
                    if i > amortization_m_short_term and repayment_init_short_term == 0.0:
                        debt_calc_short_term.loc[i, 'Repayment'] = npf.pmt(interest_rate_per_month_short_term, repayment_over_m_short_term, out_aft_amortization_short_term)
                    else:
                        debt_calc_short_term.loc[i, 'Repayment'] = repayment_init_short_term
                
                debt_calc_short_term.loc[i, 'Closing'] = debt_calc_short_term.loc[i, ['Opening', 'Additional_Loan', 'Interest', 'Repayment']].sum()
                if abs(debt_calc_short_term.loc[i, 'Closing']) < 1:
                    debt_calc_short_term.loc[i, 'Closing'] = 0.0
            else:
                debt_calc_short_term.loc[i, 'Opening'] = debt_calc_short_term.loc[i-1, 'Closing']
                debt_calc_short_term.loc[i, 'Additional_Loan'] = 0.0
                
                # Interest calculation - should be calculated on outstanding balance
                debt_calc_short_term.loc[i, 'Interest'] = debt_calc_short_term.loc[i, 'Opening'] * interest_rate_per_month_short_term
                
                # Repayment calculation
                if i <= amortization_m_short_term:
                    # During amortization period, no principal payments
                    debt_calc_short_term.loc[i, 'Repayment'] = 0.0
                else:
                    # After amortization period
                    if debt_calc_short_term.loc[i-1, 'Closing'] < 1:
                        debt_calc_short_term.loc[i, 'Repayment'] = 0.0
                    else:
                        if i > amortization_m_short_term and debt_calc_short_term.loc[i-1, 'Repayment'] == 0.0:
                            if flg_amort_short_term == 0:
                                out_aft_amortization_short_term = debt_calc_short_term.loc[i-1, 'Closing']
                                flg_amort_short_term = 1
                            debt_calc_short_term.loc[i, 'Repayment'] = npf.pmt(interest_rate_per_month_short_term, repayment_over_m_short_term, out_aft_amortization_short_term)
                        else:
                            debt_calc_short_term.loc[i, 'Repayment'] = debt_calc_short_term.loc[i-1, 'Repayment']
                
                debt_calc_short_term.loc[i, 'Closing'] = debt_calc_short_term.loc[i, ['Opening', 'Additional_Loan', 'Interest', 'Repayment']].sum()
                if abs(debt_calc_short_term.loc[i, 'Closing']) < 1:
                    debt_calc_short_term.loc[i, 'Closing'] = 0.0

        # Combine results and save to database
        self.delete_existing_calculations(project_id)
        
        cumulative_interest = 0
        for i in range(1, 121):
            month = i
            year = (i - 1) // 12 + 1
            
            # Combine Senior Secured and Short Term results
            opening_balance = debt_calc_senior_secured.loc[i, 'Opening'] + debt_calc_short_term.loc[i, 'Opening']
            payment = debt_calc_senior_secured.loc[i, 'Repayment'] + debt_calc_short_term.loc[i, 'Repayment']
            interest_payment = debt_calc_senior_secured.loc[i, 'Interest'] + debt_calc_short_term.loc[i, 'Interest']
            principal_payment = debt_calc_senior_secured.loc[i, 'Repayment'] + debt_calc_short_term.loc[i, 'Repayment']
            closing_balance = debt_calc_senior_secured.loc[i, 'Closing'] + debt_calc_short_term.loc[i, 'Closing']
            
            cumulative_interest += interest_payment

            # Save to database
            calculation_data = {
                'project_id': project_id,
                'month': month,
                'year': year,
                'opening_balance': round(opening_balance, 2),
                'payment': round(payment, 2),
                'interest_payment': round(interest_payment, 2),
                'principal_payment': round(principal_payment, 2),
                'closing_balance': round(closing_balance, 2),
                'cumulative_interest': round(cumulative_interest, 2),
                'calculation_run_id': calculation_run_id
            }
            
            self.insert_calculation(calculation_data)

        return {
            'success': True,
            'total_months': 120,
            'total_principal': round(opening_balance, 2),
            'total_interest': round(cumulative_interest, 2),
            'final_balance': round(closing_balance, 2)
        }

def main():
    """Main function to run the calculation"""
    if len(sys.argv) < 2:
        print("Usage: python calculate_debt_schedule.py <project_id> [calculation_run_id]")
        sys.exit(1)
    
    project_id = sys.argv[1]
    calculation_run_id = sys.argv[2] if len(sys.argv) > 2 else None
    calculator = DebtScheduleCalculator()
    
    try:
        result = calculator.calculate_debt_schedule(project_id, calculation_run_id)
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()
