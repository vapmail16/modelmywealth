#!/usr/bin/env python3

import sys
import json
import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime
import argparse

class MonthlyConsolidatedCalculator:
    def __init__(self, db_config):
        self.db_config = db_config

    def get_connection(self):
        return psycopg2.connect(**self.db_config)

    def get_balance_sheet_data(self, project_id):
        """Get balance sheet data for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT cash, accounts_receivable, inventory, other_current_assets, ppe, other_assets,
                       accounts_payable, senior_secured, debt_tranche1, total_equity, retained_earnings
                FROM balance_sheet_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """, (project_id,))
            result = cursor.fetchone()
            
            if not result:
                raise ValueError("Balance sheet data not found")
            
            return {
                'cash': float(result[0]) if result[0] else 0,
                'accounts_receivable': float(result[1]) if result[1] else 0,
                'inventory': float(result[2]) if result[2] else 0,
                'other_current_assets': float(result[3]) if result[3] else 0,
                'ppe': float(result[4]) if result[4] else 0,
                'other_assets': float(result[5]) if result[5] else 0,
                'accounts_payable': float(result[6]) if result[6] else 0,
                'senior_secured': float(result[7]) if result[7] else 0,
                'debt_tranche1': float(result[8]) if result[8] else 0,
                'equity': float(result[9]) if result[9] else 0,  # total_equity from DB
                'retained_earning': float(result[10]) if result[10] else 0  # retained_earnings from DB
            }

    def get_profit_loss_data(self, project_id):
        """Get profit loss data for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT revenue, cogs, operating_expenses, depreciation, interest_expense, taxes
                FROM profit_loss_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """, (project_id,))
            result = cursor.fetchone()
            
            if not result:
                raise ValueError("Profit loss data not found")
            
            return {
                'revenue': float(result[0]) if result[0] else 0,
                'cost_of_goods_sold': float(result[1]) if result[1] else 0,  # cogs from DB
                'operating_expenses': float(result[2]) if result[2] else 0,
                'depreciation': float(result[3]) if result[3] else 0,
                'interest_expense': float(result[4]) if result[4] else 0,
                'income_tax_expense': float(result[5]) if result[5] else 0  # taxes from DB
            }

    def get_debt_calculations(self, project_id):
        """Get debt calculations for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT month, year, opening_balance, payment, interest_payment, closing_balance, cumulative_interest
                FROM debt_calculations 
                WHERE project_id = %s 
                ORDER BY month
            """, (project_id,))
            results = cursor.fetchall()
            
            if not results:
                return []
            
            return [
                {
                    'month': row[0],
                    'year': row[1],
                    'opening_balance': float(row[2]) if row[2] else 0,
                    'payment': float(row[3]) if row[3] else 0,
                    'interest': float(row[4]) if row[4] else 0,  # interest_payment from DB
                    'closing_balance': float(row[5]) if row[5] else 0,
                    'additional_loan': 0,  # Not available in DB
                    'total_repayment': float(row[6]) if row[6] else 0  # cumulative_interest from DB
                }
                for row in results
            ]

    def get_depreciation_schedule(self, project_id):
        """Get depreciation schedule for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT month, year, asset_value, monthly_depreciation, accumulated_depreciation, net_book_value
                FROM depreciation_schedule 
                WHERE project_id = %s 
                ORDER BY month
            """, (project_id,))
            results = cursor.fetchall()
            
            if not results:
                return []
            
            return [
                {
                    'month': row[0],
                    'year': row[1],
                    'asset_value': float(row[2]) if row[2] else 0,
                    'monthly_depreciation': float(row[3]) if row[3] else 0,
                    'accumulated_depreciation': float(row[4]) if row[4] else 0,
                    'net_book_value': float(row[5]) if row[5] else 0,
                    'capex_addition': 0  # Not available in DB
                }
                for row in results
            ]

    def calculate_monthly_consolidated(self, project_id, calculation_run_id):
        """Calculate monthly consolidated financial statements"""
        try:
            # Get input data
            balance_sheet_data = self.get_balance_sheet_data(project_id)
            profit_loss_data = self.get_profit_loss_data(project_id)
            debt_calculations = self.get_debt_calculations(project_id)
            depreciation_schedule = self.get_depreciation_schedule(project_id)
            
            if not debt_calculations or not depreciation_schedule:
                raise ValueError("Debt calculations or depreciation schedule not found")
            
            # Create monthly consolidated data
            monthly_data = []
            
            for month in range(1, 121):  # 120 months (10 years)
                year = ((month - 1) // 12) + 1
                month_in_year = ((month - 1) % 12) + 1
                
                # Get debt calculation for this month
                debt_data = next((d for d in debt_calculations if d['month'] == month), None)
                if not debt_data:
                    continue
                
                # Get depreciation data for this month
                dep_data = next((d for d in depreciation_schedule if d['month'] == month), None)
                if not dep_data:
                    continue
                
                # Calculate P&L items
                revenue = round(profit_loss_data['revenue'], 2)
                cost_of_goods_sold = round(profit_loss_data['cost_of_goods_sold'], 2)
                gross_profit = round(revenue - cost_of_goods_sold, 2)
                operating_expenses = round(profit_loss_data['operating_expenses'], 2)
                ebitda = round(gross_profit - operating_expenses, 2)
                depreciation = round(dep_data['monthly_depreciation'], 2)
                interest_expense = round(debt_data['interest'], 2)
                net_income_before_tax = round(ebitda - depreciation - interest_expense, 2)
                income_tax_expense = round(profit_loss_data['income_tax_expense'], 2)
                net_income = round(net_income_before_tax - income_tax_expense, 2)
                
                # Calculate Balance Sheet items
                cash = round(balance_sheet_data['cash'], 2)
                accounts_receivable = round(balance_sheet_data['accounts_receivable'], 2)
                inventory = round(balance_sheet_data['inventory'], 2)
                other_current_assets = round(balance_sheet_data['other_current_assets'], 2)
                ppe_net = round(dep_data['net_book_value'], 2)
                other_assets = round(balance_sheet_data['other_assets'], 2)
                total_assets = round(cash + accounts_receivable + inventory + other_current_assets + ppe_net + other_assets, 2)
                
                accounts_payable = round(balance_sheet_data['accounts_payable'], 2)
                senior_secured = round(balance_sheet_data['senior_secured'], 2)
                debt_tranche1 = round(balance_sheet_data['debt_tranche1'], 2)
                equity = round(balance_sheet_data['equity'], 2)
                retained_earning = round(balance_sheet_data['retained_earning'], 2)
                total_equity_liability = round(accounts_payable + senior_secured + debt_tranche1 + equity + retained_earning, 2)
                
                # Calculate Cash Flow items
                net_cash_operating = round(net_income + depreciation, 2)
                capital_expenditures = 0  # Not available in input data
                net_cash_investing = round(-capital_expenditures, 2)
                proceeds_debt = round(debt_data['additional_loan'], 2)
                repayment_debt = round(debt_data['payment'], 2)
                net_cash_financing = round(proceeds_debt - repayment_debt, 2)
                net_cash_flow = round(net_cash_operating + net_cash_investing + net_cash_financing, 2)
                
                # Create monthly record
                month_name = datetime(2020 + year - 1, month_in_year, 1).strftime('%B %Y')
                
                monthly_record = {
                    'project_id': project_id,
                    'month': month,
                    'year': year,
                    'month_name': month_name,
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
                    'net_cash_operating': net_cash_operating,
                    'capital_expenditures': capital_expenditures,
                    'net_cash_investing': net_cash_investing,
                    'proceeds_debt': proceeds_debt,
                    'repayment_debt': repayment_debt,
                    'net_cash_financing': net_cash_financing,
                    'net_cash_flow': net_cash_flow,
                    'calculation_run_id': calculation_run_id
                }
                
                monthly_data.append(monthly_record)
            
            return {
                'success': True,
                'total_months': len(monthly_data),
                'data': monthly_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def save_monthly_consolidated(self, project_id, calculation_run_id, monthly_data):
        """Save monthly consolidated data to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing data for this calculation run
            cursor.execute("""
                DELETE FROM monthly_consolidated 
                WHERE project_id = %s AND calculation_run_id = %s
            """, (project_id, calculation_run_id))
            
            # Insert new data
            for record in monthly_data:
                cursor.execute("""
                    INSERT INTO monthly_consolidated (
                        project_id, month, year, month_name, revenue, cost_of_goods_sold, gross_profit,
                        operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                        income_tax_expense, net_income, cash, accounts_receivable, inventory,
                        other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                        senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                        net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                        repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                    )
                """, (
                    record['project_id'], record['month'], record['year'], record['month_name'],
                    record['revenue'], record['cost_of_goods_sold'], record['gross_profit'],
                    record['operating_expenses'], record['ebitda'], record['depreciation'],
                    record['interest_expense'], record['net_income_before_tax'], record['income_tax_expense'],
                    record['net_income'], record['cash'], record['accounts_receivable'], record['inventory'],
                    record['other_current_assets'], record['ppe_net'], record['other_assets'], record['total_assets'],
                    record['accounts_payable'], record['senior_secured'], record['debt_tranche1'], record['equity'],
                    record['retained_earning'], record['total_equity_liability'], record['net_cash_operating'],
                    record['capital_expenditures'], record['net_cash_investing'], record['proceeds_debt'],
                    record['repayment_debt'], record['net_cash_financing'], record['net_cash_flow'], record['calculation_run_id']
                ))
            
            conn.commit()

def main():
    parser = argparse.ArgumentParser(description='Calculate monthly consolidated financial statements')
    parser.add_argument('project_id', help='Project ID')
    parser.add_argument('calculation_run_id', help='Calculation Run ID')
    parser.add_argument('--host', default=None, help='Database host')
    parser.add_argument('--port', default=None, type=int, help='Database port')
    parser.add_argument('--database', default=None, help='Database name')
    parser.add_argument('--user', default=None, help='Database user')
    parser.add_argument('--password', default=None, help='Database password')
    
    args = parser.parse_args()
    
    # Load environment variables as fallback
    from dotenv import load_dotenv
    import os
    load_dotenv()
    
    db_config = {
        'host': args.host or os.getenv('POSTGRESQL_HOST', 'localhost'),
        'port': args.port or int(os.getenv('POSTGRESQL_PORT', '5432')),
        'database': args.database or os.getenv('POSTGRESQL_DB', 'refi_wizard'),
        'user': args.user or os.getenv('POSTGRESQL_USER', 'postgres'),
        'password': args.password or os.getenv('POSTGRESQL_PASSWORD', ''),
    }
    
    calculator = MonthlyConsolidatedCalculator(db_config)
    
    # Calculate monthly consolidated data
    result = calculator.calculate_monthly_consolidated(args.project_id, args.calculation_run_id)
    
    if result['success']:
        # Save to database
        calculator.save_monthly_consolidated(args.project_id, args.calculation_run_id, result['data'])
        print(json.dumps({
            'success': True,
            'total_months': result['total_months'],
            'message': f'Successfully calculated {result["total_months"]} months of consolidated data'
        }))
    else:
        print(json.dumps({
            'success': False,
            'error': result['error']
        }))
        sys.exit(1)

if __name__ == '__main__':
    main() 