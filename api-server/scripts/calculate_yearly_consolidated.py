#!/usr/bin/env python3

import sys
import json
import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime
import argparse

class YearlyConsolidatedCalculator:
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

    def calculate_yearly_consolidated(self, project_id, calculation_run_id):
        """Calculate yearly consolidated financial statements from monthly data"""
        try:
            # Get monthly data using the latest monthly calculation run
            monthly_data = self.get_monthly_consolidated_data(project_id, None)  # Get latest monthly data
            
            if not monthly_data:
                raise ValueError("Monthly consolidated data not found")
            
            # Group monthly data by year
            yearly_data = []
            
            for year in range(1, 11):  # 10 years
                # Get months for this year (take only first 12 months to avoid duplicates)
                year_months = [m for m in monthly_data if m['year'] == year][:12]
                
                if not year_months:
                    continue
                
                # Sum flow items (revenue, costs, etc.)
                revenue = sum(m['revenue'] for m in year_months)
                cost_of_goods_sold = sum(m['cost_of_goods_sold'] for m in year_months)
                gross_profit = sum(m['gross_profit'] for m in year_months)
                operating_expenses = sum(m['operating_expenses'] for m in year_months)
                ebitda = sum(m['ebitda'] for m in year_months)
                depreciation = sum(m['depreciation'] for m in year_months)
                interest_expense = sum(m['interest_expense'] for m in year_months)
                net_income_before_tax = sum(m['net_income_before_tax'] for m in year_months)
                income_tax_expense = sum(m['income_tax_expense'] for m in year_months)
                net_income = sum(m['net_income'] for m in year_months)
                
                # Cash flow items
                net_cash_operating = sum(m['net_cash_operating'] for m in year_months)
                capital_expenditures = sum(m['capital_expenditures'] for m in year_months)
                net_cash_investing = sum(m['net_cash_investing'] for m in year_months)
                proceeds_debt = sum(m['proceeds_debt'] for m in year_months)
                repayment_debt = sum(m['repayment_debt'] for m in year_months)
                net_cash_financing = sum(m['net_cash_financing'] for m in year_months)
                net_cash_flow = sum(m['net_cash_flow'] for m in year_months)
                
                # Take balance sheet items from last month of year (end of period)
                last_month = year_months[-1]
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
                
                yearly_data.append({
                    'year': year,
                    
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
            self.save_yearly_consolidated(project_id, calculation_run_id, yearly_data)
            
            return {
                'success': True,
                'total_years': len(yearly_data),
                'yearly_data': yearly_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def save_yearly_consolidated(self, project_id, calculation_run_id, yearly_data):
        """Save yearly consolidated data to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing calculations for this project
            cursor.execute("DELETE FROM yearly_consolidated WHERE project_id = %s", (project_id,))
            
            # Insert new calculations
            for row in yearly_data:
                cursor.execute("""
                    INSERT INTO yearly_consolidated (
                        project_id, year, revenue, cost_of_goods_sold, gross_profit,
                        operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                        income_tax_expense, net_income, cash, accounts_receivable, inventory,
                        other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                        senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                        net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                        repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id, row['year'],
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
    parser = argparse.ArgumentParser(description='Calculate yearly consolidated financial statements')
    parser.add_argument('project_id', help='Project ID')
    parser.add_argument('calculation_run_id', help='Calculation run ID')
    
    args = parser.parse_args()
    
    # Load environment variables
    from dotenv import load_dotenv
    import os
    load_dotenv()
    
    # Database configuration from environment variables
    db_config = {
        'host': os.getenv('POSTGRESQL_HOST', 'localhost'),
        'port': int(os.getenv('POSTGRESQL_PORT', '5432')),
        'database': os.getenv('POSTGRESQL_DATABASE', 'refi_wizard'),
        'user': os.getenv('POSTGRESQL_USER', 'postgres'),
        'password': os.getenv('POSTGRESQL_PASSWORD', 'postgres')
    }
    
    # Create calculator and perform calculation
    calculator = YearlyConsolidatedCalculator(db_config)
    result = calculator.calculate_yearly_consolidated(args.project_id, args.calculation_run_id)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main() 