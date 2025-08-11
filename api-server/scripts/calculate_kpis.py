#!/usr/bin/env python3
"""
KPI Calculation Script
Calculates Key Performance Indicators from consolidated financial data
"""

import sys
import os
import argparse
import psycopg2
import pandas as pd
from datetime import datetime
from decimal import Decimal

class KPICalculator:
    def __init__(self, db_host, db_port, db_name, db_user, db_password):
        self.db_config = {
            'host': db_host,
            'port': db_port,
            'database': db_name,
            'user': db_user,
            'password': db_password
        }
    
    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)
    
    def get_monthly_consolidated_data(self, project_id, calculation_run_id=None):
        """Get monthly consolidated data for KPI calculations"""
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
                    ORDER BY year, month
                """, (project_id, calculation_run_id))
            else:
                cursor.execute("""
                    SELECT mc.month, mc.year, mc.month_name, mc.revenue, mc.cost_of_goods_sold, mc.gross_profit,
                           mc.operating_expenses, mc.ebitda, mc.depreciation, mc.interest_expense, mc.net_income_before_tax,
                           mc.income_tax_expense, mc.net_income, mc.cash, mc.accounts_receivable, mc.inventory,
                           mc.other_current_assets, mc.ppe_net, mc.other_assets, mc.total_assets, mc.accounts_payable,
                           mc.senior_secured, mc.debt_tranche1, mc.equity, mc.retained_earning, mc.total_equity_liability,
                           mc.net_cash_operating, mc.capital_expenditures, mc.net_cash_investing, mc.proceeds_debt,
                           mc.repayment_debt, mc.net_cash_financing, mc.net_cash_flow
                    FROM monthly_consolidated mc
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM monthly_consolidated 
                        WHERE project_id = %s 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON mc.calculation_run_id = latest.calculation_run_id
                    WHERE mc.project_id = %s
                    ORDER BY mc.year, mc.month
                """, (project_id, project_id))
            
            results = cursor.fetchall()
            
            if not results:
                return []
            
            columns = ['month', 'year', 'month_name', 'revenue', 'cost_of_goods_sold', 'gross_profit',
                      'operating_expenses', 'ebitda', 'depreciation', 'interest_expense', 'net_income_before_tax',
                      'income_tax_expense', 'net_income', 'cash', 'accounts_receivable', 'inventory',
                      'other_current_assets', 'ppe_net', 'other_assets', 'total_assets', 'accounts_payable',
                      'senior_secured', 'debt_tranche1', 'equity', 'retained_earning', 'total_equity_liability',
                      'net_cash_operating', 'capital_expenditures', 'net_cash_investing', 'proceeds_debt',
                      'repayment_debt', 'net_cash_financing', 'net_cash_flow']
            
            return [dict(zip(columns, row)) for row in results]
    
    def calculate_monthly_kpis(self, project_id, calculation_run_id, save_run_id=None):
        """Calculate monthly KPIs from consolidated data"""
        try:
            # Use None to get latest consolidated data, but use calculation_run_id for saving
            monthly_data = self.get_monthly_consolidated_data(project_id, None)
            
            # Use save_run_id if provided, otherwise use calculation_run_id
            save_id = save_run_id if save_run_id else calculation_run_id
            
            if not monthly_data:
                raise ValueError("Monthly consolidated data not found")
            
            kpi_data = []
            
            for row in monthly_data:
                # Convert to float for calculations
                revenue = float(row['revenue']) if row['revenue'] else 0
                ebitda = float(row['ebitda']) if row['ebitda'] else 0
                depreciation = float(row['depreciation']) if row['depreciation'] else 0
                interest_expense = float(row['interest_expense']) if row['interest_expense'] else 0
                senior_secured = float(row['senior_secured']) if row['senior_secured'] else 0
                debt_tranche1 = float(row['debt_tranche1']) if row['debt_tranche1'] else 0
                ppe_net = float(row['ppe_net']) if row['ppe_net'] else 0
                cash = float(row['cash']) if row['cash'] else 0
                accounts_receivable = float(row['accounts_receivable']) if row['accounts_receivable'] else 0
                inventory = float(row['inventory']) if row['inventory'] else 0
                other_current_assets = float(row['other_current_assets']) if row['other_current_assets'] else 0
                other_assets = float(row['other_assets']) if row['other_assets'] else 0
                accounts_payable = float(row['accounts_payable']) if row['accounts_payable'] else 0
                equity = float(row['equity']) if row['equity'] else 0
                retained_earning = float(row['retained_earning']) if row['retained_earning'] else 0
                repayment_debt = float(row['repayment_debt']) if row['repayment_debt'] else 0
                net_cash_operating = float(row['net_cash_operating']) if row['net_cash_operating'] else 0
                net_cash_investing = float(row['net_cash_investing']) if row['net_cash_investing'] else 0
                net_cash_financing = float(row['net_cash_financing']) if row['net_cash_financing'] else 0
                cost_of_goods_sold = float(row['cost_of_goods_sold']) if row['cost_of_goods_sold'] else 0
                
                # Calculate KPIs
                kpi_row = {
                    'month': row['month'],
                    'year': row['year'],
                    'month_name': row['month_name'],
                    
                    # Debt-related KPIs
                    'debt_to_ebitda': round((senior_secured + debt_tranche1) / ebitda, 4) if ebitda != 0 else 0,
                    'debt_service_coverage_ratio': round(ebitda / abs(repayment_debt), 4) if repayment_debt != 0 else 0,
                    'loan_to_value_ratio': round((senior_secured + debt_tranche1) / ppe_net, 4) if ppe_net != 0 else 0,
                    'interest_coverage_ratio': round((ebitda + depreciation) / abs(interest_expense), 4) if interest_expense != 0 else 0,
                    
                    # Liquidity KPIs
                    'current_ratio': round((cash + accounts_receivable + inventory + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    'quick_ratio': round((cash + accounts_receivable + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    
                    # Leverage KPIs
                    'debt_to_equity_ratio': round((senior_secured + debt_tranche1) / (equity + retained_earning), 4) if (equity + retained_earning) != 0 else 0,
                    
                    # Profitability KPIs
                    'operating_margin': round(ebitda / revenue, 4) if revenue != 0 else 0,
                    
                    # Cash Flow KPIs
                    'fcff': round(net_cash_operating + net_cash_investing, 2),
                    'fcfe': round(net_cash_operating + net_cash_investing + net_cash_financing, 2),
                    
                    # Working Capital KPIs
                    'ar_cycle_days': round(365 * accounts_receivable / revenue, 2) if revenue != 0 else 0,
                    'inventory_cycle_days': round(365 * inventory / abs(cost_of_goods_sold), 2) if cost_of_goods_sold != 0 else 0
                }
                
                kpi_data.append(kpi_row)
            
            # Save to database
            self.save_monthly_kpis(project_id, save_id, kpi_data)
            
            return {"success": True, "message": f"Calculated {len(kpi_data)} monthly KPIs"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def calculate_quarterly_kpis(self, project_id, calculation_run_id, save_run_id=None):
        """Calculate quarterly KPIs from consolidated data"""
        try:
            # Get quarterly consolidated data - always use None to get latest data
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT qc.quarter, qc.year, qc.quarter_name, qc.revenue, qc.cost_of_goods_sold, qc.gross_profit,
                           qc.operating_expenses, qc.ebitda, qc.depreciation, qc.interest_expense, qc.net_income_before_tax,
                           qc.income_tax_expense, qc.net_income, qc.cash, qc.accounts_receivable, qc.inventory,
                           qc.other_current_assets, qc.ppe_net, qc.other_assets, qc.total_assets, qc.accounts_payable,
                           qc.senior_secured, qc.debt_tranche1, qc.equity, qc.retained_earning, qc.total_equity_liability,
                           qc.net_cash_operating, qc.capital_expenditures, qc.net_cash_investing, qc.proceeds_debt,
                           qc.repayment_debt, qc.net_cash_financing, qc.net_cash_flow
                    FROM quarterly_consolidated qc
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM quarterly_consolidated 
                        WHERE project_id = %s 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON qc.calculation_run_id = latest.calculation_run_id
                    WHERE qc.project_id = %s
                    ORDER BY qc.year, qc.quarter
                """, (project_id, project_id))
                
                results = cursor.fetchall()
                
                if not results:
                    raise ValueError("Quarterly consolidated data not found")
                
                columns = ['quarter', 'year', 'quarter_name', 'revenue', 'cost_of_goods_sold', 'gross_profit',
                          'operating_expenses', 'ebitda', 'depreciation', 'interest_expense', 'net_income_before_tax',
                          'income_tax_expense', 'net_income', 'cash', 'accounts_receivable', 'inventory',
                          'other_current_assets', 'ppe_net', 'other_assets', 'total_assets', 'accounts_payable',
                          'senior_secured', 'debt_tranche1', 'equity', 'retained_earning', 'total_equity_liability',
                          'net_cash_operating', 'capital_expenditures', 'net_cash_investing', 'proceeds_debt',
                          'repayment_debt', 'net_cash_financing', 'net_cash_flow']
                
                quarterly_data = [dict(zip(columns, row)) for row in results]
            
            kpi_data = []
            
            for row in quarterly_data:
                # Convert to float for calculations
                revenue = float(row['revenue']) if row['revenue'] else 0
                ebitda = float(row['ebitda']) if row['ebitda'] else 0
                depreciation = float(row['depreciation']) if row['depreciation'] else 0
                interest_expense = float(row['interest_expense']) if row['interest_expense'] else 0
                senior_secured = float(row['senior_secured']) if row['senior_secured'] else 0
                debt_tranche1 = float(row['debt_tranche1']) if row['debt_tranche1'] else 0
                ppe_net = float(row['ppe_net']) if row['ppe_net'] else 0
                cash = float(row['cash']) if row['cash'] else 0
                accounts_receivable = float(row['accounts_receivable']) if row['accounts_receivable'] else 0
                inventory = float(row['inventory']) if row['inventory'] else 0
                other_current_assets = float(row['other_current_assets']) if row['other_current_assets'] else 0
                other_assets = float(row['other_assets']) if row['other_assets'] else 0
                accounts_payable = float(row['accounts_payable']) if row['accounts_payable'] else 0
                equity = float(row['equity']) if row['equity'] else 0
                retained_earning = float(row['retained_earning']) if row['retained_earning'] else 0
                repayment_debt = float(row['repayment_debt']) if row['repayment_debt'] else 0
                net_cash_operating = float(row['net_cash_operating']) if row['net_cash_operating'] else 0
                net_cash_investing = float(row['net_cash_investing']) if row['net_cash_investing'] else 0
                net_cash_financing = float(row['net_cash_financing']) if row['net_cash_financing'] else 0
                cost_of_goods_sold = float(row['cost_of_goods_sold']) if row['cost_of_goods_sold'] else 0
                
                # Calculate KPIs (same formulas as monthly)
                kpi_row = {
                    'quarter': row['quarter'],
                    'year': row['year'],
                    'quarter_name': row['quarter_name'],
                    
                    # Debt-related KPIs
                    'debt_to_ebitda': round((senior_secured + debt_tranche1) / ebitda, 4) if ebitda != 0 else 0,
                    'debt_service_coverage_ratio': round(ebitda / abs(repayment_debt), 4) if repayment_debt != 0 else 0,
                    'loan_to_value_ratio': round((senior_secured + debt_tranche1) / ppe_net, 4) if ppe_net != 0 else 0,
                    'interest_coverage_ratio': round((ebitda + depreciation) / abs(interest_expense), 4) if interest_expense != 0 else 0,
                    
                    # Liquidity KPIs
                    'current_ratio': round((cash + accounts_receivable + inventory + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    'quick_ratio': round((cash + accounts_receivable + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    
                    # Leverage KPIs
                    'debt_to_equity_ratio': round((senior_secured + debt_tranche1) / (equity + retained_earning), 4) if (equity + retained_earning) != 0 else 0,
                    
                    # Profitability KPIs
                    'operating_margin': round(ebitda / revenue, 4) if revenue != 0 else 0,
                    
                    # Cash Flow KPIs
                    'fcff': round(net_cash_operating + net_cash_investing, 2),
                    'fcfe': round(net_cash_operating + net_cash_investing + net_cash_financing, 2),
                    
                    # Working Capital KPIs
                    'ar_cycle_days': round(365 * accounts_receivable / revenue, 2) if revenue != 0 else 0,
                    'inventory_cycle_days': round(365 * inventory / abs(cost_of_goods_sold), 2) if cost_of_goods_sold != 0 else 0
                }
                
                kpi_data.append(kpi_row)
            
            # Save to database
            save_id = save_run_id if save_run_id else calculation_run_id
            self.save_quarterly_kpis(project_id, save_id, kpi_data)
            
            return {"success": True, "message": f"Calculated {len(kpi_data)} quarterly KPIs"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def calculate_yearly_kpis(self, project_id, calculation_run_id, save_run_id=None):
        """Calculate yearly KPIs from consolidated data"""
        try:
            # Get yearly consolidated data - always use None to get latest data
            with self.get_connection() as conn:
                cursor = conn.cursor()
                
                cursor.execute("""
                    SELECT yc.year, yc.revenue, yc.cost_of_goods_sold, yc.gross_profit,
                           yc.operating_expenses, yc.ebitda, yc.depreciation, yc.interest_expense, yc.net_income_before_tax,
                           yc.income_tax_expense, yc.net_income, yc.cash, yc.accounts_receivable, yc.inventory,
                           yc.other_current_assets, yc.ppe_net, yc.other_assets, yc.total_assets, yc.accounts_payable,
                           yc.senior_secured, yc.debt_tranche1, yc.equity, yc.retained_earning, yc.total_equity_liability,
                           yc.net_cash_operating, yc.capital_expenditures, yc.net_cash_investing, yc.proceeds_debt,
                           yc.repayment_debt, yc.net_cash_financing, yc.net_cash_flow
                    FROM yearly_consolidated yc
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM yearly_consolidated 
                        WHERE project_id = %s 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON yc.calculation_run_id = latest.calculation_run_id
                    WHERE yc.project_id = %s
                    ORDER BY yc.year
                """, (project_id, project_id))
                
                results = cursor.fetchall()
                
                if not results:
                    raise ValueError("Yearly consolidated data not found")
                
                columns = ['year', 'revenue', 'cost_of_goods_sold', 'gross_profit',
                          'operating_expenses', 'ebitda', 'depreciation', 'interest_expense', 'net_income_before_tax',
                          'income_tax_expense', 'net_income', 'cash', 'accounts_receivable', 'inventory',
                          'other_current_assets', 'ppe_net', 'other_assets', 'total_assets', 'accounts_payable',
                          'senior_secured', 'debt_tranche1', 'equity', 'retained_earning', 'total_equity_liability',
                          'net_cash_operating', 'capital_expenditures', 'net_cash_investing', 'proceeds_debt',
                          'repayment_debt', 'net_cash_financing', 'net_cash_flow']
                
                yearly_data = [dict(zip(columns, row)) for row in results]
            
            kpi_data = []
            
            for row in yearly_data:
                # Convert to float for calculations
                revenue = float(row['revenue']) if row['revenue'] else 0
                ebitda = float(row['ebitda']) if row['ebitda'] else 0
                depreciation = float(row['depreciation']) if row['depreciation'] else 0
                interest_expense = float(row['interest_expense']) if row['interest_expense'] else 0
                senior_secured = float(row['senior_secured']) if row['senior_secured'] else 0
                debt_tranche1 = float(row['debt_tranche1']) if row['debt_tranche1'] else 0
                ppe_net = float(row['ppe_net']) if row['ppe_net'] else 0
                cash = float(row['cash']) if row['cash'] else 0
                accounts_receivable = float(row['accounts_receivable']) if row['accounts_receivable'] else 0
                inventory = float(row['inventory']) if row['inventory'] else 0
                other_current_assets = float(row['other_current_assets']) if row['other_current_assets'] else 0
                other_assets = float(row['other_assets']) if row['other_assets'] else 0
                accounts_payable = float(row['accounts_payable']) if row['accounts_payable'] else 0
                equity = float(row['equity']) if row['equity'] else 0
                retained_earning = float(row['retained_earning']) if row['retained_earning'] else 0
                repayment_debt = float(row['repayment_debt']) if row['repayment_debt'] else 0
                net_cash_operating = float(row['net_cash_operating']) if row['net_cash_operating'] else 0
                net_cash_investing = float(row['net_cash_investing']) if row['net_cash_investing'] else 0
                net_cash_financing = float(row['net_cash_financing']) if row['net_cash_financing'] else 0
                cost_of_goods_sold = float(row['cost_of_goods_sold']) if row['cost_of_goods_sold'] else 0
                
                # Calculate KPIs (same formulas as monthly/quarterly)
                kpi_row = {
                    'year': row['year'],
                    
                    # Debt-related KPIs
                    'debt_to_ebitda': round((senior_secured + debt_tranche1) / ebitda, 4) if ebitda != 0 else 0,
                    'debt_service_coverage_ratio': round(ebitda / abs(repayment_debt), 4) if repayment_debt != 0 else 0,
                    'loan_to_value_ratio': round((senior_secured + debt_tranche1) / ppe_net, 4) if ppe_net != 0 else 0,
                    'interest_coverage_ratio': round((ebitda + depreciation) / abs(interest_expense), 4) if interest_expense != 0 else 0,
                    
                    # Liquidity KPIs
                    'current_ratio': round((cash + accounts_receivable + inventory + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    'quick_ratio': round((cash + accounts_receivable + other_current_assets + other_assets) / accounts_payable, 4) if accounts_payable != 0 else 0,
                    
                    # Leverage KPIs
                    'debt_to_equity_ratio': round((senior_secured + debt_tranche1) / (equity + retained_earning), 4) if (equity + retained_earning) != 0 else 0,
                    
                    # Profitability KPIs
                    'operating_margin': round(ebitda / revenue, 4) if revenue != 0 else 0,
                    
                    # Cash Flow KPIs
                    'fcff': round(net_cash_operating + net_cash_investing, 2),
                    'fcfe': round(net_cash_operating + net_cash_investing + net_cash_financing, 2),
                    
                    # Working Capital KPIs
                    'ar_cycle_days': round(365 * accounts_receivable / revenue, 2) if revenue != 0 else 0,
                    'inventory_cycle_days': round(365 * inventory / abs(cost_of_goods_sold), 2) if cost_of_goods_sold != 0 else 0
                }
                
                kpi_data.append(kpi_row)
            
            # Save to database
            save_id = save_run_id if save_run_id else calculation_run_id
            self.save_yearly_kpis(project_id, save_id, kpi_data)
            
            return {"success": True, "message": f"Calculated {len(kpi_data)} yearly KPIs"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def save_monthly_kpis(self, project_id, calculation_run_id, kpi_data):
        """Save monthly KPIs to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing KPIs for this project
            cursor.execute("DELETE FROM monthly_kpis WHERE project_id = %s", (project_id,))
            
            # Insert new KPIs
            for row in kpi_data:
                cursor.execute("""
                    INSERT INTO monthly_kpis (
                        project_id, month, year, month_name,
                        debt_to_ebitda, debt_service_coverage_ratio, loan_to_value_ratio, interest_coverage_ratio,
                        current_ratio, quick_ratio, debt_to_equity_ratio, operating_margin,
                        fcff, fcfe, ar_cycle_days, inventory_cycle_days, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id, row['month'], row['year'], row['month_name'],
                    row['debt_to_ebitda'], row['debt_service_coverage_ratio'], row['loan_to_value_ratio'], row['interest_coverage_ratio'],
                    row['current_ratio'], row['quick_ratio'], row['debt_to_equity_ratio'], row['operating_margin'],
                    row['fcff'], row['fcfe'], row['ar_cycle_days'], row['inventory_cycle_days'], calculation_run_id
                ))
            
            conn.commit()
    
    def save_quarterly_kpis(self, project_id, calculation_run_id, kpi_data):
        """Save quarterly KPIs to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing KPIs for this project
            cursor.execute("DELETE FROM quarterly_kpis WHERE project_id = %s", (project_id,))
            
            # Insert new KPIs
            for row in kpi_data:
                cursor.execute("""
                    INSERT INTO quarterly_kpis (
                        project_id, quarter, year, quarter_name,
                        debt_to_ebitda, debt_service_coverage_ratio, loan_to_value_ratio, interest_coverage_ratio,
                        current_ratio, quick_ratio, debt_to_equity_ratio, operating_margin,
                        fcff, fcfe, ar_cycle_days, inventory_cycle_days, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id, row['quarter'], row['year'], row['quarter_name'],
                    row['debt_to_ebitda'], row['debt_service_coverage_ratio'], row['loan_to_value_ratio'], row['interest_coverage_ratio'],
                    row['current_ratio'], row['quick_ratio'], row['debt_to_equity_ratio'], row['operating_margin'],
                    row['fcff'], row['fcfe'], row['ar_cycle_days'], row['inventory_cycle_days'], calculation_run_id
                ))
            
            conn.commit()
    
    def save_yearly_kpis(self, project_id, calculation_run_id, kpi_data):
        """Save yearly KPIs to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing KPIs for this project
            cursor.execute("DELETE FROM yearly_kpis WHERE project_id = %s", (project_id,))
            
            # Insert new KPIs
            for row in kpi_data:
                cursor.execute("""
                    INSERT INTO yearly_kpis (
                        project_id, year,
                        debt_to_ebitda, debt_service_coverage_ratio, loan_to_value_ratio, interest_coverage_ratio,
                        current_ratio, quick_ratio, debt_to_equity_ratio, operating_margin,
                        fcff, fcfe, ar_cycle_days, inventory_cycle_days, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id, row['year'],
                    row['debt_to_ebitda'], row['debt_service_coverage_ratio'], row['loan_to_value_ratio'], row['interest_coverage_ratio'],
                    row['current_ratio'], row['quick_ratio'], row['debt_to_equity_ratio'], row['operating_margin'],
                    row['fcff'], row['fcfe'], row['ar_cycle_days'], row['inventory_cycle_days'], calculation_run_id
                ))
            
            conn.commit()

def main():
    parser = argparse.ArgumentParser(description='Calculate KPIs from consolidated data')
    parser.add_argument('project_id', help='Project ID')
    parser.add_argument('calculation_run_id', help='Calculation Run ID')
    parser.add_argument('--db-host', default=None, help='Database host')
    parser.add_argument('--db-port', default=None, help='Database port')
    parser.add_argument('--db-name', default=None, help='Database name')
    parser.add_argument('--db-user', default=None, help='Database user')
    parser.add_argument('--db-password', default=None, help='Database password')
    
    args = parser.parse_args()
    
    # Load environment variables as fallback
    from dotenv import load_dotenv
    import os
    load_dotenv()
    
    # Use command line args or fall back to environment variables
    db_host = args.db_host or os.getenv('POSTGRESQL_HOST', 'localhost')
    db_port = args.db_port or os.getenv('POSTGRESQL_PORT', '5432')
    db_name = args.db_name or os.getenv('POSTGRESQL_DATABASE', 'refi_wizard')
    db_user = args.db_user or os.getenv('POSTGRESQL_USER', 'postgres')
    db_password = args.db_password or os.getenv('POSTGRESQL_PASSWORD', '')
    
    calculator = KPICalculator(
        db_host, db_port, db_name, db_user, db_password
    )
    
    # Calculate all KPI types - use None to get latest consolidated data, but pass calculation_run_id for saving
    monthly_result = calculator.calculate_monthly_kpis(args.project_id, None, args.calculation_run_id)
    quarterly_result = calculator.calculate_quarterly_kpis(args.project_id, None, args.calculation_run_id)
    yearly_result = calculator.calculate_yearly_kpis(args.project_id, None, args.calculation_run_id)
    
    # Print results
    print(f"Monthly KPIs: {monthly_result}")
    print(f"Quarterly KPIs: {quarterly_result}")
    print(f"Yearly KPIs: {yearly_result}")
    
    # Exit with error if any calculation failed
    if not monthly_result.get('success') or not quarterly_result.get('success') or not yearly_result.get('success'):
        sys.exit(1)

if __name__ == "__main__":
    main() 