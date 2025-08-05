import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Download } from "lucide-react";

// Import form components
import CompanyInfoForm from "@/components/data-entry/CompanyInfoForm";
import FinancialDataForm from "@/components/data-entry/FinancialDataForm";
import SeasonalityForm from "@/components/data-entry/SeasonalityForm";
import DebtStructureForm from "@/components/data-entry/DebtStructureForm";

interface DataEntryFormData {
  // Company Details (from company_details table)
  company_name: string;
  industry: string;
  region: string;
  country: string;
  employee_count: string;
  founded: string;
  company_website: string;
  business_case: string;
  notes: string;
  projection_start_month: string;
  projection_start_year: string;
  projections_year: string;
  reporting_currency: string;
  
  // Profit & Loss Data (from profit_loss_data table)
  revenue: string;
  cogs: string;
  gross_profit: string;
  operating_expenses: string;
  ebitda: string;
  depreciation: string;
  ebit: string;
  interest_expense: string;
  pretax_income: string;
  tax_rates: string; // This is the Tax Rate field!
  taxes: string;
  net_income: string;
  
  // Balance Sheet Data (from balance_sheet_data table)
  cash: string;
  accounts_receivable: string;
  inventory: string;
  other_current_assets: string;
  ppe: string;
  other_assets: string;
  total_assets: string;
  accounts_payable_provisions: string;
  short_term_debt: string;
  other_long_term_debt: string;
  senior_secured: string;
  debt_tranche1: string;
  retained_earnings: string;
  equity: string;
  total_liabilities_and_equity: string;
  capital_expenditure_additions: string; // This is Capex!
  asset_depreciated_over_years: string; // This is Depreciation Years!
  additional_capex_planned_next_year: string;
  asset_depreciated_over_years_new: string;
  
  // Cash Flow Data (from cash_flow_data table)
  operating_cash_flow: string;
  capital_expenditures: string;
  free_cash_flow: string;
  debt_service: string;
  
  // Working Capital Data (from working_capital_data table)
  account_receivable_percent: string; // Working Capital fields!
  inventory_percent: string;
  other_current_assets_percent: string;
  accounts_payable_percent: string;
  
  // Growth Assumptions Data (from growth_assumptions_data table) - Growth Rates!
  gr_revenue_1: string; gr_revenue_2: string; gr_revenue_3: string; gr_revenue_4: string; gr_revenue_5: string;
  gr_revenue_6: string; gr_revenue_7: string; gr_revenue_8: string; gr_revenue_9: string; gr_revenue_10: string;
  gr_revenue_11: string; gr_revenue_12: string;
  gr_cost_1: string; gr_cost_2: string; gr_cost_3: string; gr_cost_4: string; gr_cost_5: string;
  gr_cost_6: string; gr_cost_7: string; gr_cost_8: string; gr_cost_9: string; gr_cost_10: string;
  gr_cost_11: string; gr_cost_12: string;
  gr_cost_oper_1: string; gr_cost_oper_2: string; gr_cost_oper_3: string; gr_cost_oper_4: string; gr_cost_oper_5: string;
  gr_cost_oper_6: string; gr_cost_oper_7: string; gr_cost_oper_8: string; gr_cost_oper_9: string; gr_cost_oper_10: string;
  gr_cost_oper_11: string; gr_cost_oper_12: string;
  gr_capex_1: string; gr_capex_2: string; gr_capex_3: string; gr_capex_4: string; gr_capex_5: string;
  gr_capex_6: string; gr_capex_7: string; gr_capex_8: string; gr_capex_9: string; gr_capex_10: string;
  gr_capex_11: string; gr_capex_12: string;
  
  // Seasonality Data (from seasonality_data table)
  january: string; february: string; march: string; april: string; may: string; june: string;
  july: string; august: string; september: string; october: string; november: string; december: string;
  seasonal_working_capital: string;
  seasonality_pattern: string;
  
  // Debt Structure Data (from debt_structure_data table)
  senior_secured_loan_type: string;
  additional_loan_senior_secured: string;
  bank_base_rate_senior_secured: string;
  liquidity_premiums_senior_secured: string;
  credit_risk_premiums_senior_secured: string;
  maturity_y_senior_secured: string;
  amortization_y_senior_secured: string;
  short_term_loan_type: string;
  additional_loan_short_term: string;
  bank_base_rate_short_term: string;
  liquidity_premiums_short_term: string;
  credit_risk_premiums_short_term: string;
  maturity_y_short_term: string;
  amortization_y_short_term: string;
}

const initialFormData: DataEntryFormData = {
  // Company Details
  company_name: "", industry: "", region: "", country: "", employee_count: "",
  founded: "", company_website: "", business_case: "", notes: "",
  projection_start_month: "", projection_start_year: "", projections_year: "",
  reporting_currency: "USD",
  
  // P&L
  revenue: "", cogs: "", gross_profit: "", operating_expenses: "", 
  ebitda: "", depreciation: "", ebit: "", interest_expense: "", 
  pretax_income: "", tax_rates: "", taxes: "", net_income: "",
  
  // Balance Sheet
  cash: "", accounts_receivable: "", inventory: "", other_current_assets: "",
  ppe: "", other_assets: "", total_assets: "", accounts_payable_provisions: "",
  short_term_debt: "", other_long_term_debt: "", senior_secured: "", debt_tranche1: "",
  retained_earnings: "", equity: "", total_liabilities_and_equity: "",
  capital_expenditure_additions: "", asset_depreciated_over_years: "",
  additional_capex_planned_next_year: "", asset_depreciated_over_years_new: "",
  
  // Cash Flow
  operating_cash_flow: "", capital_expenditures: "", free_cash_flow: "", debt_service: "",
  
  // Working Capital
  account_receivable_percent: "", inventory_percent: "", 
  other_current_assets_percent: "", accounts_payable_percent: "",
  
  // Growth Assumptions
  gr_revenue_1: "", gr_revenue_2: "", gr_revenue_3: "", gr_revenue_4: "", gr_revenue_5: "",
  gr_revenue_6: "", gr_revenue_7: "", gr_revenue_8: "", gr_revenue_9: "", gr_revenue_10: "",
  gr_revenue_11: "", gr_revenue_12: "",
  gr_cost_1: "", gr_cost_2: "", gr_cost_3: "", gr_cost_4: "", gr_cost_5: "",
  gr_cost_6: "", gr_cost_7: "", gr_cost_8: "", gr_cost_9: "", gr_cost_10: "",
  gr_cost_11: "", gr_cost_12: "",
  gr_cost_oper_1: "", gr_cost_oper_2: "", gr_cost_oper_3: "", gr_cost_oper_4: "", gr_cost_oper_5: "",
  gr_cost_oper_6: "", gr_cost_oper_7: "", gr_cost_oper_8: "", gr_cost_oper_9: "", gr_cost_oper_10: "",
  gr_cost_oper_11: "", gr_cost_oper_12: "",
  gr_capex_1: "", gr_capex_2: "", gr_capex_3: "", gr_capex_4: "", gr_capex_5: "",
  gr_capex_6: "", gr_capex_7: "", gr_capex_8: "", gr_capex_9: "", gr_capex_10: "",
  gr_capex_11: "", gr_capex_12: "",
  
  // Seasonality
  january: "", february: "", march: "", april: "", may: "", june: "",
  july: "", august: "", september: "", october: "", november: "", december: "",
  seasonal_working_capital: "", seasonality_pattern: "",
  
  // Debt Structure
  senior_secured_loan_type: "", additional_loan_senior_secured: "", bank_base_rate_senior_secured: "",
  liquidity_premiums_senior_secured: "", credit_risk_premiums_senior_secured: "",
  maturity_y_senior_secured: "", amortization_y_senior_secured: "",
  short_term_loan_type: "", additional_loan_short_term: "", bank_base_rate_short_term: "",
  liquidity_premiums_short_term: "", credit_risk_premiums_short_term: "",
  maturity_y_short_term: "", amortization_y_short_term: "",
};

export default function DataEntry() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("company-info");
  const [formData, setFormData] = useState<DataEntryFormData>(initialFormData);

  const updateFormData = (data: Partial<DataEntryFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const calculateProgress = (): { completed: number; total: number; percentage: number } => {
    const allFields = Object.values(formData);
    const completed = allFields.filter(field => field && field.trim() !== '').length;
    const total = allFields.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const handleSave = () => {
    toast({
      title: "Data Saved",
      description: "Your financial data has been saved successfully.",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared.",
    });
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Financial Data Entry</h1>
              <p className="text-muted-foreground">Enter your company's financial information for analysis</p>
            </div>

            <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="company-info">Company Info</TabsTrigger>
                <TabsTrigger value="financial-data">Financial Data</TabsTrigger>
                <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
                <TabsTrigger value="debt-structure">Debt Structure</TabsTrigger>
              </TabsList>

              <TabsContent value="company-info" className="space-y-4">
                <CompanyInfoForm 
                  data={{
                    companyName: formData.company_name,
                    industry: formData.industry,
                    location: formData.region,
                    fiscalYearEnd: formData.projection_start_month,
                    employees: formData.employee_count,
                    businessDescription: formData.business_case,
                  }}
                  onChange={(data) => updateFormData({
                    company_name: data.companyName || formData.company_name,
                    industry: data.industry || formData.industry,
                    region: data.location || formData.region,
                    projection_start_month: data.fiscalYearEnd || formData.projection_start_month,
                    employee_count: data.employees || formData.employee_count,
                    business_case: data.businessDescription || formData.business_case,
                  })}
                />
              </TabsContent>

              <TabsContent value="financial-data" className="space-y-4">
                <FinancialDataForm 
                  data={{
                    revenue: formData.revenue,
                    cogs: formData.cogs,
                    grossProfit: formData.gross_profit,
                    operatingExpenses: formData.operating_expenses,
                    ebitda: formData.ebitda,
                    depreciation: formData.depreciation,
                    ebit: formData.ebit,
                    interestExpense: formData.interest_expense,
                    pretaxIncome: formData.pretax_income,
                    taxRate: formData.tax_rates,
                    taxes: formData.taxes,
                    netIncome: formData.net_income,
                    cash: formData.cash,
                    accountsReceivable: formData.accounts_receivable,
                    inventory: formData.inventory,
                    otherCurrentAssets: formData.other_current_assets,
                    totalCurrentAssets: "", // Not in DB
                    ppe: formData.ppe,
                    intangibleAssets: "", // Not in DB
                    otherAssets: formData.other_assets,
                    totalAssets: formData.total_assets,
                    accountsPayable: formData.accounts_payable_provisions,
                    accruedLiabilities: "", // Not in DB
                    shortTermDebt: formData.short_term_debt,
                    otherCurrentLiabilities: "", // Not in DB
                    currentLiabilities: "", // Not in DB
                    longTermDebt: formData.other_long_term_debt,
                    otherLiabilities: "", // Not in DB
                    totalLiabilities: "", // Not in DB
                    shareCapital: "", // Not in DB
                    retainedEarnings: formData.retained_earnings,
                    otherEquity: "", // Not in DB
                    totalEquity: formData.equity,
                    operatingCashFlow: formData.operating_cash_flow,
                    investingCashFlow: "", // Not in DB
                    financingCashFlow: "", // Not in DB
                    freeCashFlow: formData.free_cash_flow,
                    capex: formData.capital_expenditure_additions,
                  }}
                  onChange={(data) => updateFormData({
                    revenue: data.revenue || formData.revenue,
                    cogs: data.cogs || formData.cogs,
                    gross_profit: data.grossProfit || formData.gross_profit,
                    operating_expenses: data.operatingExpenses || formData.operating_expenses,
                    ebitda: data.ebitda || formData.ebitda,
                    depreciation: data.depreciation || formData.depreciation,
                    ebit: data.ebit || formData.ebit,
                    interest_expense: data.interestExpense || formData.interest_expense,
                    pretax_income: data.pretaxIncome || formData.pretax_income,
                    tax_rates: data.taxRate || formData.tax_rates,
                    taxes: data.taxes || formData.taxes,
                    net_income: data.netIncome || formData.net_income,
                    cash: data.cash || formData.cash,
                    accounts_receivable: data.accountsReceivable || formData.accounts_receivable,
                    inventory: data.inventory || formData.inventory,
                    other_current_assets: data.otherCurrentAssets || formData.other_current_assets,
                    ppe: data.ppe || formData.ppe,
                    other_assets: data.otherAssets || formData.other_assets,
                    total_assets: data.totalAssets || formData.total_assets,
                    accounts_payable_provisions: data.accountsPayable || formData.accounts_payable_provisions,
                    short_term_debt: data.shortTermDebt || formData.short_term_debt,
                    other_long_term_debt: data.longTermDebt || formData.other_long_term_debt,
                    retained_earnings: data.retainedEarnings || formData.retained_earnings,
                    equity: data.totalEquity || formData.equity,
                    operating_cash_flow: data.operatingCashFlow || formData.operating_cash_flow,
                    free_cash_flow: data.freeCashFlow || formData.free_cash_flow,
                    capital_expenditure_additions: data.capex || formData.capital_expenditure_additions,
                  })}
                />
              </TabsContent>

              <TabsContent value="seasonality" className="space-y-4">
                <SeasonalityForm 
                  data={{
                    january: formData.january,
                    february: formData.february,
                    march: formData.march,
                    april: formData.april,
                    may: formData.may,
                    june: formData.june,
                    july: formData.july,
                    august: formData.august,
                    september: formData.september,
                    october: formData.october,
                    november: formData.november,
                    december: formData.december,
                    seasonalWorkingCapital: formData.seasonal_working_capital,
                    seasonalityPattern: formData.seasonality_pattern,
                  }}
                  onChange={(data) => updateFormData({
                    january: data.january || formData.january,
                    february: data.february || formData.february,
                    march: data.march || formData.march,
                    april: data.april || formData.april,
                    may: data.may || formData.may,
                    june: data.june || formData.june,
                    july: data.july || formData.july,
                    august: data.august || formData.august,
                    september: data.september || formData.september,
                    october: data.october || formData.october,
                    november: data.november || formData.november,
                    december: data.december || formData.december,
                    seasonal_working_capital: data.seasonalWorkingCapital || formData.seasonal_working_capital,
                    seasonality_pattern: data.seasonalityPattern || formData.seasonality_pattern,
                  })}
                />
              </TabsContent>

              <TabsContent value="debt-structure" className="space-y-4">
                <DebtStructureForm 
                  data={{
                    seniorSecuredLoanType: formData.senior_secured_loan_type,
                    additionalLoanSeniorSecured: formData.additional_loan_senior_secured,
                    bankBaseRateSeniorSecured: formData.bank_base_rate_senior_secured,
                    liquidityPremiumsSeniorSecured: formData.liquidity_premiums_senior_secured,
                    creditRiskPremiumsSeniorSecured: formData.credit_risk_premiums_senior_secured,
                    maturityYearsSeniorSecured: formData.maturity_y_senior_secured,
                    amortizationYearsSeniorSecured: formData.amortization_y_senior_secured,
                    shortTermLoanType: formData.short_term_loan_type,
                    additionalLoanShortTerm: formData.additional_loan_short_term,
                    bankBaseRateShortTerm: formData.bank_base_rate_short_term,
                    liquidityPremiumsShortTerm: formData.liquidity_premiums_short_term,
                    creditRiskPremiumsShortTerm: formData.credit_risk_premiums_short_term,
                    maturityYearsShortTerm: formData.maturity_y_short_term,
                    amortizationYearsShortTerm: formData.amortization_y_short_term,
                  }}
                  onChange={(data) => updateFormData({
                    senior_secured_loan_type: data.seniorSecuredLoanType || formData.senior_secured_loan_type,
                    additional_loan_senior_secured: data.additionalLoanSeniorSecured || formData.additional_loan_senior_secured,
                    bank_base_rate_senior_secured: data.bankBaseRateSeniorSecured || formData.bank_base_rate_senior_secured,
                    liquidity_premiums_senior_secured: data.liquidityPremiumsSeniorSecured || formData.liquidity_premiums_senior_secured,
                    credit_risk_premiums_senior_secured: data.creditRiskPremiumsSeniorSecured || formData.credit_risk_premiums_senior_secured,
                    maturity_y_senior_secured: data.maturityYearsSeniorSecured || formData.maturity_y_senior_secured,
                    amortization_y_senior_secured: data.amortizationYearsSeniorSecured || formData.amortization_y_senior_secured,
                    short_term_loan_type: data.shortTermLoanType || formData.short_term_loan_type,
                    additional_loan_short_term: data.additionalLoanShortTerm || formData.additional_loan_short_term,
                    bank_base_rate_short_term: data.bankBaseRateShortTerm || formData.bank_base_rate_short_term,
                    liquidity_premiums_short_term: data.liquidityPremiumsShortTerm || formData.liquidity_premiums_short_term,
                    credit_risk_premiums_short_term: data.creditRiskPremiumsShortTerm || formData.credit_risk_premiums_short_term,
                    maturity_y_short_term: data.maturityYearsShortTerm || formData.maturity_y_short_term,
                    amortization_y_short_term: data.amortizationYearsShortTerm || formData.amortization_y_short_term,
                  })}
                />
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => {
                  const steps = ["company-info", "financial-data", "seasonality", "debt-structure"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }}
                disabled={currentStep === "company-info"}
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  const steps = ["company-info", "financial-data", "seasonality", "debt-structure"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }}
                disabled={currentStep === "debt-structure"}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Completion Progress</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Fields Completed</span>
                  <span className="font-medium">{progress.completed}/{progress.total}</span>
                </div>
                <Progress value={progress.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progress.percentage}% of all required data fields completed
                </p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                  Save Progress
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start gap-2"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}