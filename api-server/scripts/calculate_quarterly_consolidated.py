#!/usr/bin/env python3

import sys
import json
import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime
import argparse

class QuarterlyConsolidatedCalculator:
    def __init__(self, db_config):
        self.db_config = db_config

    def get_connection(self):
        return psycopg2.connect(**self.db_config)

    def get_monthly_consolidated_data(self, project_id, calculation_run_id):
        """Get monthly consolidated data for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            if calculation_run_id:
                cursor.execute("""
                    SELECT month, year, month_name, revenue, cost_of_goods_sold, gross_profit,
                           operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                           income_tax_expense, net_income, cash, accounts_receivable, inventory,
                           other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                           senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                           net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                           repayment_debt, net_cash_financing, net_cash_flow
                    FROM monthly_consolidated 
                    WHERE project_id = %s AND calculation_run_id = %s
                    ORDER BY month
                """, (project_id, calculation_run_id))
            else:
                cursor.execute("""
                    SELECT month, year, month_name, revenue, cost_of_goods_sold, gross_profit,
                           operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                           income_tax_expense, net_income, cash, accounts_receivable, inventory,
                           other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                           senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                           net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                           repayment_debt, net_cash_financing, net_cash_flow
                    FROM monthly_consolidated 
                    WHERE project_id = %s
                    ORDER BY calculation_run_id DESC, month
                """, (project_id,))
            results = cursor.fetchall()
            
            if not results:
                return []
            
            return [
                {
                    'month': row[0],
                    'year': row[1],
                    'month_name': row[2],
                    'revenue': float(row[3]) if row[3] else 0,
                    'cost_of_goods_sold': float(row[4]) if row[4] else 0,
                    'gross_profit': float(row[5]) if row[5] else 0,
                    'operating_expenses': float(row[6]) if row[6] else 0,
                    'ebitda': float(row[7]) if row[7] else 0,
                    'depreciation': float(row[8]) if row[8] else 0,
                    'interest_expense': float(row[9]) if row[9] else 0,
                    'net_income_before_tax': float(row[10]) if row[10] else 0,
                    'income_tax_expense': float(row[11]) if row[11] else 0,
                    'net_income': float(row[12]) if row[12] else 0,
                    'cash': float(row[13]) if row[13] else 0,
                    'accounts_receivable': float(row[14]) if row[14] else 0,
                    'inventory': float(row[15]) if row[15] else 0,
                    'other_current_assets': float(row[16]) if row[16] else 0,
                    'ppe_net': float(row[17]) if row[17] else 0,
                    'other_assets': float(row[18]) if row[18] else 0,
                    'total_assets': float(row[19]) if row[19] else 0,
                    'accounts_payable': float(row[20]) if row[20] else 0,
                    'senior_secured': float(row[21]) if row[21] else 0,
                    'debt_tranche1': float(row[22]) if row[22] else 0,
                    'equity': float(row[23]) if row[23] else 0,
                    'retained_earning': float(row[24]) if row[24] else 0,
                    'total_equity_liability': float(row[25]) if row[25] else 0,
                    'net_cash_operating': float(row[26]) if row[26] else 0,
                    'capital_expenditures': float(row[27]) if row[27] else 0,
                    'net_cash_investing': float(row[28]) if row[28] else 0,
                    'proceeds_debt': float(row[29]) if row[29] else 0,
                    'repayment_debt': float(row[30]) if row[30] else 0,
                    'net_cash_financing': float(row[31]) if row[31] else 0,
                    'net_cash_flow': float(row[32]) if row[32] else 0
                }
                for row in results
            ]

    def calculate_quarterly_consolidated(self, project_id, calculation_run_id):
        """Calculate quarterly consolidated financial statements from monthly data"""
        try:
            # Get monthly data using the latest monthly calculation run
            monthly_data = self.get_monthly_consolidated_data(project_id, None)  # Get latest monthly data
            
            if not monthly_data:
                raise ValueError("Monthly consolidated data not found")
            
            # Group monthly data by quarter
            quarterly_data = []
            
            for year in range(1, 11):  # 10 years
                for quarter in range(1, 5):  # 4 quarters per year
                    # Calculate month range for this quarter
                    start_month = (year - 1) * 12 + (quarter - 1) * 3 + 1
                    end_month = start_month + 2
                    
                    # Get months for this quarter (take only first occurrence to avoid duplicates)
                    quarter_months = [m for m in monthly_data if m['month'] >= start_month and m['month'] <= end_month][:3]
                    
                    if not quarter_months:
                        continue
                    
                    # Aggregate quarterly data
                    quarter_name = f"Q{quarter}"
                    
                    # Sum flow items (revenue, costs, etc.)
                    revenue = round(sum(m['revenue'] for m in quarter_months), 2)
                    cost_of_goods_sold = round(sum(m['cost_of_goods_sold'] for m in quarter_months), 2)
                    gross_profit = round(sum(m['gross_profit'] for m in quarter_months), 2)
                    operating_expenses = round(sum(m['operating_expenses'] for m in quarter_months), 2)
                    ebitda = round(sum(m['ebitda'] for m in quarter_months), 2)
                    depreciation = round(sum(m['depreciation'] for m in quarter_months), 2)
                    interest_expense = round(sum(m['interest_expense'] for m in quarter_months), 2)
                    net_income_before_tax = round(sum(m['net_income_before_tax'] for m in quarter_months), 2)
                    income_tax_expense = round(sum(m['income_tax_expense'] for m in quarter_months), 2)
                    net_income = round(sum(m['net_income'] for m in quarter_months), 2)
                    
                    # Cash flow items
                    net_cash_operating = round(sum(m['net_cash_operating'] for m in quarter_months), 2)
                    capital_expenditures = round(sum(m['capital_expenditures'] for m in quarter_months), 2)
                    net_cash_investing = round(sum(m['net_cash_investing'] for m in quarter_months), 2)
                    proceeds_debt = round(sum(m['proceeds_debt'] for m in quarter_months), 2)
                    repayment_debt = round(sum(m['repayment_debt'] for m in quarter_months), 2)
                    net_cash_financing = round(sum(m['net_cash_financing'] for m in quarter_months), 2)
                    net_cash_flow = round(sum(m['net_cash_flow'] for m in quarter_months), 2)
                    
                    # Take balance sheet items from last month of quarter (end of period)
                    last_month = quarter_months[-1]
                    cash = last_month['cash']
                    accounts_receivable = last_month['accounts_receivable']
                    inventory = last_month['inventory']
                    other_current_assets = last_month['other_current_assets']
                    ppe_net = last_month['ppe_net']
                    other_assets = last_month['other_assets']
                    total_assets = last_month['total_assets']
                    accounts_payable = last_month['accounts_payable']
                    senior_secured = last_month['senior_secured']
                    debt_tranche1 = last_month['debt_tranche1']
                    equity = last_month['equity']
                    retained_earning = last_month['retained_earning']
                    total_equity_liability = last_month['total_equity_liability']
                    
                    quarterly_data.append({
                        'quarter': quarter,
                        'year': year,
                        'quarter_name': quarter_name,
                        
                        # Profit & Loss (summed)
                        'revenue': revenue,
                        'cost_of_goods_sold': cost_of_goods_sold,
                        'gross_profit': gross_profit,
                        'operating_expenses': operating_expenses,
                        'ebitda': ebitda,
                        'depreciation': depreciation,
                        'interest_expense': interest_expense,
                        'net_income_before_tax': net_income_before_tax,
                        'income_tax_expense': income_tax_expense,
                        'net_income': net_income,
                        
                        # Balance Sheet (end of period)
                        'cash': cash,
                        'accounts_receivable': accounts_receivable,
                        'inventory': inventory,
                        'other_current_assets': other_current_assets,
                        'ppe_net': ppe_net,
                        'other_assets': other_assets,
                        'total_assets': total_assets,
                        'accounts_payable': accounts_payable,
                        'senior_secured': senior_secured,
                        'debt_tranche1': debt_tranche1,
                        'equity': equity,
                        'retained_earning': retained_earning,
                        'total_equity_liability': total_equity_liability,
                        
                        # Cash Flow (summed)
                        'net_cash_operating': net_cash_operating,
                        'capital_expenditures': capital_expenditures,
                        'net_cash_investing': net_cash_investing,
                        'proceeds_debt': proceeds_debt,
                        'repayment_debt': repayment_debt,
                        'net_cash_financing': net_cash_financing,
                        'net_cash_flow': net_cash_flow
                    })
            
            # Save to database using the calculation run ID from the service
            self.save_quarterly_consolidated(project_id, calculation_run_id, quarterly_data)
            
            return {
                'success': True,
                'total_quarters': len(quarterly_data),
                'quarterly_data': quarterly_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def save_quarterly_consolidated(self, project_id, calculation_run_id, quarterly_data):
        """Save quarterly consolidated data to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing calculations for this project
            cursor.execute("DELETE FROM quarterly_consolidated WHERE project_id = %s", (project_id,))
            
            # Insert new calculations
            for row in quarterly_data:
                cursor.execute("""
                    INSERT INTO quarterly_consolidated (
                        project_id, quarter, year, quarter_name, revenue, cost_of_goods_sold, gross_profit,
                        operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                        income_tax_expense, net_income, cash, accounts_receivable, inventory,
                        other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                        senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                        net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                        repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id, row['quarter'], row['year'], row['quarter_name'],
                    row['revenue'], row['cost_of_goods_sold'], row['gross_profit'],
                    row['operating_expenses'], row['ebitda'], row['depreciation'],
                    row['interest_expense'], row['net_income_before_tax'], row['income_tax_expense'],
                    row['net_income'], row['cash'], row['accounts_receivable'], row['inventory'],
                    row['other_current_assets'], row['ppe_net'], row['other_assets'], row['total_assets'],
                    row['accounts_payable'], row['senior_secured'], row['debt_tranche1'], row['equity'],
                    row['retained_earning'], row['total_equity_liability'], row['net_cash_operating'],
                    row['capital_expenditures'], row['net_cash_investing'], row['proceeds_debt'],
                    row['repayment_debt'], row['net_cash_financing'], row['net_cash_flow'], calculation_run_id
                ))
            
            conn.commit()

def main():
    parser = argparse.ArgumentParser(description='Calculate quarterly consolidated financial statements')
    parser.add_argument('project_id', help='Project ID')
    parser.add_argument('calculation_run_id', help='Calculation run ID')
    
    args = parser.parse_args()
    
    # Database configuration
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'refi_wizard',
        'user': 'postgres',
        'password': 'postgres'
    }
    
    # Create calculator and perform calculation
    calculator = QuarterlyConsolidatedCalculator(db_config)
    result = calculator.calculate_quarterly_consolidated(args.project_id, args.calculation_run_id)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main() 