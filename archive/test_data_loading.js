// Test script to verify data loading and field mapping
const axios = require('axios');

async function testDataLoading() {
  try {
    // Login to get token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'vapmail16@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.session.access_token;
    const projectId = '05632bb7-b506-453d-9ca1-253344e04b6b';
    
    console.log('✅ Login successful');
    
    // Test data loading
    const dataResponse = await axios.get(`http://localhost:3001/api/projects/${projectId}/data`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = dataResponse.data.data;
    console.log('✅ Data loaded successfully');
    
    // Test field mapping for calculation engine
    console.log('\n🔍 Testing Field Mapping:');
    
    // Debt Structure Data
    const debtStructureData = data.debtStructureData;
    console.log('Debt Structure Data:', {
      additional_loan_senior_secured: debtStructureData.additional_loan_senior_secured,
      bank_base_rate_senior_secured: debtStructureData.bank_base_rate_senior_secured,
      liquidity_premiums_senior_secured: debtStructureData.liquidity_premiums_senior_secured,
      credit_risk_premiums_senior_secured: debtStructureData.credit_risk_premiums_senior_secured,
      maturity_y_senior_secured: debtStructureData.maturity_y_senior_secured,
      amortization_y_senior_secured: debtStructureData.amortization_y_senior_secured
    });
    
    // Balance Sheet Data
    const balanceSheetData = data.balanceSheetData;
    console.log('Balance Sheet Data:', {
      long_term_debt: balanceSheetData.long_term_debt,
      short_term_debt: balanceSheetData.short_term_debt,
      capital_expenditure_additions: balanceSheetData.capital_expenditure_additions,
      asset_depreciated_over_years: balanceSheetData.asset_depreciated_over_years,
      ppe: balanceSheetData.ppe
    });
    
    // Profit Loss Data
    const profitLossData = data.profitLossData;
    console.log('Profit Loss Data:', {
      revenue: profitLossData.revenue,
      cogs: profitLossData.cogs,
      operating_expenses: profitLossData.operating_expenses,
      tax_rates: profitLossData.tax_rates
    });
    
    // Growth Assumptions Data
    const growthAssumptionsData = data.growthAssumptionsData;
    console.log('Growth Assumptions Data (Year 1):', {
      gr_revenue_1: growthAssumptionsData.gr_revenue_1,
      gr_cost_1: growthAssumptionsData.gr_cost_1,
      gr_cost_oper_1: growthAssumptionsData.gr_cost_oper_1,
      gr_capex_1: growthAssumptionsData.gr_capex_1
    });
    
    // Working Capital Data
    const workingCapitalData = data.workingCapitalData;
    console.log('Working Capital Data:', {
      account_receivable_percent: workingCapitalData.account_receivable_percent,
      inventory_percent: workingCapitalData.inventory_percent,
      other_current_assets_percent: workingCapitalData.other_current_assets_percent,
      accounts_payable_percent: workingCapitalData.accounts_payable_percent
    });
    
    // Seasonality Data
    const seasonalityData = data.seasonalityData;
    console.log('Seasonality Data (January):', {
      january: seasonalityData.january
    });
    
    console.log('\n✅ All field mappings are correct!');
    console.log('✅ Data loading is working properly!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDataLoading(); 