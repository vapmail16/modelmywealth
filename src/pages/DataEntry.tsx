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
import GrowthProjectionsForm from "@/components/data-entry/GrowthProjectionsForm";
import CovenantForm from "@/components/data-entry/CovenantForm";

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
  // Company Info
  companyName: "", industry: "", location: "", fiscalYearEnd: "", 
  employees: "", businessDescription: "",
  
  // P&L
  revenue: "", cogs: "", grossProfit: "", operatingExpenses: "", 
  ebitda: "", depreciation: "", ebit: "", interestExpense: "", 
  pretaxIncome: "", taxRate: "", taxes: "", netIncome: "",
  
  // Balance Sheet Assets
  cash: "", accountsReceivable: "", inventory: "", otherCurrentAssets: "",
  totalCurrentAssets: "", ppe: "", intangibleAssets: "", otherAssets: "", totalAssets: "",
  
  // Balance Sheet Liabilities  
  accountsPayable: "", accruedLiabilities: "", shortTermDebt: "", otherCurrentLiabilities: "",
  currentLiabilities: "", longTermDebt: "", otherLiabilities: "", totalLiabilities: "",
  
  // Balance Sheet Equity
  shareCapital: "", retainedEarnings: "", otherEquity: "", totalEquity: "",
  
  // Cash Flow
  operatingCashFlow: "", investingCashFlow: "", financingCashFlow: "", 
  freeCashFlow: "", capex: "",
  
  // Capital & Depreciation
  depreciationYears: "", capexAsPercentOfRevenue: "",
  
  // Working Capital
  workingCapitalDays: "", workingCapitalAccountsReceivable: "", 
  workingCapitalInventory: "", workingCapitalAccountsPayable: "",
  
  // Growth Projections
  projectionYears: "", revenueGrowthYear1: "", revenueGrowthYear2: "", 
  revenueGrowthYear3: "", revenueGrowthYear4: "", revenueGrowthYear5: "",
  ebitdaMarginYear1: "", ebitdaMarginYear2: "", ebitdaMarginYear3: "",
  ebitdaMarginYear4: "", ebitdaMarginYear5: "",
  
  // Growth Scenarios
  baseScenarioName: "", baseScenarioDescription: "", baseScenarioProbability: "",
  optimisticScenarioName: "", optimisticScenarioDescription: "", optimisticScenarioProbability: "",
  pessimisticScenarioName: "", pessimisticScenarioDescription: "", pessimisticScenarioProbability: "",
  
  // Seasonality
  january: "", february: "", march: "", april: "", may: "", june: "",
  july: "", august: "", september: "", october: "", november: "", december: "",
  seasonalWorkingCapital: "", seasonalityPattern: "",
  
  // Debt Structure
  seniorSecuredType: "", seniorSecuredPrincipal: "", seniorSecuredOutstanding: "",
  seniorSecuredInterestRate: "", seniorSecuredBaseRate: "", seniorSecuredSpread: "",
  seniorSecuredMaturityDate: "", subordinatedType: "", subordinatedPrincipal: "",
  subordinatedOutstanding: "", subordinatedInterestRate: "", subordinatedBaseRate: "",
  subordinatedSpread: "", subordinatedMaturityDate: "", revolvingType: "",
  revolvingPrincipal: "", revolvingOutstanding: "", revolvingInterestRate: "",
  revolvingBaseRate: "", revolvingSpread: "", revolvingMaturityDate: "",
  
  // Covenants
  debtToEbitdaThreshold: "", dscrThreshold: "", interestCoverageThreshold: "",
  liquidityThreshold: "", capexThreshold: "",
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
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="company-info">Company</TabsTrigger>
                <TabsTrigger value="financial-data">Financial</TabsTrigger>
                <TabsTrigger value="growth-projections">Growth</TabsTrigger>
                <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
                <TabsTrigger value="debt-structure">Debt</TabsTrigger>
                <TabsTrigger value="covenants">Covenants</TabsTrigger>
              </TabsList>

              <TabsContent value="company-info" className="space-y-4">
                <CompanyInfoForm 
                  data={{
                    companyName: formData.companyName,
                    industry: formData.industry,
                    location: formData.location,
                    fiscalYearEnd: formData.fiscalYearEnd,
                    employees: formData.employees,
                    businessDescription: formData.businessDescription,
                  }}
                  onChange={updateFormData}
                />
              </TabsContent>

              <TabsContent value="financial-data" className="space-y-4">
                <FinancialDataForm 
                  data={{
                    revenue: formData.revenue,
                    cogs: formData.cogs,
                    grossProfit: formData.grossProfit,
                    operatingExpenses: formData.operatingExpenses,
                    ebitda: formData.ebitda,
                    depreciation: formData.depreciation,
                    ebit: formData.ebit,
                    interestExpense: formData.interestExpense,
                    pretaxIncome: formData.pretaxIncome,
                    taxRate: formData.taxRate,
                    taxes: formData.taxes,
                    netIncome: formData.netIncome,
                    cash: formData.cash,
                    accountsReceivable: formData.accountsReceivable,
                    inventory: formData.inventory,
                    otherCurrentAssets: formData.otherCurrentAssets,
                    totalCurrentAssets: formData.totalCurrentAssets,
                    ppe: formData.ppe,
                    intangibleAssets: formData.intangibleAssets,
                    otherAssets: formData.otherAssets,
                    totalAssets: formData.totalAssets,
                    accountsPayable: formData.accountsPayable,
                    accruedLiabilities: formData.accruedLiabilities,
                    shortTermDebt: formData.shortTermDebt,
                    otherCurrentLiabilities: formData.otherCurrentLiabilities,
                    currentLiabilities: formData.currentLiabilities,
                    longTermDebt: formData.longTermDebt,
                    otherLiabilities: formData.otherLiabilities,
                    totalLiabilities: formData.totalLiabilities,
                    shareCapital: formData.shareCapital,
                    retainedEarnings: formData.retainedEarnings,
                    otherEquity: formData.otherEquity,
                    totalEquity: formData.totalEquity,
                    operatingCashFlow: formData.operatingCashFlow,
                    investingCashFlow: formData.investingCashFlow,
                    financingCashFlow: formData.financingCashFlow,
                    freeCashFlow: formData.freeCashFlow,
                    capex: formData.capex,
                  }}
                  onChange={updateFormData}
                />
              </TabsContent>

              <TabsContent value="growth-projections" className="space-y-4">
                <GrowthProjectionsForm 
                  data={{
                    projectionYears: formData.projectionYears,
                    capexAsPercentOfRevenue: formData.capexAsPercentOfRevenue,
                    depreciationYears: formData.depreciationYears,
                    workingCapitalDays: formData.workingCapitalDays,
                    workingCapitalAccountsReceivable: formData.workingCapitalAccountsReceivable,
                    workingCapitalInventory: formData.workingCapitalInventory,
                    workingCapitalAccountsPayable: formData.workingCapitalAccountsPayable,
                    revenueGrowthYear1: formData.revenueGrowthYear1,
                    revenueGrowthYear2: formData.revenueGrowthYear2,
                    revenueGrowthYear3: formData.revenueGrowthYear3,
                    revenueGrowthYear4: formData.revenueGrowthYear4,
                    revenueGrowthYear5: formData.revenueGrowthYear5,
                    ebitdaMarginYear1: formData.ebitdaMarginYear1,
                    ebitdaMarginYear2: formData.ebitdaMarginYear2,
                    ebitdaMarginYear3: formData.ebitdaMarginYear3,
                    ebitdaMarginYear4: formData.ebitdaMarginYear4,
                    ebitdaMarginYear5: formData.ebitdaMarginYear5,
                    baseScenarioName: formData.baseScenarioName,
                    baseScenarioDescription: formData.baseScenarioDescription,
                    baseScenarioProbability: formData.baseScenarioProbability,
                    optimisticScenarioName: formData.optimisticScenarioName,
                    optimisticScenarioDescription: formData.optimisticScenarioDescription,
                    optimisticScenarioProbability: formData.optimisticScenarioProbability,
                    pessimisticScenarioName: formData.pessimisticScenarioName,
                    pessimisticScenarioDescription: formData.pessimisticScenarioDescription,
                    pessimisticScenarioProbability: formData.pessimisticScenarioProbability,
                  }}
                  onChange={updateFormData}
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
                    seasonalWorkingCapital: formData.seasonalWorkingCapital,
                    seasonalityPattern: formData.seasonalityPattern,
                  }}
                  onChange={updateFormData}
                />
              </TabsContent>

              <TabsContent value="debt-structure" className="space-y-4">
                <DebtStructureForm 
                  data={{
                    seniorSecuredType: formData.seniorSecuredType,
                    seniorSecuredPrincipal: formData.seniorSecuredPrincipal,
                    seniorSecuredOutstanding: formData.seniorSecuredOutstanding,
                    seniorSecuredInterestRate: formData.seniorSecuredInterestRate,
                    seniorSecuredBaseRate: formData.seniorSecuredBaseRate,
                    seniorSecuredSpread: formData.seniorSecuredSpread,
                    seniorSecuredMaturityDate: formData.seniorSecuredMaturityDate,
                    subordinatedType: formData.subordinatedType,
                    subordinatedPrincipal: formData.subordinatedPrincipal,
                    subordinatedOutstanding: formData.subordinatedOutstanding,
                    subordinatedInterestRate: formData.subordinatedInterestRate,
                    subordinatedBaseRate: formData.subordinatedBaseRate,
                    subordinatedSpread: formData.subordinatedSpread,
                    subordinatedMaturityDate: formData.subordinatedMaturityDate,
                    revolvingType: formData.revolvingType,
                    revolvingPrincipal: formData.revolvingPrincipal,
                    revolvingOutstanding: formData.revolvingOutstanding,
                    revolvingInterestRate: formData.revolvingInterestRate,
                    revolvingBaseRate: formData.revolvingBaseRate,
                    revolvingSpread: formData.revolvingSpread,
                    revolvingMaturityDate: formData.revolvingMaturityDate,
                  }}
                  onChange={updateFormData}
                />
              </TabsContent>

              <TabsContent value="covenants" className="space-y-4">
                <CovenantForm 
                  data={{
                    debtToEbitdaThreshold: formData.debtToEbitdaThreshold,
                    dscrThreshold: formData.dscrThreshold,
                    interestCoverageThreshold: formData.interestCoverageThreshold,
                    liquidityThreshold: formData.liquidityThreshold,
                    capexThreshold: formData.capexThreshold,
                  }}
                  onChange={updateFormData}
                />
              </TabsContent>
            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => {
                  const steps = ["company-info", "financial-data", "growth-projections", "seasonality", "debt-structure", "covenants"];
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
                  const steps = ["company-info", "financial-data", "growth-projections", "seasonality", "debt-structure", "covenants"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }}
                disabled={currentStep === "covenants"}
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