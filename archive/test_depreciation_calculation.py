#!/usr/bin/env python3

import psycopg2
import pandas as pd
from datetime import datetime

def test_depreciation_calculation():
    """Test depreciation calculation to match streamlit logic"""
    
    # Database configuration
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'refi_wizard',
        'user': 'postgres',
        'password': 'postgres'
    }
    
    project_id = "05632bb7-b506-453d-9ca1-253344e04b6b"
    
    with psycopg2.connect(**db_config) as conn:
        cursor = conn.cursor()
        
        # Get balance sheet data
        cursor.execute("""
            SELECT ppe, asset_depreciated_over_years, capital_expenditure_additions
            FROM balance_sheet_data 
            WHERE project_id = %s 
            ORDER BY version DESC 
            LIMIT 1
        """, (project_id,))
        balance_result = cursor.fetchone()
        
        if not balance_result:
            print("No balance sheet data found")
            return
            
        ppe = float(balance_result[0]) if balance_result[0] else 0
        asset_depreciated_over_years = int(balance_result[1]) if balance_result[1] else 10
        base_capex = float(balance_result[2]) if balance_result[2] else 0
        
        print(f"PPE: {ppe}")
        print(f"Asset Depreciated Over Years: {asset_depreciated_over_years}")
        print(f"Base Capex: {base_capex}")
        
        # Get growth assumptions data
        cursor.execute("""
            SELECT 
                gr_capex_1, gr_capex_2, gr_capex_3, gr_capex_4, gr_capex_5,
                gr_capex_6, gr_capex_7, gr_capex_8, gr_capex_9, gr_capex_10
            FROM growth_assumptions_data 
            WHERE project_id = %s 
            ORDER BY version DESC 
            LIMIT 1
        """, (project_id,))
        growth_result = cursor.fetchone()
        
        if not growth_result:
            print("No growth assumptions data found")
            return
            
        # Map capex values to years
        capex_values = [float(val) if val else 0 for val in growth_result]
        growth_data = {year + 1: capex_values[year] for year in range(10)}
        
        print(f"Growth Capex Data: {growth_data}")
        
        # Calculate depreciation schedule like streamlit
        nb_months = 120
        schedule_data = []
        
        for month in range(1, nb_months + 1):
            year = ((month - 1) // 12) + 1
            month_name = datetime(2024, ((month - 1) % 12) + 1, 1).strftime("%B")
            
            # Calculate opening balance
            if month == 1:
                opening_balance = ppe
            else:
                opening_balance = schedule_data[month - 2]['closing_balance']
            
            # Calculate capex addition (monthly)
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
        
        # Print first 12 months for verification
        print("\nFirst 12 months of depreciation schedule:")
        print("Month\tYear\tOpening\t\tCapex\t\tDepreciation\tClosing\t\tAccumulated")
        for i in range(12):
            row = schedule_data[i]
            print(f"{row['month_name']}\t{row['year']}\t{row['opening_balance']:.2f}\t{row['capex_addition']:.2f}\t{row['depreciation']:.2f}\t{row['closing_balance']:.2f}\t{row['accumulated_depreciation']:.2f}")
        
        # Print summary
        total_depreciation = sum(row['depreciation'] for row in schedule_data)
        final_net_book_value = schedule_data[-1]['closing_balance']
        
        print(f"\nSummary:")
        print(f"Total Depreciation: {total_depreciation:.2f}")
        print(f"Final Net Book Value: {final_net_book_value:.2f}")
        print(f"Total Months: {len(schedule_data)}")

if __name__ == "__main__":
    test_depreciation_calculation() 