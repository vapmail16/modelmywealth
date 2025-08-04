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
  taxes: string;
  netIncome: string;
  
  // Financial Data - Balance Sheet
  cash: string;
  accountsReceivable: string;
  inventory: string;
  currentAssets: string;
  totalAssets: string;
  accountsPayable: string;
  currentLiabilities: string;
  totalDebt: string;
  totalEquity: string;
  
  // Financial Data - Cash Flow
  operatingCashFlow: string;
  investingCashFlow: string;
  financingCashFlow: string;
  freeCashFlow: string;
  capex: string;
  
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
  
  // Debt Structure
  seniorSecuredLoanType: string;
  additionalLoanSeniorSecured: string;
  bankBaseRateSeniorSecured: string;
  liquidityPremiumsSeniorSecured: string;
  creditRiskPremiumsSeniorSecured: string;
  maturityYearsSeniorSecured: string;
  amortizationYearsSeniorSecured: string;
  shortTermLoanType: string;
  additionalLoanShortTerm: string;
  bankBaseRateShortTerm: string;
  liquidityPremiumsShortTerm: string;
  creditRiskPremiumsShortTerm: string;
  maturityYearsShortTerm: string;
  amortizationYearsShortTerm: string;
}

const initialFormData: DataEntryFormData = {
  // Initialize all fields to empty strings
  companyName: "", industry: "", location: "", fiscalYearEnd: "", 
  employees: "", businessDescription: "", revenue: "", cogs: "", 
  grossProfit: "", operatingExpenses: "", ebitda: "", depreciation: "", 
  ebit: "", interestExpense: "", pretaxIncome: "", taxes: "", 
  netIncome: "", cash: "", accountsReceivable: "", inventory: "", 
  currentAssets: "", totalAssets: "", accountsPayable: "", 
  currentLiabilities: "", totalDebt: "", totalEquity: "", 
  operatingCashFlow: "", investingCashFlow: "", financingCashFlow: "", 
  freeCashFlow: "", capex: "", january: "", february: "", march: "", 
  april: "", may: "", june: "", july: "", august: "", september: "", 
  october: "", november: "", december: "", seasonalWorkingCapital: "", 
  seasonalityPattern: "", seniorSecuredLoanType: "", 
  additionalLoanSeniorSecured: "", bankBaseRateSeniorSecured: "", 
  liquidityPremiumsSeniorSecured: "", creditRiskPremiumsSeniorSecured: "", 
  maturityYearsSeniorSecured: "", amortizationYearsSeniorSecured: "", 
  shortTermLoanType: "", additionalLoanShortTerm: "", 
  bankBaseRateShortTerm: "", liquidityPremiumsShortTerm: "", 
  creditRiskPremiumsShortTerm: "", maturityYearsShortTerm: "", 
  amortizationYearsShortTerm: "",
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
                    taxes: formData.taxes,
                    netIncome: formData.netIncome,
                    cash: formData.cash,
                    accountsReceivable: formData.accountsReceivable,
                    inventory: formData.inventory,
                    currentAssets: formData.currentAssets,
                    totalAssets: formData.totalAssets,
                    accountsPayable: formData.accountsPayable,
                    currentLiabilities: formData.currentLiabilities,
                    totalDebt: formData.totalDebt,
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
                    seniorSecuredLoanType: formData.seniorSecuredLoanType,
                    additionalLoanSeniorSecured: formData.additionalLoanSeniorSecured,
                    bankBaseRateSeniorSecured: formData.bankBaseRateSeniorSecured,
                    liquidityPremiumsSeniorSecured: formData.liquidityPremiumsSeniorSecured,
                    creditRiskPremiumsSeniorSecured: formData.creditRiskPremiumsSeniorSecured,
                    maturityYearsSeniorSecured: formData.maturityYearsSeniorSecured,
                    amortizationYearsSeniorSecured: formData.amortizationYearsSeniorSecured,
                    shortTermLoanType: formData.shortTermLoanType,
                    additionalLoanShortTerm: formData.additionalLoanShortTerm,
                    bankBaseRateShortTerm: formData.bankBaseRateShortTerm,
                    liquidityPremiumsShortTerm: formData.liquidityPremiumsShortTerm,
                    creditRiskPremiumsShortTerm: formData.creditRiskPremiumsShortTerm,
                    maturityYearsShortTerm: formData.maturityYearsShortTerm,
                    amortizationYearsShortTerm: formData.amortizationYearsShortTerm,
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