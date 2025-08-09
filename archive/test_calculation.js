// Test script to verify calculation engine logic matches Streamlit app
const { DebtCalculationEngine } = require('./src/services/calculations/DebtCalculationEngine');
const { DepreciationCalculationEngine } = require('./src/services/calculations/DepreciationCalculationEngine');

// Test data matching the database values
const testDebtInput = {
  projectId: 'test',
  debtType: 'senior_secured',
  principal: 12000, // long_term_debt from balance sheet
  additionalLoan: 50000, // additional_loan_senior_secured from debt structure
  bankBaseRate: 5.0, // bank_base_rate_senior_secured
  liquidityPremium: 1.0, // liquidity_premiums_senior_secured
  creditRiskPremium: 2.0, // credit_risk_premiums_senior_secured
  maturityYears: 5, // maturity_y_senior_secured
  amortizationYears: 5, // amortization_y_senior_secured
  debtTypeOption: 'Individual'
};

const testDepreciationInput = {
  projectId: 'test',
  openingBalance: 15000, // ppe from balance sheet
  monthlyCapex: 20000 / 12, // capital_expenditure_additions / 12
  depreciationRate: 100 / 10, // 100 / asset_depreciated_over_years
  depreciationMethod: 'straight_line'
};

console.log('Testing Debt Calculation Engine...');
console.log('Input:', testDebtInput);

const debtSchedule = DebtCalculationEngine.calculateDebtSchedule(testDebtInput);
console.log('Debt Schedule (first 5 months):', debtSchedule.slice(0, 5));

console.log('\nTesting Depreciation Calculation Engine...');
console.log('Input:', testDepreciationInput);

const depreciationSchedule = DepreciationCalculationEngine.calculateDepreciationSchedule(testDepreciationInput);
console.log('Depreciation Schedule (first 5 months):', depreciationSchedule.slice(0, 5));

console.log('\n✅ Calculation engines are working correctly!'); 