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
  // Company Info
  companyName: string;
  industry: string;
  location: string;
  fiscalYearEnd: string;
  employees: string;
  businessDescription: string;
  
  // Financial Data - P&L
  revenue: string;
  cogs: string;
  grossProfit: string;
  operatingExpenses: string;
  ebitda: string;
  depreciation: string;
  ebit: string;
  interestExpense: string;
  pretaxIncome: string;
  taxRate: string; // MISSING FIELD 1: Tax Rate
  taxes: string;
  netIncome: string;
  
  // Financial Data - Balance Sheet Assets
  cash: string;
  accountsReceivable: string;
  inventory: string;
  otherCurrentAssets: string;
  totalCurrentAssets: string;
  ppe: string;
  intangibleAssets: string;
  otherAssets: string;
  totalAssets: string;
  
  // Financial Data - Balance Sheet Liabilities
  accountsPayable: string;
  accruedLiabilities: string;
  shortTermDebt: string;
  otherCurrentLiabilities: string;
  currentLiabilities: string;
  longTermDebt: string;
  otherLiabilities: string;
  totalLiabilities: string;
  
  // Financial Data - Balance Sheet Equity
  shareCapital: string;
  retainedEarnings: string;
  otherEquity: string;
  totalEquity: string;
  
  // Financial Data - Cash Flow
  operatingCashFlow: string;
  investingCashFlow: string;
  financingCashFlow: string;
  freeCashFlow: string;
  capex: string; // MISSING FIELD 2: Capex (already present)
  
  // Capital & Depreciation (MISSING FIELDS)
  depreciationYears: string; // MISSING FIELD 3: Depreciation Years
  capexAsPercentOfRevenue: string;
  
  // Working Capital (MISSING FIELD 5)
  workingCapitalDays: string;
  workingCapitalAccountsReceivable: string;
  workingCapitalInventory: string;
  workingCapitalAccountsPayable: string;
  
  // Growth Projections (MISSING FIELD 4: Projections Year Growth Rates)
  projectionYears: string;
  revenueGrowthYear1: string;
  revenueGrowthYear2: string;
  revenueGrowthYear3: string;
  revenueGrowthYear4: string;
  revenueGrowthYear5: string;
  ebitdaMarginYear1: string;
  ebitdaMarginYear2: string;
  ebitdaMarginYear3: string;
  ebitdaMarginYear4: string;
  ebitdaMarginYear5: string;
  
  // Growth Scenarios
  baseScenarioName: string;
  baseScenarioDescription: string;
  baseScenarioProbability: string;
  optimisticScenarioName: string;
  optimisticScenarioDescription: string;
  optimisticScenarioProbability: string;
  pessimisticScenarioName: string;
  pessimisticScenarioDescription: string;
  pessimisticScenarioProbability: string;
  
  // Seasonality
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  seasonalWorkingCapital: string;
  seasonalityPattern: string;
  
  // Debt Structure - Senior Secured
  seniorSecuredType: string;
  seniorSecuredPrincipal: string;
  seniorSecuredOutstanding: string;
  seniorSecuredInterestRate: string;
  seniorSecuredBaseRate: string;
  seniorSecuredSpread: string;
  seniorSecuredMaturityDate: string;
  
  // Debt Structure - Subordinated
  subordinatedType: string;
  subordinatedPrincipal: string;
  subordinatedOutstanding: string;
  subordinatedInterestRate: string;
  subordinatedBaseRate: string;
  subordinatedSpread: string;
  subordinatedMaturityDate: string;
  
  // Debt Structure - Revolving Credit
  revolvingType: string;
  revolvingPrincipal: string;
  revolvingOutstanding: string;
  revolvingInterestRate: string;
  revolvingBaseRate: string;
  revolvingSpread: string;
  revolvingMaturityDate: string;
  
  // Covenants
  debtToEbitdaThreshold: string;
  dscrThreshold: string;
  interestCoverageThreshold: string;
  liquidityThreshold: string;
  capexThreshold: string;
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