import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Calculator,
  Building,
  TrendingUp,
  DollarSign,
  Save,
  Download,
  Upload,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  CreditCard,
  BarChart3,
  FileText,
  Calendar,
  Clock,
  Plus,
  Minus,
} from "lucide-react";


export default function DataEntry() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("company-info");
  const [formData, setFormData] = useState({
    // P&L Data
    revenue: "",
    cogs: "",
    grossProfit: "",
    operatingExpenses: "",
    ebitda: "",
    depreciation: "",
    ebit: "",
    interestExpense: "",
    pretaxIncome: "",
    taxes: "",
    taxRates: "",
    netIncome: "",
    
    // Balance Sheet - Assets
    cash: "",
    accountsReceivable: "",
    inventory: "",
    otherCurrentAssets: "",
    ppe: "",
    otherAssets: "",
    
    // Balance Sheet - Liabilities & Equity
    accountsPayableProvisions: "",
    seniorSecured: "",
    debtTranche1: "",
    equity: "",
    retainedEarnings: "",
    
    // Balance Sheet - Additional Fields
    capitalExpenditureAdditions: "",
    assetDepreciatedOverYears: "",
    
    // Debt Structure
    seniorSecuredLoanType: "",
    additionalLoanSeniorSecured: "",
    bankBaseRateSeniorSecured: "",
    liquidityPremiumsSeniorSecured: "",
    creditRiskPremiumsSeniorSecured: "",
    maturityYSeniorSecured: "",
    amortizationYSeniorSecured: "",
    
    shortTermLoanType: "",
    additionalLoanShortTerm: "",
    bankBaseRateShortTerm: "",
    liquidityPremiumsShortTerm: "",
    creditRiskPremiumsShortTerm: "",
    maturityYShortTerm: "",
    amortizationYShortTerm: "",
    
    // Cash Flow
    operatingCashFlow: "",
    capitalExpenditures: "",
    freeCashFlow: "",
    debtService: "",
    
    // Growth Assumptions - New Growth Rate Fields
    grRevenue1: "", grRevenue2: "", grRevenue3: "", grRevenue4: "", grRevenue5: "", grRevenue6: "",
    grRevenue7: "", grRevenue8: "", grRevenue9: "", grRevenue10: "", grRevenue11: "", grRevenue12: "",
    grCost1: "", grCost2: "", grCost3: "", grCost4: "", grCost5: "", grCost6: "",
    grCost7: "", grCost8: "", grCost9: "", grCost10: "", grCost11: "", grCost12: "",
    grCostOper1: "", grCostOper2: "", grCostOper3: "", grCostOper4: "", grCostOper5: "", grCostOper6: "",
    grCostOper7: "", grCostOper8: "", grCostOper9: "", grCostOper10: "", grCostOper11: "", grCostOper12: "",
    grCapex1: "", grCapex2: "", grCapex3: "", grCapex4: "", grCapex5: "", grCapex6: "",
    grCapex7: "", grCapex8: "", grCapex9: "", grCapex10: "", grCapex11: "", grCapex12: "",
    
    // Company Information
    industry: "",
    region: "",
    employeeCount: "",
    founded: "",
    projectionsYear: "",
    notes: "",
    
    // Working Capital Data
    accountReceivablePercent: "",
    otherCurrentAssetsPercent: "",
    inventoryPercent: "",
    accountsPayablePercent: "",
    
    // Seasonality Data
    seasonalityPattern: "",
    seasonalWorkingCapital: "",
    // Monthly Revenue Seasonality
    january: "", february: "", march: "", april: "", may: "", june: "",
    july: "", august: "", september: "", october: "", november: "", december: "",
  });

  const steps = [
    { id: "company-info", title: "Company Info", icon: Building },
    { id: "profit-loss", title: "P&L Statement", icon: Calculator },
    { id: "tax-rates", title: "Tax Rates", icon: FileText },
    { id: "balance-sheet", title: "Balance Sheet", icon: BarChart3 },
    { id: "debt-structure", title: "Debt Structure", icon: CreditCard },
    { id: "projections", title: "Projections", icon: TrendingUp },
    { id: "working-capital", title: "Working Capital", icon: DollarSign },
    { id: "seasonality", title: "Seasonality", icon: Calendar },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIncrement = (field: string, step: number = 0.1) => {
    const currentValue = parseFloat(formData[field as keyof typeof formData] as string) || 0;
    const newValue = (currentValue + step).toFixed(1);
    handleInputChange(field, newValue);
  };

  const handleDecrement = (field: string, step: number = 0.1) => {
    const currentValue = parseFloat(formData[field as keyof typeof formData] as string) || 0;
    const newValue = Math.max(0, currentValue - step).toFixed(1);
    handleInputChange(field, newValue);
  };

  const calculateGrossProfit = () => {
    const revenue = parseFloat(formData.revenue) || 0;
    const cogs = parseFloat(formData.cogs) || 0;
    return revenue - cogs;
  };

  const calculateEBITDA = () => {
    const grossProfit = calculateGrossProfit();
    const opex = parseFloat(formData.operatingExpenses) || 0;
    return grossProfit - opex;
  };

  const handleSave = () => {
    toast({
      title: "Data saved",
      description: "Your financial data has been saved as a draft.",
    });
  };

  const handleImport = () => {
    toast({
      title: "Import feature",
      description: "CSV/Excel import functionality coming soon.",
    });
  };

  // Calculate completion percentage
  const totalFields = Object.keys(formData).length;
  const completedFields = Object.values(formData).filter(value => value !== "").length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Data Entry</h1>
          <p className="text-muted-foreground mt-1">
            Complete comprehensive financial data for TTF refinancing analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleImport}>
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </div>

      {/* Navigation Steps - Removed completion tracking as requested */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Data Entry Sections</CardTitle>
          <CardDescription>Navigate between different financial data sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors cursor-pointer ${
                  currentStep === step.id
                    ? "bg-primary/10 border-primary"
                    : "bg-secondary/50 border-border hover:bg-secondary"
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={`p-2 rounded-md ${
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <step.icon className="h-4 w-4" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            {/* Profit & Loss Statement */}
            <TabsContent value="profit-loss">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Profit & Loss Statement (Annual, $M)
                  </CardTitle>
                  <CardDescription>
                    Enter your most recent fiscal year P&L data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Revenue Section */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Revenue & Costs</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="revenue">Revenue</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("revenue", 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="revenue"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.revenue}
                              onChange={(e) => handleInputChange("revenue", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("revenue", 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="cogs">Cost of Goods Sold or Services</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("cogs", 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="cogs"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.cogs}
                              onChange={(e) => handleInputChange("cogs", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("cogs", 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-accent/10 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Gross Profit:</span>
                            <span className="font-bold">${calculateGrossProfit().toFixed(1)}M</span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="operatingExpenses">Operating Expenses</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("operatingExpenses", 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="operatingExpenses"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.operatingExpenses}
                              onChange={(e) => handleInputChange("operatingExpenses", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("operatingExpenses", 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">EBITDA:</span>
                            <span className="font-bold text-primary">${calculateEBITDA().toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Below EBITDA */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Below EBITDA</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="depreciation">Depreciation & Amortization</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("depreciation", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="depreciation"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.depreciation}
                              onChange={(e) => handleInputChange("depreciation", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("depreciation", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="interestExpense">Interest Expense</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("interestExpense", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="interestExpense"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.interestExpense}
                              onChange={(e) => handleInputChange("interestExpense", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("interestExpense", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="taxes">Income Tax Expense</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("taxes", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="taxes"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.taxes}
                              onChange={(e) => handleInputChange("taxes", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("taxes", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="netIncome">Net Income</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("netIncome", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="netIncome"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.netIncome}
                              onChange={(e) => handleInputChange("netIncome", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("netIncome", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tax Rates */}
            <TabsContent value="tax-rates">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Tax Rates Configuration
                  </CardTitle>
                  <CardDescription>
                    Set the tax rates for your financial projections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Tax Rate Settings</h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="taxRates">Tax Rates (in %)</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("taxRates", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              id="taxRates"
                              type="number"
                              step="0.1"
                              placeholder="0.00"
                              value={formData.taxRates}
                              onChange={(e) => handleInputChange("taxRates", e.target.value)}
                              className="text-center flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("taxRates", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter the effective tax rate as a percentage (e.g., 25.0 for 25%)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Balance Sheet */}
            <TabsContent value="balance-sheet">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Fill in the Balance Sheet Fields
                  </CardTitle>
                  <CardDescription>
                    Enter your balance sheet data with increment/decrement controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assets */}
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Cash and Marketable Securities</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("cash", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.cash}
                              onChange={(e) => handleInputChange("cash", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("cash", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Accounts Receivable</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("accountsReceivable", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.accountsReceivable}
                              onChange={(e) => handleInputChange("accountsReceivable", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("accountsReceivable", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Inventory</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("inventory", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.inventory}
                              onChange={(e) => handleInputChange("inventory", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("inventory", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Other Current Assets</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("otherCurrentAssets", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.otherCurrentAssets}
                              onChange={(e) => handleInputChange("otherCurrentAssets", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("otherCurrentAssets", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Property, Plant & Equipment (Net)</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("ppe", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.ppe}
                              onChange={(e) => handleInputChange("ppe", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("ppe", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Other Assets/DTA</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("otherAssets", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.otherAssets}
                              onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("otherAssets", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Liabilities & Equity */}
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Accounts Payable/Provisions</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("accountsPayableProvisions", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.accountsPayableProvisions}
                              onChange={(e) => handleInputChange("accountsPayableProvisions", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("accountsPayableProvisions", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Senior Secured Debt 1</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("seniorSecured", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.seniorSecured}
                              onChange={(e) => handleInputChange("seniorSecured", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("seniorSecured", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Other Long Term Debt 2</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("debtTranche1", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.debtTranche1}
                              onChange={(e) => handleInputChange("debtTranche1", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("debtTranche1", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Equity</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("equity", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.equity}
                              onChange={(e) => handleInputChange("equity", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("equity", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label>Retained Earning</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement("retainedEarnings", 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData.retainedEarnings}
                              onChange={(e) => handleInputChange("retainedEarnings", e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement("retainedEarnings", 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Additional Balance Sheet Fields */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Additional Balance Sheet Items</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Capital Expenditure Additions</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("capitalExpenditureAdditions", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.capitalExpenditureAdditions}
                            onChange={(e) => handleInputChange("capitalExpenditureAdditions", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("capitalExpenditureAdditions", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Amount the business plans to spend as capital expenditures in the immediate next year
                        </p>
                      </div>
                      <div>
                        <Label>Asset Depreciated over years</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("assetDepreciatedOverYears", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.assetDepreciatedOverYears}
                            onChange={(e) => handleInputChange("assetDepreciatedOverYears", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("assetDepreciatedOverYears", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Guidance Section */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Guidance</h4>
                    <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Capital Expenditure Additions</h5>
                        <p className="text-xs text-muted-foreground">
                          This field represents the planned capital expenditures for the immediate next fiscal year. 
                          Capital expenditures (CapEx) are funds used to acquire, upgrade, and maintain physical assets 
                          such as property, industrial buildings, equipment, and technology. This amount should reflect 
                          your business's investment plans for growth, maintenance, or replacement of fixed assets in 
                          the upcoming year. It's crucial for cash flow projections and understanding future capital requirements.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Asset Depreciation Period</h5>
                        <p className="text-xs text-muted-foreground">
                          The number of years over which assets are depreciated affects your annual depreciation expense 
                          and impacts both your P&L and cash flow projections.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Debt Structure */}
            <TabsContent value="debt-structure">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Debt Structure Details
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of debt instruments and terms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Fill in the Required Fields</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Senior Secured Column */}
                    <div className="space-y-4">
                      <div>
                        <Label>Please select an option:</Label>
                        <Select value={formData.seniorSecuredLoanType} onValueChange={(value) => handleInputChange("seniorSecuredLoanType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Individual" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="consolidate">Consolidate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Additional Loan on restructuring (Senior Secured)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("additionalLoanSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.additionalLoanSeniorSecured}
                            onChange={(e) => handleInputChange("additionalLoanSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("additionalLoanSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Bank Base Rate (Senior Secured, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("bankBaseRateSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.bankBaseRateSeniorSecured}
                            onChange={(e) => handleInputChange("bankBaseRateSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("bankBaseRateSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Liquidity Premiums (Senior Secured, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("liquidityPremiumsSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.liquidityPremiumsSeniorSecured}
                            onChange={(e) => handleInputChange("liquidityPremiumsSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("liquidityPremiumsSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Credit Risk Premiums (Senior Secured, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("creditRiskPremiumsSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.creditRiskPremiumsSeniorSecured}
                            onChange={(e) => handleInputChange("creditRiskPremiumsSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("creditRiskPremiumsSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Maturity Period - Debt 1</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("maturityYSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.maturityYSeniorSecured}
                            onChange={(e) => handleInputChange("maturityYSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("maturityYSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Amortization Y (Senior Secured)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("amortizationYSeniorSecured", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.amortizationYSeniorSecured}
                            onChange={(e) => handleInputChange("amortizationYSeniorSecured", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("amortizationYSeniorSecured", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Short Term Column */}
                    <div className="space-y-4">
                      <div>
                        <Label>Please select an option:</Label>
                        <Select value={formData.shortTermLoanType} onValueChange={(value) => handleInputChange("shortTermLoanType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Individual" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="consolidate">Consolidate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Additional Loan on restructuring (Short Term)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("additionalLoanShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.additionalLoanShortTerm}
                            onChange={(e) => handleInputChange("additionalLoanShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("additionalLoanShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Bank Base Rate (Short Term, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("bankBaseRateShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.bankBaseRateShortTerm}
                            onChange={(e) => handleInputChange("bankBaseRateShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("bankBaseRateShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Liquidity Premiums (Short Term, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("liquidityPremiumsShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.liquidityPremiumsShortTerm}
                            onChange={(e) => handleInputChange("liquidityPremiumsShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("liquidityPremiumsShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Credit Risk Premiums (Short Term, in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("creditRiskPremiumsShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.creditRiskPremiumsShortTerm}
                            onChange={(e) => handleInputChange("creditRiskPremiumsShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("creditRiskPremiumsShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Maturity Period - Debt 2</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("maturityYShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.maturityYShortTerm}
                            onChange={(e) => handleInputChange("maturityYShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("maturityYShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Amortization Y (Short Term)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("amortizationYShortTerm", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.amortizationYShortTerm}
                            onChange={(e) => handleInputChange("amortizationYShortTerm", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("amortizationYShortTerm", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cash Flow */}
            <TabsContent value="cash-flow">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Cash Flow Statement ($M)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Operating Activities</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Operating Cash Flow</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="18.2" 
                            value={formData.operatingCashFlow}
                            onChange={(e) => handleInputChange("operatingCashFlow", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Capital Expenditures</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="5.1" 
                            value={formData.capitalExpenditures}
                            onChange={(e) => handleInputChange("capitalExpenditures", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Financing</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Free Cash Flow</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="13.1" 
                            value={formData.freeCashFlow}
                            onChange={(e) => handleInputChange("freeCashFlow", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Annual Debt Service</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="5.4" 
                            value={formData.debtService}
                            onChange={(e) => handleInputChange("debtService", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projections */}
            <TabsContent value="projections">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Growth Projections & Assumptions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Growth Rate (GR, in %)</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* GR of Revenue Column */}
                    <div className="space-y-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={`revenue-${i + 1}`}>
                          <Label>GR of Revenue p.a {i + 1}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement(`grRevenue${i + 1}`, 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData[`grRevenue${i + 1}` as keyof typeof formData]}
                              onChange={(e) => handleInputChange(`grRevenue${i + 1}`, e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement(`grRevenue${i + 1}`, 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* GR in Cost Column */}
                    <div className="space-y-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={`cost-${i + 1}`}>
                          <Label>GR in Cost p.a {i + 1}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement(`grCost${i + 1}`, 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData[`grCost${i + 1}` as keyof typeof formData]}
                              onChange={(e) => handleInputChange(`grCost${i + 1}`, e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement(`grCost${i + 1}`, 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* GR in Cost (Oper) Column */}
                    <div className="space-y-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={`costoper-${i + 1}`}>
                          <Label>GR in Cost p.a (Oper) {i + 1}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement(`grCostOper${i + 1}`, 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData[`grCostOper${i + 1}` as keyof typeof formData]}
                              onChange={(e) => handleInputChange(`grCostOper${i + 1}`, e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement(`grCostOper${i + 1}`, 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* GR in Capex Column */}
                    <div className="space-y-4">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={`capex-${i + 1}`}>
                          <Label>GR in Capex p.a {i + 1}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement(`grCapex${i + 1}`, 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData[`grCapex${i + 1}` as keyof typeof formData]}
                              onChange={(e) => handleInputChange(`grCapex${i + 1}`, e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement(`grCapex${i + 1}`, 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Information */}
            <TabsContent value="company-info">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Industry</Label>
                        <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="financial">Financial Services</SelectItem>
                            <SelectItem value="energy">Energy</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Geographic Region</Label>
                        <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="north-america">North America</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                            <SelectItem value="latin-america">Latin America</SelectItem>
                            <SelectItem value="global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Employee Count</Label>
                        <Input 
                          type="number" 
                          placeholder="450" 
                          value={formData.employeeCount}
                          onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Year Founded</Label>
                        <Input 
                          type="number" 
                          placeholder="1995" 
                          value={formData.founded}
                          onChange={(e) => handleInputChange("founded", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Projections Year</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("projectionsYear", 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="1"
                            placeholder="12.00" 
                            value={formData.projectionsYear}
                            onChange={(e) => handleInputChange("projectionsYear", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("projectionsYear", 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Additional Notes</Label>
                    <Textarea
                      placeholder="Any additional context about the company, recent events, or specific considerations for the refinancing analysis..."
                      className="min-h-[120px]"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Working Capital */}
            <TabsContent value="working-capital">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Working Capital Analysis
                  </CardTitle>
                  <CardDescription>
                    Detailed working capital cycle and seasonal requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">Working Capital Assumptions</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Account Receivable as a % of 12 Months Forward Revenue (in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("accountReceivablePercent", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.accountReceivablePercent}
                            onChange={(e) => handleInputChange("accountReceivablePercent", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("accountReceivablePercent", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Inventory % of 12 Months Forward COGS (in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("inventoryPercent", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.inventoryPercent}
                            onChange={(e) => handleInputChange("inventoryPercent", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("inventoryPercent", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Other Current Assets % of 12 Months Forward Revenue (in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("otherCurrentAssetsPercent", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.otherCurrentAssetsPercent}
                            onChange={(e) => handleInputChange("otherCurrentAssetsPercent", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("otherCurrentAssetsPercent", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Accounts Payable as a % of 12 Months Forward COGS/OPEX (in %)</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleDecrement("accountsPayablePercent", 0.1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="0.00" 
                            value={formData.accountsPayablePercent}
                            onChange={(e) => handleInputChange("accountsPayablePercent", e.target.value)}
                            className="text-center flex-1" 
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-10 w-10"
                            onClick={() => handleIncrement("accountsPayablePercent", 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seasonality */}
            <TabsContent value="seasonality">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Seasonality Patterns
                  </CardTitle>
                  <CardDescription>
                    Revenue distribution and seasonal working capital requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Seasonality Pattern</Label>
                      <Select value={formData.seasonalityPattern} onValueChange={(value) => handleInputChange("seasonalityPattern", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No seasonality</SelectItem>
                          <SelectItem value="q4">Q4 weighted (holiday retail)</SelectItem>
                          <SelectItem value="q1-q2">Q1-Q2 weighted (construction)</SelectItem>
                          <SelectItem value="summer">Summer weighted (tourism)</SelectItem>
                          <SelectItem value="custom">Custom pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Seasonality Pattern</Label>
                      <Select value={formData.seasonalityPattern} onValueChange={(value) => handleInputChange("seasonalityPattern", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No seasonality</SelectItem>
                          <SelectItem value="q4">Q4 weighted (holiday retail)</SelectItem>
                          <SelectItem value="q1-q2">Q1-Q2 weighted (construction)</SelectItem>
                          <SelectItem value="summer">Summer weighted (tourism)</SelectItem>
                          <SelectItem value="custom">Custom pattern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Peak Working Capital (% above average)</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="15.0" 
                        value={formData.seasonalWorkingCapital}
                        onChange={(e) => handleInputChange("seasonalWorkingCapital", e.target.value)}
                        className="text-right" 
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Monthly Revenue Seasonality */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-primary">Revenue Seasonality (in %)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      {[
                        'january', 'february', 'march', 'april', 'may', 'june',
                        'july', 'august', 'september', 'october', 'november', 'december'
                      ].map((month) => (
                        <div key={month}>
                          <Label>{month.charAt(0).toUpperCase() + month.slice(1)}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleDecrement(month, 0.1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="0.00" 
                              value={formData[month as keyof typeof formData]}
                              onChange={(e) => handleInputChange(month, e.target.value)}
                              className="text-center flex-1" 
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => handleIncrement(month, 0.1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline">
              Previous
            </Button>
            <Button className="gap-2" onClick={handleSave}>
              Save & Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Validation Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Completion Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">Data Format</p>
                  <p className="text-xs text-success">Valid</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {completionPercentage >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <div>
                  <p className="text-sm font-medium">Completeness</p>
                  <p className={`text-xs ${completionPercentage >= 80 ? 'text-success' : 'text-warning'}`}>
                    {completionPercentage}% Complete
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Validation</p>
                  <p className="text-xs text-muted-foreground">Ready for Analysis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Export Template
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" className="w-full gap-2">
                <Save className="h-4 w-4" />
                Save as Template
              </Button>
            </CardContent>
          </Card>

          {/* Data Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Data Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">💡 Accuracy</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use audited financial statements for the most reliable analysis
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium text-accent">⚡ Efficiency</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Save time by importing data directly from your existing spreadsheets
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}