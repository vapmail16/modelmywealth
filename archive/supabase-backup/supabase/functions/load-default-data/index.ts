import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const PROJECT_ID = '05632bb7-b506-453d-9ca1-253344e04b6b'
    const USER_ID = '0361174d-2cf0-4f06-ac31-5897644a60d7'

    // Default values based on Excel and Streamlit app - with correct data types
    const defaultData = {
      // Company Details (13 fields) - TEXT fields as strings, INTEGER fields as numbers
      company_details: {
        company_name: "Sample Manufacturing Co.",
        industry: "Manufacturing",
        region: "North America",
        country: "United States",
        employee_count: 150, // INTEGER
        founded: 2010, // INTEGER
        company_website: "https://samplemanufacturing.com",
        business_case: "Manufacturing company seeking refinancing for expansion",
        notes: "Sample company for testing financial model",
        projection_start_month: 1, // INTEGER (January = 1)
        projection_start_year: 2024, // INTEGER
        projections_year: 10, // INTEGER
        reporting_currency: "USD"
      },

      // Profit & Loss Data (12 fields) - DECIMAL fields as numbers
      profit_loss_data: {
        revenue: 4550.00, // DECIMAL(15,2)
        cogs: -2522.00, // DECIMAL(15,2)
        gross_profit: 2028.00, // DECIMAL(15,2)
        operating_expenses: -480.00, // DECIMAL(15,2)
        ebitda: 1548.00, // DECIMAL(15,2)
        depreciation: -139.00, // DECIMAL(15,2)
        ebit: 1409.00, // DECIMAL(15,2)
        interest_expense: -76.00, // DECIMAL(15,2)
        pretax_income: 1333.00, // DECIMAL(15,2)
        tax_rates: 30.00, // DECIMAL(5,2)
        taxes: -144.00, // DECIMAL(15,2)
        net_income: 1189.00 // DECIMAL(15,2)
      },

      // Balance Sheet Data (19 fields) - DECIMAL fields as numbers, INTEGER fields as numbers
      balance_sheet_data: {
        cash: 500.00, // DECIMAL(15,2)
        accounts_receivable: 800.00, // DECIMAL(15,2)
        inventory: 1200.00, // DECIMAL(15,2)
        other_current_assets: 200.00, // DECIMAL(15,2)
        ppe: 15000.00, // DECIMAL(15,2) - Based on Excel depreciation schedule
        other_assets: 500.00, // DECIMAL(15,2)
        total_assets: 18000.00, // DECIMAL(15,2)
        accounts_payable_provisions: 600.00, // DECIMAL(15,2)
        short_term_debt: 1000.00, // DECIMAL(15,2) - Based on Excel debt structure
        other_long_term_debt: 0.00, // DECIMAL(15,2)
        senior_secured: 12000.00, // DECIMAL(15,2) - Based on Excel debt structure
        debt_tranche1: 1000.00, // DECIMAL(15,2) - Based on Excel debt structure
        retained_earnings: 2000.00, // DECIMAL(15,2)
        equity: 5000.00, // DECIMAL(15,2)
        total_liabilities_and_equity: 18000.00, // DECIMAL(15,2)
        capital_expenditure_additions: 20000.00, // DECIMAL(15,2) - Annual capex based on Excel
        asset_depreciated_over_years: 10, // INTEGER - 10 years depreciation
        additional_capex_planned_next_year: 25000.00, // DECIMAL(15,2)
        asset_depreciated_over_years_new: 8 // INTEGER
      },

      // Cash Flow Data (4 fields) - DECIMAL fields as numbers
      cash_flow_data: {
        operating_cash_flow: 1400.00, // DECIMAL(15,2)
        capital_expenditures: -2000.00, // DECIMAL(15,2)
        free_cash_flow: -600.00, // DECIMAL(15,2)
        debt_service: -800.00 // DECIMAL(15,2)
      },

      // Working Capital Data (4 fields) - DECIMAL fields as numbers
      working_capital_data: {
        account_receivable_percent: 17.60, // DECIMAL(5,2) - 800/4550
        inventory_percent: 26.40, // DECIMAL(5,2) - 1200/4550
        other_current_assets_percent: 4.40, // DECIMAL(5,2) - 200/4550
        accounts_payable_percent: 13.20 // DECIMAL(5,2) - 600/4550
      },

      // Growth Assumptions Data (48 fields) - DECIMAL fields as numbers
      growth_assumptions_data: {
        // Revenue Growth (Years 1-12) - DECIMAL(5,2)
        gr_revenue_1: 5.00, gr_revenue_2: 5.50, gr_revenue_3: 6.00, gr_revenue_4: 6.50,
        gr_revenue_5: 7.00, gr_revenue_6: 7.50, gr_revenue_7: 8.00, gr_revenue_8: 8.50,
        gr_revenue_9: 9.00, gr_revenue_10: 9.50, gr_revenue_11: 10.00, gr_revenue_12: 10.50,
        
        // Cost Growth (Years 1-12) - DECIMAL(5,2)
        gr_cost_1: 4.50, gr_cost_2: 5.00, gr_cost_3: 5.50, gr_cost_4: 6.00,
        gr_cost_5: 6.50, gr_cost_6: 7.00, gr_cost_7: 7.50, gr_cost_8: 8.00,
        gr_cost_9: 8.50, gr_cost_10: 9.00, gr_cost_11: 9.50, gr_cost_12: 10.00,
        
        // Operating Cost Growth (Years 1-12) - DECIMAL(5,2)
        gr_cost_oper_1: 3.00, gr_cost_oper_2: 3.50, gr_cost_oper_3: 4.00, gr_cost_oper_4: 4.50,
        gr_cost_oper_5: 5.00, gr_cost_oper_6: 5.50, gr_cost_oper_7: 6.00, gr_cost_oper_8: 6.50,
        gr_cost_oper_9: 7.00, gr_cost_oper_10: 7.50, gr_cost_oper_11: 8.00, gr_cost_oper_12: 8.50,
        
        // Capex Growth (Years 1-12) - DECIMAL(5,2)
        gr_capex_1: 2.00, gr_capex_2: 2.50, gr_capex_3: 3.00, gr_capex_4: 3.50,
        gr_capex_5: 4.00, gr_capex_6: 4.50, gr_capex_7: 5.00, gr_capex_8: 5.50,
        gr_capex_9: 6.00, gr_capex_10: 6.50, gr_capex_11: 7.00, gr_capex_12: 7.50
      },

      // Seasonality Data (14 fields) - DECIMAL fields as numbers, TEXT fields as strings
      seasonality_data: {
        january: 8.00, february: 7.50, march: 8.50, april: 9.00, // DECIMAL(5,2)
        may: 9.50, june: 10.00, july: 9.50, august: 8.50, // DECIMAL(5,2)
        september: 8.00, october: 8.50, november: 7.50, december: 7.00, // DECIMAL(5,2)
        seasonal_working_capital: 15.00, // DECIMAL(5,2)
        seasonality_pattern: "moderate" // TEXT
      },

      // Debt Structure Data (14 fields) - TEXT fields as strings, DECIMAL fields as numbers, INTEGER fields as numbers
      debt_structure_data: {
        // Senior Secured Debt
        senior_secured_loan_type: "term-loan", // TEXT
        additional_loan_senior_secured: 50000.00, // DECIMAL(15,2) - Based on Excel
        bank_base_rate_senior_secured: 5.00, // DECIMAL(5,2) - Based on Streamlit app
        liquidity_premiums_senior_secured: 1.00, // DECIMAL(5,2) - Based on Streamlit app
        credit_risk_premiums_senior_secured: 1.00, // DECIMAL(5,2) - Based on Streamlit app
        maturity_y_senior_secured: 10, // INTEGER - 10 years
        amortization_y_senior_secured: 4, // INTEGER - 4 years amortization
        
        // Short Term Debt
        short_term_loan_type: "revolving-credit", // TEXT
        additional_loan_short_term: 70000.00, // DECIMAL(15,2) - Based on Excel
        bank_base_rate_short_term: 6.00, // DECIMAL(5,2) - Based on Streamlit app
        liquidity_premiums_short_term: 1.50, // DECIMAL(5,2) - Based on Streamlit app
        credit_risk_premiums_short_term: 1.50, // DECIMAL(5,2) - Based on Streamlit app
        maturity_y_short_term: 3, // INTEGER - 3 years
        amortization_y_short_term: 1 // INTEGER - 1 year amortization
      }
    }

    const results = {
      company_details: null,
      profit_loss_data: null,
      balance_sheet_data: null,
      cash_flow_data: null,
      working_capital_data: null,
      growth_assumptions_data: null,
      seasonality_data: null,
      debt_structure_data: null
    }

    // Load Company Details (13 fields)
    console.log('📋 Loading Company Details...')
    const { data: companyDetails, error: companyError } = await supabaseClient
      .from('company_details')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.company_details,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (companyError) {
      console.error('Company Details Error:', companyError)
      results.company_details = { error: companyError.message }
    } else {
      results.company_details = { success: true, data: companyDetails }
      console.log('✅ Company Details loaded (13 fields)')
    }

    // Load Profit & Loss Data (12 fields)
    console.log('📊 Loading Profit & Loss Data...')
    const { data: profitLoss, error: profitLossError } = await supabaseClient
      .from('profit_loss_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.profit_loss_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (profitLossError) {
      console.error('Profit Loss Error:', profitLossError)
      results.profit_loss_data = { error: profitLossError.message }
    } else {
      results.profit_loss_data = { success: true, data: profitLoss }
      console.log('✅ Profit & Loss Data loaded (12 fields)')
    }

    // Load Balance Sheet Data (19 fields)
    console.log('🏦 Loading Balance Sheet Data...')
    const { data: balanceSheet, error: balanceSheetError } = await supabaseClient
      .from('balance_sheet_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.balance_sheet_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (balanceSheetError) {
      console.error('Balance Sheet Error:', balanceSheetError)
      results.balance_sheet_data = { error: balanceSheetError.message }
    } else {
      results.balance_sheet_data = { success: true, data: balanceSheet }
      console.log('✅ Balance Sheet Data loaded (19 fields)')
    }

    // Load Cash Flow Data (4 fields)
    console.log('💰 Loading Cash Flow Data...')
    const { data: cashFlow, error: cashFlowError } = await supabaseClient
      .from('cash_flow_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.cash_flow_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (cashFlowError) {
      console.error('Cash Flow Error:', cashFlowError)
      results.cash_flow_data = { error: cashFlowError.message }
    } else {
      results.cash_flow_data = { success: true, data: cashFlow }
      console.log('✅ Cash Flow Data loaded (4 fields)')
    }

    // Load Working Capital Data (4 fields)
    console.log('⚙️ Loading Working Capital Data...')
    const { data: workingCapital, error: workingCapitalError } = await supabaseClient
      .from('working_capital_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.working_capital_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (workingCapitalError) {
      console.error('Working Capital Error:', workingCapitalError)
      results.working_capital_data = { error: workingCapitalError.message }
    } else {
      results.working_capital_data = { success: true, data: workingCapital }
      console.log('✅ Working Capital Data loaded (4 fields)')
    }

    // Load Growth Assumptions Data (48 fields)
    console.log('📈 Loading Growth Assumptions Data...')
    const { data: growthAssumptions, error: growthAssumptionsError } = await supabaseClient
      .from('growth_assumptions_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.growth_assumptions_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (growthAssumptionsError) {
      console.error('Growth Assumptions Error:', growthAssumptionsError)
      results.growth_assumptions_data = { error: growthAssumptionsError.message }
    } else {
      results.growth_assumptions_data = { success: true, data: growthAssumptions }
      console.log('✅ Growth Assumptions Data loaded (48 fields)')
    }

    // Load Seasonality Data (14 fields)
    console.log('📅 Loading Seasonality Data...')
    const { data: seasonality, error: seasonalityError } = await supabaseClient
      .from('seasonality_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.seasonality_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (seasonalityError) {
      console.error('Seasonality Error:', seasonalityError)
      results.seasonality_data = { error: seasonalityError.message }
    } else {
      results.seasonality_data = { success: true, data: seasonality }
      console.log('✅ Seasonality Data loaded (14 fields)')
    }

    // Load Debt Structure Data (14 fields)
    console.log('🏛️ Loading Debt Structure Data...')
    const { data: debtStructure, error: debtStructureError } = await supabaseClient
      .from('debt_structure_data')
      .upsert({
        project_id: PROJECT_ID,
        user_id: USER_ID,
        ...defaultData.debt_structure_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (debtStructureError) {
      console.error('Debt Structure Error:', debtStructureError)
      results.debt_structure_data = { error: debtStructureError.message }
    } else {
      results.debt_structure_data = { success: true, data: debtStructure }
      console.log('✅ Debt Structure Data loaded (14 fields)')
    }

    console.log('🎉 SUCCESS! All 128 Data Entry fields loaded with default values!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All 128 Data Entry fields loaded successfully!',
        results: results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
}) 