#!/usr/bin/env python3

import sys
import json
import psycopg2
import pandas as pd
import numpy as np
from datetime import datetime
import argparse

class DepreciationScheduleCalculator:
    def __init__(self, db_config):
        self.db_config = db_config

    def get_connection(self):
        return psycopg2.connect(**self.db_config)

    def get_balance_sheet_data(self, project_id):
        """Get balance sheet data for the project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT ppe, asset_depreciated_over_years, capital_expenditure_additions
                FROM balance_sheet_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """, (project_id,))
            result = cursor.fetchone()
            
            if not result:
                raise ValueError("Balance sheet data not found")
            
            return {
                'ppe': float(result[0]) if result[0] else 0,
                'asset_depreciated_over_years': int(result[1]) if result[1] else 10,
                'capital_expenditure_additions': float(result[2]) if result[2] else 0
            }

    def get_growth_assumptions_data(self, project_id):
        """Get growth assumptions data for capex projections"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    gr_capex_1, gr_capex_2, gr_capex_3, gr_capex_4, gr_capex_5,
                    gr_capex_6, gr_capex_7, gr_capex_8, gr_capex_9, gr_capex_10
                FROM growth_assumptions_data 
                WHERE project_id = %s 
                ORDER BY version DESC 
                LIMIT 1
            """, (project_id,))
            result = cursor.fetchone()
            
            if not result:
                # Return default values if no growth assumptions
                return {year: 0 for year in range(1, 11)}
            
            # Map the capex values to years
            capex_values = [float(val) if val else 0 for val in result]
            return {year + 1: capex_values[year] for year in range(10)}

    def calculate_depreciation_schedule(self, project_id, calculation_run_id):
        """Calculate 120-month depreciation schedule"""
        try:
            # Get input data
            balance_sheet_data = self.get_balance_sheet_data(project_id)
            growth_data = self.get_growth_assumptions_data(project_id)
            
            # Initialize variables
            ppe = balance_sheet_data['ppe']
            asset_depreciated_over_years = balance_sheet_data['asset_depreciated_over_years']
            nb_months = 120  # Fixed to 120 months like streamlit
            
            # Create schedule dataframe
            schedule_data = []
            for month in range(1, nb_months + 1):
                year = ((month - 1) // 12) + 1
                month_name = datetime(2024, ((month - 1) % 12) + 1, 1).strftime("%B")
                
                # Calculate opening balance
                if month == 1:
                    opening_balance = ppe
                else:
                    opening_balance = schedule_data[month - 2]['closing_balance']
                
                # Calculate capex addition (monthly) - use growth data like streamlit
                capex_addition = growth_data.get(year, 0) / 12
                
                # Calculate depreciation - match streamlit logic exactly
                if month > nb_months:
                    depreciation = 0
                else:
                    depreciation = (opening_balance + capex_addition) / (asset_depreciated_over_years * 12)
                
                # Calculate closing balance
                closing_balance = (opening_balance + capex_addition) - depreciation
                
                # Calculate accumulated depreciation
                accumulated_depreciation = ppe - closing_balance
                
                schedule_data.append({
                    'month': month,
                    'year': year,
                    'month_name': month_name,
                    'opening_balance': opening_balance,
                    'capex_addition': capex_addition,
                    'depreciation': depreciation,
                    'closing_balance': closing_balance,
                    'accumulated_depreciation': accumulated_depreciation
                })
            
            # Save to database
            self.save_depreciation_schedule(project_id, calculation_run_id, schedule_data, asset_depreciated_over_years)
            
            # Calculate summary
            total_depreciation = sum(row['depreciation'] for row in schedule_data)
            final_net_book_value = schedule_data[-1]['closing_balance']
            
            return {
                'success': True,
                'total_months': nb_months,
                'total_depreciation': total_depreciation,
                'final_net_book_value': final_net_book_value,
                'schedule': schedule_data
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

    def save_depreciation_schedule(self, project_id, calculation_run_id, schedule_data, asset_depreciated_over_years):
        """Save depreciation schedule to database"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Delete existing calculations for this project
            cursor.execute("DELETE FROM depreciation_schedule WHERE project_id = %s", (project_id,))
            
            # Insert new calculations
            for row in schedule_data:
                cursor.execute("""
                    INSERT INTO depreciation_schedule (
                        project_id, month, year, asset_value, depreciation_method,
                        depreciation_rate, monthly_depreciation, accumulated_depreciation,
                        net_book_value, calculation_run_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    project_id,
                    row['month'],
                    row['year'],
                    row['opening_balance'],
                    'straight_line',
                    100.0 / (asset_depreciated_over_years * 12),  # Monthly rate
                    row['depreciation'],
                    row['accumulated_depreciation'],
                    row['closing_balance'],
                    calculation_run_id
                ))
            
            conn.commit()

def main():
    parser = argparse.ArgumentParser(description='Calculate depreciation schedule')
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
    calculator = DepreciationScheduleCalculator(db_config)
    result = calculator.calculate_depreciation_schedule(args.project_id, args.calculation_run_id)
    
    # Output result as JSON
    print(json.dumps(result))

if __name__ == "__main__":
    main() 