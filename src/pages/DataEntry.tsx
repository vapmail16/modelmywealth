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
} from "lucide-react";

export default function DataEntry() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState("profit-loss");
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
    netIncome: "",
    
    // Balance Sheet - Assets
    cash: "",
    accountsReceivable: "",
    inventory: "",
    prepaidExpenses: "",
    currentAssets: "",
    ppe: "",
    intangibleAssets: "",
    goodwill: "",
    totalAssets: "",
    
    // Balance Sheet - Liabilities
    accountsPayable: "",
    accruedExpenses: "",
    shortTermDebt: "",
    currentLiabilities: "",
    longTermDebt: "",
    deferredTax: "",
    totalLiabilities: "",
    
    // Equity
    commonStock: "",
    retainedEarnings: "",
    totalEquity: "",
    
    // Debt Structure
    seniorSecuredDebt: "",
    seniorSecuredRate: "",
    seniorSecuredMaturity: "",
    secondLienDebt: "",
    secondLienRate: "",
    secondLienMaturity: "",
    subordinatedDebt: "",
    subordinatedRate: "",
    subordinatedMaturity: "",
    totalDebt: "",
    
    // Cash Flow
    operatingCashFlow: "",
    capitalExpenditures: "",
    freeCashFlow: "",
    debtService: "",
    
    // Growth Assumptions
    revenueGrowthY1: "",
    revenueGrowthY2: "",
    revenueGrowthY3: "",
    ebitdaMarginY1: "",
    ebitdaMarginY2: "",
    ebitdaMarginY3: "",
    capexPercent: "",
    workingCapitalDays: "",
    
    // Additional Data
    industry: "",
    region: "",
    employeeCount: "",
    founded: "",
    notes: "",
  });

  const steps = [
    { id: "profit-loss", title: "P&L Statement", icon: Calculator, completed: false },
    { id: "balance-sheet", title: "Balance Sheet", icon: Building, completed: false },
    { id: "debt-structure", title: "Debt Structure", icon: CreditCard, completed: false },
    { id: "cash-flow", title: "Cash Flow", icon: DollarSign, completed: false },
    { id: "projections", title: "Projections", icon: TrendingUp, completed: false },
    { id: "company-info", title: "Company Info", icon: BarChart3, completed: false },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      {/* Progress Steps */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Data Entry Progress</CardTitle>
          <CardDescription>Complete all sections for comprehensive analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={completionPercentage} className="h-2" />
            <div className="text-sm text-muted-foreground">
              {completedFields} of {totalFields} fields completed ({completionPercentage}%)
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="revenue">Total Revenue</Label>
                          <Input
                            id="revenue"
                            type="number"
                            step="0.1"
                            placeholder="125.5"
                            value={formData.revenue}
                            onChange={(e) => handleInputChange("revenue", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cogs">Cost of Goods Sold</Label>
                          <Input
                            id="cogs"
                            type="number"
                            step="0.1"
                            placeholder="75.2"
                            value={formData.cogs}
                            onChange={(e) => handleInputChange("cogs", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div className="bg-accent/10 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Gross Profit:</span>
                            <span className="font-bold">${calculateGrossProfit().toFixed(1)}M</span>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="operatingExpenses">Operating Expenses</Label>
                          <Input
                            id="operatingExpenses"
                            type="number"
                            step="0.1"
                            placeholder="25.8"
                            value={formData.operatingExpenses}
                            onChange={(e) => handleInputChange("operatingExpenses", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">EBITDA:</span>
                            <span className="font-bold text-primary">${calculateEBITDA().toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expenses & Income */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Below EBITDA</h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="depreciation">Depreciation & Amortization</Label>
                          <Input
                            id="depreciation"
                            type="number"
                            step="0.1"
                            placeholder="3.8"
                            value={formData.depreciation}
                            onChange={(e) => handleInputChange("depreciation", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="interestExpense">Interest Expense</Label>
                          <Input
                            id="interestExpense"
                            type="number"
                            step="0.1"
                            placeholder="4.2"
                            value={formData.interestExpense}
                            onChange={(e) => handleInputChange("interestExpense", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="taxes">Income Taxes</Label>
                          <Input
                            id="taxes"
                            type="number"
                            step="0.1"
                            placeholder="2.8"
                            value={formData.taxes}
                            onChange={(e) => handleInputChange("taxes", e.target.value)}
                            className="text-right"
                          />
                        </div>
                        <div>
                          <Label htmlFor="netIncome">Net Income</Label>
                          <Input
                            id="netIncome"
                            type="number"
                            step="0.1"
                            placeholder="13.7"
                            value={formData.netIncome}
                            onChange={(e) => handleInputChange("netIncome", e.target.value)}
                            className="text-right"
                          />
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
                    <Building className="h-5 w-5 text-primary" />
                    Balance Sheet Data (End of Period, $M)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Assets */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Assets</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Cash & Equivalents</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="8.7" 
                            value={formData.cash}
                            onChange={(e) => handleInputChange("cash", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Accounts Receivable</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="15.2" 
                            value={formData.accountsReceivable}
                            onChange={(e) => handleInputChange("accountsReceivable", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Inventory</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="22.5" 
                            value={formData.inventory}
                            onChange={(e) => handleInputChange("inventory", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>PP&E, Net</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="85.3" 
                            value={formData.ppe}
                            onChange={(e) => handleInputChange("ppe", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Intangible Assets</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="12.8" 
                            value={formData.intangibleAssets}
                            onChange={(e) => handleInputChange("intangibleAssets", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Liabilities */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Liabilities</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Accounts Payable</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="12.1" 
                            value={formData.accountsPayable}
                            onChange={(e) => handleInputChange("accountsPayable", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Accrued Expenses</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="8.3" 
                            value={formData.accruedExpenses}
                            onChange={(e) => handleInputChange("accruedExpenses", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Short-term Debt</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="5.5" 
                            value={formData.shortTermDebt}
                            onChange={(e) => handleInputChange("shortTermDebt", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Long-term Debt</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="39.7" 
                            value={formData.longTermDebt}
                            onChange={(e) => handleInputChange("longTermDebt", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Deferred Tax Liabilities</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="2.8" 
                            value={formData.deferredTax}
                            onChange={(e) => handleInputChange("deferredTax", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Equity */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Equity</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Common Stock</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="5.0" 
                            value={formData.commonStock}
                            onChange={(e) => handleInputChange("commonStock", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Retained Earnings</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="69.4" 
                            value={formData.retainedEarnings}
                            onChange={(e) => handleInputChange("retainedEarnings", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Total Equity</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="74.4" 
                            value={formData.totalEquity}
                            onChange={(e) => handleInputChange("totalEquity", e.target.value)}
                            className="text-right" 
                          />
                        </div>
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
                  <div className="space-y-6">
                    {/* Senior Secured Debt */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Senior Secured Debt</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Amount ($M)</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="29.4" 
                            value={formData.seniorSecuredDebt}
                            onChange={(e) => handleInputChange("seniorSecuredDebt", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Interest Rate (%)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="5.25" 
                            value={formData.seniorSecuredRate}
                            onChange={(e) => handleInputChange("seniorSecuredRate", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Maturity Year</Label>
                          <Input 
                            type="number" 
                            placeholder="2028" 
                            value={formData.seniorSecuredMaturity}
                            onChange={(e) => handleInputChange("seniorSecuredMaturity", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Second Lien Debt */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Second Lien Debt</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Amount ($M)</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="15.8" 
                            value={formData.secondLienDebt}
                            onChange={(e) => handleInputChange("secondLienDebt", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Interest Rate (%)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            placeholder="8.75" 
                            value={formData.secondLienRate}
                            onChange={(e) => handleInputChange("secondLienRate", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Maturity Year</Label>
                          <Input 
                            type="number" 
                            placeholder="2029" 
                            value={formData.secondLienMaturity}
                            onChange={(e) => handleInputChange("secondLienMaturity", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-accent/10 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">Total Debt:</span>
                        <span className="text-lg font-bold text-accent">
                          ${((parseFloat(formData.seniorSecuredDebt) || 0) + (parseFloat(formData.secondLienDebt) || 0)).toFixed(1)}M
                        </span>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Revenue Growth (%)</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Year 1</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="3.0" 
                            value={formData.revenueGrowthY1}
                            onChange={(e) => handleInputChange("revenueGrowthY1", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Year 2</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="2.8" 
                            value={formData.revenueGrowthY2}
                            onChange={(e) => handleInputChange("revenueGrowthY2", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Year 3</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="2.5" 
                            value={formData.revenueGrowthY3}
                            onChange={(e) => handleInputChange("revenueGrowthY3", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">EBITDA Margin (%)</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Year 1</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="20.1" 
                            value={formData.ebitdaMarginY1}
                            onChange={(e) => handleInputChange("ebitdaMarginY1", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Year 2</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="20.3" 
                            value={formData.ebitdaMarginY2}
                            onChange={(e) => handleInputChange("ebitdaMarginY2", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                        <div>
                          <Label>Year 3</Label>
                          <Input 
                            type="number" 
                            step="0.1"
                            placeholder="20.5" 
                            value={formData.ebitdaMarginY3}
                            onChange={(e) => handleInputChange("ebitdaMarginY3", e.target.value)}
                            className="text-right" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>CapEx as % of Revenue</Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="4.1" 
                        value={formData.capexPercent}
                        onChange={(e) => handleInputChange("capexPercent", e.target.value)}
                        className="text-right" 
                      />
                    </div>
                    <div>
                      <Label>Working Capital Days</Label>
                      <Input 
                        type="number" 
                        placeholder="75" 
                        value={formData.workingCapitalDays}
                        onChange={(e) => handleInputChange("workingCapitalDays", e.target.value)}
                        className="text-right" 
                      />
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