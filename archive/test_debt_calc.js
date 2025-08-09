// Test debt calculation logic
const debtStructureData = {
  senior_secured_loan_type: "Term Loan",
  additional_loan_senior_secured: "50000.00",
  bank_base_rate_senior_secured: "5.0000",
  liquidity_premiums_senior_secured: "1.0000",
  credit_risk_premiums_senior_secured: "1.0000",
  maturity_y_senior_secured: 10,
  amortization_y_senior_secured: 4,
  short_term_loan_type: "Revolver",
  additional_loan_short_term: "10000.00",
  bank_base_rate_short_term: "0.0700",
  liquidity_premiums_short_term: "0.5000",
  credit_risk_premiums_short_term: "0.5000",
  maturity_y_short_term: 3,
  amortization_y_short_term: 1
};

const balanceSheetData = {
  senior_secured: "50000.00",
  debt_tranche1: "10000.00"
};

// Calculate parameters
const seniorSecured = {
  loanType: debtStructureData.senior_secured_loan_type,
  initialAmount: parseFloat(balanceSheetData.senior_secured || 0),
  additionalLoan: parseFloat(debtStructureData.additional_loan_senior_secured || 0),
  bankBaseRate: parseFloat(debtStructureData.bank_base_rate_senior_secured || 0) / 100,
  liquidityPremiums: parseFloat(debtStructureData.liquidity_premiums_senior_secured || 0) / 100,
  creditRiskPremiums: parseFloat(debtStructureData.credit_risk_premiums_senior_secured || 0) / 100,
  maturityYears: parseInt(debtStructureData.maturity_y_senior_secured || 0),
  amortizationYears: parseInt(debtStructureData.amortization_y_senior_secured || 0)
};

console.log("Senior Secured Parameters:", seniorSecured);

// Calculate interest rates
seniorSecured.interestRatePerAnnum = seniorSecured.bankBaseRate + seniorSecured.liquidityPremiums + seniorSecured.creditRiskPremiums;
seniorSecured.interestRatePerMonth = seniorSecured.interestRatePerAnnum / 12;
seniorSecured.maturityMonths = seniorSecured.maturityYears * 12;
seniorSecured.amortizationMonths = seniorSecured.amortizationYears * 12;
seniorSecured.repaymentOverMonths = seniorSecured.maturityMonths - seniorSecured.amortizationMonths;

console.log("Calculated Parameters:");
console.log("- Interest Rate per Annum:", seniorSecured.interestRatePerAnnum);
console.log("- Interest Rate per Month:", seniorSecured.interestRatePerMonth);
console.log("- Maturity Months:", seniorSecured.maturityMonths);
console.log("- Amortization Months:", seniorSecured.amortizationMonths);
console.log("- Repayment Over Months:", seniorSecured.repaymentOverMonths);

// Test first month calculation
const month = 1;
const openingBalance = seniorSecured.initialAmount;
const additionalLoan = seniorSecured.additionalLoan;
const totalBalance = openingBalance + additionalLoan;

console.log("\nFirst Month Calculation:");
console.log("- Opening Balance:", openingBalance);
console.log("- Additional Loan:", additionalLoan);
console.log("- Total Balance:", totalBalance);

// Interest calculation
let interest;
if (month <= seniorSecured.maturityMonths) {
  if (month <= seniorSecured.amortizationMonths) {
    // During amortization period (interest-only)
    interest = totalBalance * seniorSecured.interestRatePerMonth;
  } else {
    // After amortization period
    interest = openingBalance * seniorSecured.interestRatePerMonth;
  }
} else {
  interest = 0;
}

console.log("- Interest:", interest);

// PMT calculation
function calculatePMT(rate, nper, pv) {
  if (rate === 0) return -pv / nper;
  const pmt = -pv * (rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
  return pmt;
}

let repayment;
if (seniorSecured.amortizationMonths !== 0) {
  // Interest-only period exists
  repayment = 0;
} else {
  // No interest-only period
  repayment = calculatePMT(seniorSecured.interestRatePerMonth, seniorSecured.repaymentOverMonths, totalBalance);
}

console.log("- Repayment:", repayment);

const closingBalance = openingBalance + additionalLoan + interest + repayment;
console.log("- Closing Balance:", closingBalance); 