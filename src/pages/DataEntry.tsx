import React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Save, Download } from "lucide-react";

// Import form components
import CompanyDetailsForm from "@/components/data-entry/CompanyDetailsForm";
import ProfitLossForm from "@/components/data-entry/ProfitLossForm";
import BalanceSheetForm from "@/components/data-entry/BalanceSheetForm";
import DebtStructureForm from "@/components/data-entry/DebtStructureForm";
import GrowthAssumptionsForm from "@/components/data-entry/GrowthAssumptionsForm";
import WorkingCapitalForm from "@/components/data-entry/WorkingCapitalForm";
import SeasonalityForm from "@/components/data-entry/SeasonalityForm";
import CashFlowForm from "@/components/data-entry/CashFlowForm";

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
  const [currentStep, setCurrentStep] = useState("company-details");
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
                <TabsTrigger value="company-details">Company Details</TabsTrigger>
                <TabsTrigger value="profit-loss">P&L & Tax</TabsTrigger>
                <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                <TabsTrigger value="debt-structure">Debt Structure</TabsTrigger>
              </TabsList>
              <TabsList className="grid w-full grid-cols-4 mt-2">
                <TabsTrigger value="growth-assumptions">Growth & Projections</TabsTrigger>
                <TabsTrigger value="working-capital">Working Capital</TabsTrigger>
                <TabsTrigger value="seasonality">Seasonality</TabsTrigger>
                <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
              </TabsList>

              <TabsContent value="company-details" className="space-y-4">
                <CompanyDetailsForm 
                  data={{
                    company_name: formData.company_name,
                    industry: formData.industry,
                    region: formData.region,
                    country: formData.country,
                    employee_count: formData.employee_count,
                    founded: formData.founded,
                    company_website: formData.company_website,
                    business_case: formData.business_case,
                    notes: formData.notes,
                    projection_start_month: formData.projection_start_month,
                    projection_start_year: formData.projection_start_year,
                    projections_year: formData.projections_year,
                    reporting_currency: formData.reporting_currency,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="profit-loss" className="space-y-4">
                <ProfitLossForm 
                  data={{
                    revenue: formData.revenue,
                    cogs: formData.cogs,
                    gross_profit: formData.gross_profit,
                    operating_expenses: formData.operating_expenses,
                    ebitda: formData.ebitda,
                    depreciation: formData.depreciation,
                    ebit: formData.ebit,
                    interest_expense: formData.interest_expense,
                    pretax_income: formData.pretax_income,
                    tax_rates: formData.tax_rates,
                    taxes: formData.taxes,
                    net_income: formData.net_income,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="balance-sheet" className="space-y-4">
                <BalanceSheetForm 
                  data={{
                    cash: formData.cash,
                    accounts_receivable: formData.accounts_receivable,
                    inventory: formData.inventory,
                    other_current_assets: formData.other_current_assets,
                    ppe: formData.ppe,
                    other_assets: formData.other_assets,
                    total_assets: formData.total_assets,
                    accounts_payable_provisions: formData.accounts_payable_provisions,
                    short_term_debt: formData.short_term_debt,
                    other_long_term_debt: formData.other_long_term_debt,
                    senior_secured: formData.senior_secured,
                    debt_tranche1: formData.debt_tranche1,
                    retained_earnings: formData.retained_earnings,
                    equity: formData.equity,
                    total_liabilities_and_equity: formData.total_liabilities_and_equity,
                    capital_expenditure_additions: formData.capital_expenditure_additions,
                    asset_depreciated_over_years: formData.asset_depreciated_over_years,
                    additional_capex_planned_next_year: formData.additional_capex_planned_next_year,
                    asset_depreciated_over_years_new: formData.asset_depreciated_over_years_new,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="debt-structure" className="space-y-4">
                <DebtStructureForm 
                  data={{
                    senior_secured_loan_type: formData.senior_secured_loan_type,
                    additional_loan_senior_secured: formData.additional_loan_senior_secured,
                    bank_base_rate_senior_secured: formData.bank_base_rate_senior_secured,
                    liquidity_premiums_senior_secured: formData.liquidity_premiums_senior_secured,
                    credit_risk_premiums_senior_secured: formData.credit_risk_premiums_senior_secured,
                    maturity_y_senior_secured: formData.maturity_y_senior_secured,
                    amortization_y_senior_secured: formData.amortization_y_senior_secured,
                    short_term_loan_type: formData.short_term_loan_type,
                    additional_loan_short_term: formData.additional_loan_short_term,
                    bank_base_rate_short_term: formData.bank_base_rate_short_term,
                    liquidity_premiums_short_term: formData.liquidity_premiums_short_term,
                    credit_risk_premiums_short_term: formData.credit_risk_premiums_short_term,
                    maturity_y_short_term: formData.maturity_y_short_term,
                    amortization_y_short_term: formData.amortization_y_short_term,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="growth-assumptions" className="space-y-4">
                <GrowthAssumptionsForm 
                  data={{
                    gr_revenue_1: formData.gr_revenue_1, gr_revenue_2: formData.gr_revenue_2, gr_revenue_3: formData.gr_revenue_3, gr_revenue_4: formData.gr_revenue_4, gr_revenue_5: formData.gr_revenue_5,
                    gr_revenue_6: formData.gr_revenue_6, gr_revenue_7: formData.gr_revenue_7, gr_revenue_8: formData.gr_revenue_8, gr_revenue_9: formData.gr_revenue_9, gr_revenue_10: formData.gr_revenue_10,
                    gr_revenue_11: formData.gr_revenue_11, gr_revenue_12: formData.gr_revenue_12,
                    gr_cost_1: formData.gr_cost_1, gr_cost_2: formData.gr_cost_2, gr_cost_3: formData.gr_cost_3, gr_cost_4: formData.gr_cost_4, gr_cost_5: formData.gr_cost_5,
                    gr_cost_6: formData.gr_cost_6, gr_cost_7: formData.gr_cost_7, gr_cost_8: formData.gr_cost_8, gr_cost_9: formData.gr_cost_9, gr_cost_10: formData.gr_cost_10,
                    gr_cost_11: formData.gr_cost_11, gr_cost_12: formData.gr_cost_12,
                    gr_cost_oper_1: formData.gr_cost_oper_1, gr_cost_oper_2: formData.gr_cost_oper_2, gr_cost_oper_3: formData.gr_cost_oper_3, gr_cost_oper_4: formData.gr_cost_oper_4, gr_cost_oper_5: formData.gr_cost_oper_5,
                    gr_cost_oper_6: formData.gr_cost_oper_6, gr_cost_oper_7: formData.gr_cost_oper_7, gr_cost_oper_8: formData.gr_cost_oper_8, gr_cost_oper_9: formData.gr_cost_oper_9, gr_cost_oper_10: formData.gr_cost_oper_10,
                    gr_cost_oper_11: formData.gr_cost_oper_11, gr_cost_oper_12: formData.gr_cost_oper_12,
                    gr_capex_1: formData.gr_capex_1, gr_capex_2: formData.gr_capex_2, gr_capex_3: formData.gr_capex_3, gr_capex_4: formData.gr_capex_4, gr_capex_5: formData.gr_capex_5,
                    gr_capex_6: formData.gr_capex_6, gr_capex_7: formData.gr_capex_7, gr_capex_8: formData.gr_capex_8, gr_capex_9: formData.gr_capex_9, gr_capex_10: formData.gr_capex_10,
                    gr_capex_11: formData.gr_capex_11, gr_capex_12: formData.gr_capex_12,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="working-capital" className="space-y-4">
                <WorkingCapitalForm 
                  data={{
                    account_receivable_percent: formData.account_receivable_percent,
                    inventory_percent: formData.inventory_percent,
                    other_current_assets_percent: formData.other_current_assets_percent,
                    accounts_payable_percent: formData.accounts_payable_percent,
                  }}
                  onChange={(data) => updateFormData(data)}
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
                    seasonal_working_capital: formData.seasonal_working_capital,
                    seasonality_pattern: formData.seasonality_pattern,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

              <TabsContent value="cash-flow" className="space-y-4">
                <CashFlowForm 
                  data={{
                    operating_cash_flow: formData.operating_cash_flow,
                    capital_expenditures: formData.capital_expenditures,
                    free_cash_flow: formData.free_cash_flow,
                    debt_service: formData.debt_service,
                  }}
                  onChange={(data) => updateFormData(data)}
                />
              </TabsContent>

            </Tabs>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => {
                  const steps = ["company-details", "profit-loss", "balance-sheet", "debt-structure", "growth-assumptions", "working-capital", "seasonality", "cash-flow"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }}
                disabled={currentStep === "company-details"}
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  const steps = ["company-details", "profit-loss", "balance-sheet", "debt-structure", "growth-assumptions", "working-capital", "seasonality", "cash-flow"];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }}
                disabled={currentStep === "cash-flow"}
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