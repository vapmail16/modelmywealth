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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    shortTermDebt: "",
    otherLongTermDebt: "",
    capitalExpenditureAdditions: "",
    assetDepreciatedOverYears: "",
    additionalCapexPlannedNextYear: "",
    assetDepreciatedOverYearsNew: "",
    
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
    businessCase: "",
    employeeCount: "",
    founded: "",
    projectionsYear: "",
    notes: "",
    
    // Currency Information
    reportingCurrency: "",
    
    // Additional Company Information
    country: "",
    
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

  const calculateNetIncomeBeforeTax = () => {
    const ebitda = calculateEBITDA();
    const depreciation = parseFloat(formData.depreciation) || 0;
    const interest = parseFloat(formData.interestExpense) || 0;
    return ebitda - depreciation - interest;
  };

  const calculateNetIncome = () => {
    const netIncomeBeforeTax = calculateNetIncomeBeforeTax();
    const taxes = parseFloat(formData.taxes) || 0;
    return netIncomeBeforeTax - taxes;
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
                  {/* Guidance Section */}
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Guidance
                    </h3>
                    <div className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
                      <div>
                        <p className="font-medium mb-2">Data Required from Latest Financial Statements:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Revenue</li>
                          <li>COGS or COS (Cost of Goods/Services)</li>
                          <li>Operating Expenses</li>
                          <li>Interest Expense</li>
                          <li>Interest Tax Expense</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Definitions:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><strong>COGS/COS:</strong> Direct expenses related to production or service delivery</li>
                          <li><strong>Operating Expenses:</strong> All indirect expenses not directly tied to production</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Scenarios:</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><strong>Debt Restructuring or Refinancing:</strong> Use actual data from latest financial statements</li>
                          <li><strong>New Project Financing:</strong> Start by entering "1" for Revenue, COGS, and Operating Expense</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Particulars</TableHead>
                          <TableHead className="text-right font-semibold">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Revenue - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Revenue *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.revenue}
                              onChange={(e) => handleInputChange("revenue", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                        {/* Cost of Goods Sold - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Cost of Goods Sold or Services *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.cogs}
                              onChange={(e) => handleInputChange("cogs", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                         {/* Gross Profit - Calculated */}
                         <TableRow>
                           <TableCell className="font-medium">Gross Profit</TableCell>
                           <TableCell className="text-right">
                             <div className="w-32 ml-auto text-right font-semibold pr-3">
                               {calculateGrossProfit().toLocaleString()}
                             </div>
                           </TableCell>
                         </TableRow>
                        
                        {/* Operating Expenses - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Operating Expenses *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.operatingExpenses}
                              onChange={(e) => handleInputChange("operatingExpenses", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                         {/* EBITDA - Calculated */}
                         <TableRow>
                           <TableCell className="font-medium">EBITDA</TableCell>
                           <TableCell className="text-right">
                             <div className="w-32 ml-auto text-right font-semibold pr-3">
                               {calculateEBITDA().toLocaleString()}
                             </div>
                           </TableCell>
                         </TableRow>
                        
                        {/* Depreciation & Amortization - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Depreciation & Amortization *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.depreciation}
                              onChange={(e) => handleInputChange("depreciation", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                        {/* Interest Expense - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Interest Expense *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.interestExpense}
                              onChange={(e) => handleInputChange("interestExpense", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                         {/* Net Income Before Tax - Calculated */}
                         <TableRow>
                           <TableCell className="font-medium">Net Income Before Tax</TableCell>
                           <TableCell className="text-right">
                             <div className="w-32 ml-auto text-right font-semibold pr-3">
                               {calculateNetIncomeBeforeTax().toLocaleString()}
                             </div>
                           </TableCell>
                         </TableRow>
                        
                        {/* Income Tax Expense - Input */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Income Tax Expense *
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="1"
                              placeholder="0"
                              value={formData.taxes}
                              onChange={(e) => handleInputChange("taxes", e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                         {/* Net Income - Calculated */}
                         <TableRow className="border-t-2">
                           <TableCell className="font-semibold">Net Income</TableCell>
                           <TableCell className="text-right">
                             <div className="w-32 ml-auto text-right font-bold text-primary pr-3">
                               {calculateNetIncome().toLocaleString()}
                             </div>
                           </TableCell>
                         </TableRow>
                      </TableBody>
                     </Table>
                   </div>
                   <div className="text-xs text-muted-foreground mt-4">
                     * Input needed
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
                    Tax Rates (%)
                  </CardTitle>
                  <CardDescription>
                    Enter the applicable tax rates for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guidance Note */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Guidance
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Input the tax rate as applicable over the Projection Period
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Corporate Tax Rate</Label>
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
                            type="number" 
                            step="0.1"
                            placeholder="12.00" 
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
                    Enter your balance sheet data in millions ($M)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guidance Note */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Guidance
                    </h3>
                    <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                      <p><strong>For Debt Refinancing and/or Debt Restructuring:</strong> Input the Balance Sheet figures and ensure the total of Assets must match total of Liabilities and Equity.</p>
                      <p><strong>For New Project Financing:</strong> Only input the amount of Equity and the Cash Balance.</p>
                      <p className="text-xs">Note: Additional Debt can be inputted in the Debt Schedule section.</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Assets Column */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Assets</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Item</TableHead>
                              <TableHead className="text-right font-semibold">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Cash</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.cash}
                                  onChange={(e) => handleInputChange("cash", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Accounts Receivable</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.accountsReceivable}
                                  onChange={(e) => handleInputChange("accountsReceivable", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Inventory</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.inventory}
                                  onChange={(e) => handleInputChange("inventory", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Other Current Assets</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.otherCurrentAssets}
                                  onChange={(e) => handleInputChange("otherCurrentAssets", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Property, Plant & Equipment (Net)</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.ppe}
                                  onChange={(e) => handleInputChange("ppe", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Other Assets/DTA</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.otherAssets}
                                  onChange={(e) => handleInputChange("otherAssets", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                              <TableCell className="font-semibold">Total Assets</TableCell>
                              <TableCell className="text-right">
                                <div className="w-32 ml-auto text-right font-bold text-primary pr-3">
                                  {(
                                    (parseFloat(formData.cash) || 0) +
                                    (parseFloat(formData.accountsReceivable) || 0) +
                                    (parseFloat(formData.inventory) || 0) +
                                    (parseFloat(formData.otherCurrentAssets) || 0) +
                                    (parseFloat(formData.ppe) || 0) +
                                    (parseFloat(formData.otherAssets) || 0)
                                  ).toLocaleString()}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>

                      {/* Liabilities and Equity Column */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-foreground">Liabilities and Equity</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="font-semibold">Item</TableHead>
                              <TableHead className="text-right font-semibold">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Short Term Debt</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.shortTermDebt || ""}
                                  onChange={(e) => handleInputChange("shortTermDebt", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Accounts payable/Provisions</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.accountsPayableProvisions}
                                  onChange={(e) => handleInputChange("accountsPayableProvisions", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Debt 1</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.debtTranche1}
                                  onChange={(e) => handleInputChange("debtTranche1", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Other Long Term Debt 2</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.otherLongTermDebt || ""}
                                  onChange={(e) => handleInputChange("otherLongTermDebt", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Equity</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.equity}
                                  onChange={(e) => handleInputChange("equity", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Retained Earning</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="1"
                                  placeholder="0"
                                  value={formData.retainedEarnings}
                                  onChange={(e) => handleInputChange("retainedEarnings", e.target.value)}
                                  className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2">
                              <TableCell className="font-semibold">Total Liabilities and Equity</TableCell>
                              <TableCell className="text-right">
                                <div className="w-32 ml-auto text-right font-bold text-primary pr-3">
                                  {(
                                    (parseFloat(formData.shortTermDebt || "0") || 0) +
                                    (parseFloat(formData.accountsPayableProvisions) || 0) +
                                    (parseFloat(formData.debtTranche1) || 0) +
                                    (parseFloat(formData.otherLongTermDebt || "0") || 0) +
                                    (parseFloat(formData.equity) || 0) +
                                    (parseFloat(formData.retainedEarnings) || 0)
                                  ).toLocaleString()}
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Additional Balance Sheet Information */}
                    <Separator className="my-6" />
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">Additional Balance Sheet Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="additionalCapexPlannedNextYear">Additional Capex Planned for Next Year</Label>
                          <Input
                            id="additionalCapexPlannedNextYear"
                            type="number"
                            step="1"
                            placeholder="0"
                            value={formData.additionalCapexPlannedNextYear}
                            onChange={(e) => handleInputChange("additionalCapexPlannedNextYear", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assetDepreciatedOverYearsNew">Asset Depreciated over Years</Label>
                          <Select value={formData.assetDepreciatedOverYearsNew} onValueChange={(value) => handleInputChange("assetDepreciatedOverYearsNew", value)}>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select years" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border z-50">
                              <SelectItem value="1">1 Year</SelectItem>
                              <SelectItem value="2">2 Years</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="4">4 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="6">6 Years</SelectItem>
                              <SelectItem value="7">7 Years</SelectItem>
                              <SelectItem value="8">8 Years</SelectItem>
                              <SelectItem value="9">9 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                            </SelectContent>
                          </Select>
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
                  <h3 className="text-lg font-semibold text-foreground">Fill in the Required Fields</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Senior Secured Column */}
                    <div className="space-y-4">
                      <h4 className="text-base font-medium text-foreground">Debt 1</h4>
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
                        <Label>Additional Loan on restructuring</Label>
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
                        <Label>Bank Base Rate (in %)</Label>
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
                        <Label>Liquidity Premiums (in %)</Label>
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
                        <Label>Credit Risk Premiums (in %)</Label>
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
                        <Select value={formData.maturityYSeniorSecured} onValueChange={(value) => handleInputChange("maturityYSeniorSecured", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6 Years</SelectItem>
                            <SelectItem value="7">7 Years</SelectItem>
                            <SelectItem value="8">8 Years</SelectItem>
                            <SelectItem value="9">9 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Grace Period</Label>
                        <Select value={formData.amortizationYSeniorSecured} onValueChange={(value) => handleInputChange("amortizationYSeniorSecured", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6 Years</SelectItem>
                            <SelectItem value="7">7 Years</SelectItem>
                            <SelectItem value="8">8 Years</SelectItem>
                            <SelectItem value="9">9 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Short Term Column */}
                    <div className="space-y-4">
                      <h4 className="text-base font-medium text-foreground">Debt 2</h4>
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
                        <Label>Additional Loan on restructuring</Label>
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
                        <Label>Bank Base Rate (in %)</Label>
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
                        <Label>Liquidity Premiums (in %)</Label>
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
                        <Label>Credit Risk Premiums (in %)</Label>
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
                        <Select value={formData.maturityYShortTerm} onValueChange={(value) => handleInputChange("maturityYShortTerm", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6 Years</SelectItem>
                            <SelectItem value="7">7 Years</SelectItem>
                            <SelectItem value="8">8 Years</SelectItem>
                            <SelectItem value="9">9 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Grace Period</Label>
                        <Select value={formData.amortizationYShortTerm} onValueChange={(value) => handleInputChange("amortizationYShortTerm", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="4">4 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                            <SelectItem value="6">6 Years</SelectItem>
                            <SelectItem value="7">7 Years</SelectItem>
                            <SelectItem value="8">8 Years</SelectItem>
                            <SelectItem value="9">9 Years</SelectItem>
                            <SelectItem value="10">10 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guidance Section */}
                  <div className="mt-8 p-6 bg-muted/50 rounded-lg border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Terms Guidance for Loan Refinancing/Restructuring</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Base Rate</h4>
                          <p className="text-sm text-muted-foreground">
                            The benchmark interest rate set by the central bank or financial institution, serving as the foundation for calculating loan interest rates.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Liquidity Premiums</h4>
                          <p className="text-sm text-muted-foreground">
                            Additional interest charged to compensate lenders for the reduced liquidity of longer-term loans or loans that are harder to sell in secondary markets.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Credit Risk Premiums</h4>
                          <p className="text-sm text-muted-foreground">
                            Extra interest charged to compensate for the risk of borrower default, based on the borrower's creditworthiness and financial stability.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Maturity Period</h4>
                          <p className="text-sm text-muted-foreground">
                            The length of time until the loan must be fully repaid, affecting both risk assessment and interest rate calculations in restructuring scenarios.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Grace Period</h4>
                          <p className="text-sm text-muted-foreground">
                            A temporary period during which no principal repayment or interest payment needs to be made, providing borrowers relief during financial difficulties.
                          </p>
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
                   
                   <div className="overflow-x-auto">
                     <Table>
                       <TableHeader>
                         <TableRow>
                           <TableHead className="text-center font-semibold">Years</TableHead>
                           <TableHead className="text-center font-semibold">Revenue</TableHead>
                           <TableHead className="text-center font-semibold">COGS/COR</TableHead>
                           <TableHead className="text-center font-semibold">Opex</TableHead>
                           <TableHead className="text-center font-semibold">Capex</TableHead>
                         </TableRow>
                       </TableHeader>
                       <TableBody>
                         {Array.from({ length: 12 }, (_, i) => (
                           <TableRow key={`year-${i + 1}`}>
                             <TableCell className="text-center font-medium">
                               {i + 1}
                             </TableCell>
                             <TableCell className="text-center">
                               <Input 
                                 type="number" 
                                 step="0.1"
                                 placeholder="0.00" 
                                 value={formData[`grRevenue${i + 1}` as keyof typeof formData]}
                                 onChange={(e) => handleInputChange(`grRevenue${i + 1}`, e.target.value)}
                                 className="text-center w-full border-0 focus:ring-0 focus:border-0 shadow-none" 
                               />
                             </TableCell>
                             <TableCell className="text-center">
                               <Input 
                                 type="number" 
                                 step="0.1"
                                 placeholder="0.00" 
                                 value={formData[`grCost${i + 1}` as keyof typeof formData]}
                                 onChange={(e) => handleInputChange(`grCost${i + 1}`, e.target.value)}
                                 className="text-center w-full border-0 focus:ring-0 focus:border-0 shadow-none" 
                               />
                             </TableCell>
                             <TableCell className="text-center">
                               <Input 
                                 type="number" 
                                 step="0.1"
                                 placeholder="0.00" 
                                 value={formData[`grCostOper${i + 1}` as keyof typeof formData]}
                                 onChange={(e) => handleInputChange(`grCostOper${i + 1}`, e.target.value)}
                                 className="text-center w-full border-0 focus:ring-0 focus:border-0 shadow-none" 
                               />
                             </TableCell>
                             <TableCell className="text-center">
                               <Input 
                                 type="number" 
                                 step="0.1"
                                 placeholder="0.00" 
                                 value={formData[`grCapex${i + 1}` as keyof typeof formData]}
                                 onChange={(e) => handleInputChange(`grCapex${i + 1}`, e.target.value)}
                                 className="text-center w-full border-0 focus:ring-0 focus:border-0 shadow-none" 
                               />
                             </TableCell>
                           </TableRow>
                         ))}
                       </TableBody>
                     </Table>
                   </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Company Information */}
            <TabsContent value="company-info">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
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
                            <SelectValue placeholder="Select an industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="energy">Energy</SelectItem>
                            <SelectItem value="real-estate">Real Estate</SelectItem>
                            <SelectItem value="agriculture">Agriculture</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="hospitality">Hospitality</SelectItem>
                            <SelectItem value="construction">Construction</SelectItem>
                            <SelectItem value="media">Media & Entertainment</SelectItem>
                            <SelectItem value="telecommunications">Telecommunications</SelectItem>
                            <SelectItem value="automotive">Automotive</SelectItem>
                            <SelectItem value="aerospace">Aerospace & Defense</SelectItem>
                            <SelectItem value="chemicals">Chemicals</SelectItem>
                            <SelectItem value="food-beverage">Food & Beverage</SelectItem>
                            <SelectItem value="mining">Mining</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                            <SelectItem value="textiles">Textiles</SelectItem>
                            <SelectItem value="logistics">Logistics</SelectItem>
                            <SelectItem value="consulting">Consulting</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Region</Label>
                        <Select value={formData.region} onValueChange={(value) => handleInputChange("region", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="north-america">North America</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="asia-pacific">Asia Pacific</SelectItem>
                            <SelectItem value="latin-america">Latin America</SelectItem>
                            <SelectItem value="middle-east-africa">Middle East & Africa</SelectItem>
                            <SelectItem value="global">Global</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="afghanistan">Afghanistan</SelectItem>
                            <SelectItem value="albania">Albania</SelectItem>
                            <SelectItem value="algeria">Algeria</SelectItem>
                            <SelectItem value="argentina">Argentina</SelectItem>
                            <SelectItem value="armenia">Armenia</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="austria">Austria</SelectItem>
                            <SelectItem value="azerbaijan">Azerbaijan</SelectItem>
                            <SelectItem value="bahrain">Bahrain</SelectItem>
                            <SelectItem value="bangladesh">Bangladesh</SelectItem>
                            <SelectItem value="belarus">Belarus</SelectItem>
                            <SelectItem value="belgium">Belgium</SelectItem>
                            <SelectItem value="bolivia">Bolivia</SelectItem>
                            <SelectItem value="brazil">Brazil</SelectItem>
                            <SelectItem value="bulgaria">Bulgaria</SelectItem>
                            <SelectItem value="cambodia">Cambodia</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="chile">Chile</SelectItem>
                            <SelectItem value="china">China</SelectItem>
                            <SelectItem value="colombia">Colombia</SelectItem>
                            <SelectItem value="croatia">Croatia</SelectItem>
                            <SelectItem value="czech-republic">Czech Republic</SelectItem>
                            <SelectItem value="denmark">Denmark</SelectItem>
                            <SelectItem value="ecuador">Ecuador</SelectItem>
                            <SelectItem value="egypt">Egypt</SelectItem>
                            <SelectItem value="estonia">Estonia</SelectItem>
                            <SelectItem value="finland">Finland</SelectItem>
                            <SelectItem value="france">France</SelectItem>
                            <SelectItem value="georgia">Georgia</SelectItem>
                            <SelectItem value="germany">Germany</SelectItem>
                            <SelectItem value="ghana">Ghana</SelectItem>
                            <SelectItem value="greece">Greece</SelectItem>
                            <SelectItem value="hong-kong">Hong Kong</SelectItem>
                            <SelectItem value="hungary">Hungary</SelectItem>
                            <SelectItem value="iceland">Iceland</SelectItem>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="indonesia">Indonesia</SelectItem>
                            <SelectItem value="iran">Iran</SelectItem>
                            <SelectItem value="iraq">Iraq</SelectItem>
                            <SelectItem value="ireland">Ireland</SelectItem>
                            <SelectItem value="israel">Israel</SelectItem>
                            <SelectItem value="italy">Italy</SelectItem>
                            <SelectItem value="japan">Japan</SelectItem>
                            <SelectItem value="jordan">Jordan</SelectItem>
                            <SelectItem value="kazakhstan">Kazakhstan</SelectItem>
                            <SelectItem value="kenya">Kenya</SelectItem>
                            <SelectItem value="kuwait">Kuwait</SelectItem>
                            <SelectItem value="latvia">Latvia</SelectItem>
                            <SelectItem value="lebanon">Lebanon</SelectItem>
                            <SelectItem value="lithuania">Lithuania</SelectItem>
                            <SelectItem value="luxembourg">Luxembourg</SelectItem>
                            <SelectItem value="malaysia">Malaysia</SelectItem>
                            <SelectItem value="mexico">Mexico</SelectItem>
                            <SelectItem value="morocco">Morocco</SelectItem>
                            <SelectItem value="netherlands">Netherlands</SelectItem>
                            <SelectItem value="new-zealand">New Zealand</SelectItem>
                            <SelectItem value="nigeria">Nigeria</SelectItem>
                            <SelectItem value="norway">Norway</SelectItem>
                            <SelectItem value="oman">Oman</SelectItem>
                            <SelectItem value="pakistan">Pakistan</SelectItem>
                            <SelectItem value="peru">Peru</SelectItem>
                            <SelectItem value="philippines">Philippines</SelectItem>
                            <SelectItem value="poland">Poland</SelectItem>
                            <SelectItem value="portugal">Portugal</SelectItem>
                            <SelectItem value="qatar">Qatar</SelectItem>
                            <SelectItem value="romania">Romania</SelectItem>
                            <SelectItem value="russia">Russia</SelectItem>
                            <SelectItem value="saudi-arabia">Saudi Arabia</SelectItem>
                            <SelectItem value="serbia">Serbia</SelectItem>
                            <SelectItem value="singapore">Singapore</SelectItem>
                            <SelectItem value="slovakia">Slovakia</SelectItem>
                            <SelectItem value="slovenia">Slovenia</SelectItem>
                            <SelectItem value="south-africa">South Africa</SelectItem>
                            <SelectItem value="south-korea">South Korea</SelectItem>
                            <SelectItem value="spain">Spain</SelectItem>
                            <SelectItem value="sri-lanka">Sri Lanka</SelectItem>
                            <SelectItem value="sweden">Sweden</SelectItem>
                            <SelectItem value="switzerland">Switzerland</SelectItem>
                            <SelectItem value="taiwan">Taiwan</SelectItem>
                            <SelectItem value="thailand">Thailand</SelectItem>
                            <SelectItem value="turkey">Turkey</SelectItem>
                            <SelectItem value="ukraine">Ukraine</SelectItem>
                            <SelectItem value="uae">United Arab Emirates</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="uruguay">Uruguay</SelectItem>
                            <SelectItem value="venezuela">Venezuela</SelectItem>
                            <SelectItem value="vietnam">Vietnam</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Reporting Currency</Label>
                        <Select value={formData.reportingCurrency} onValueChange={(value) => handleInputChange("reportingCurrency", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reporting currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                            <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                            <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                            <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                            <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                            <SelectItem value="DKK">DKK - Danish Krone</SelectItem>
                            <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                            <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                            <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                            <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                            <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                            <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Employee Count</Label>
                        <Select value={formData.employeeCount} onValueChange={(value) => handleInputChange("employeeCount", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee count range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-500">201-500 employees</SelectItem>
                            <SelectItem value="501-1000">501-1,000 employees</SelectItem>
                            <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
                            <SelectItem value="5001+">5,001+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Founded Year</Label>
                        <Input 
                          type="number" 
                          placeholder="e.g., 2015" 
                          value={formData.founded}
                          onChange={(e) => handleInputChange("founded", e.target.value)}
                        />
                      </div>
                        <div>
                          <Label>Projections Year</Label>
                          <Select value={formData.projectionsYear} onValueChange={(value) => handleInputChange("projectionsYear", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select projection years" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 Year</SelectItem>
                              <SelectItem value="2">2 Years</SelectItem>
                              <SelectItem value="3">3 Years</SelectItem>
                              <SelectItem value="4">4 Years</SelectItem>
                              <SelectItem value="5">5 Years</SelectItem>
                              <SelectItem value="6">6 Years</SelectItem>
                              <SelectItem value="7">7 Years</SelectItem>
                              <SelectItem value="8">8 Years</SelectItem>
                              <SelectItem value="9">9 Years</SelectItem>
                              <SelectItem value="10">10 Years</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>Business Case / Investment Thesis</Label>
                        <Select value={formData.businessCase} onValueChange={(value) => handleInputChange("businessCase", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business case type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new-project-financing">New Project Financing</SelectItem>
                            <SelectItem value="existing-debt-refinancing">Existing Debt Refinancing</SelectItem>
                            <SelectItem value="debt-business-restructuring">Debt and Business Restructuring</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea 
                          placeholder="Any additional notes or comments..."
                          className="min-h-32"
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Working Capital Section */}
            <TabsContent value="working-capital">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Working Capital Assumptions
                  </CardTitle>
                  <CardDescription>
                    Enter working capital percentages for forward-looking projections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Working Capital Item</TableHead>
                          <TableHead className="font-semibold">Calculation Base</TableHead>
                          <TableHead className="text-right font-semibold">Percentage (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Account Receivable */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Account Receivable
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            AR as a % of 12 Months Forward Revenue
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0"
                              value={formData.accountReceivablePercent}
                              onChange={(e) => handleInputChange("accountReceivablePercent", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                        {/* Inventory */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Inventory
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Inventory % of 12 Months Forward COGS
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0"
                              value={formData.inventoryPercent}
                              onChange={(e) => handleInputChange("inventoryPercent", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                        {/* Other Current Assets */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Other Current Assets
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            Other CA % of 12 Months Forward Revenue
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0"
                              value={formData.otherCurrentAssetsPercent}
                              onChange={(e) => handleInputChange("otherCurrentAssetsPercent", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        
                        {/* Accounts Payable */}
                        <TableRow>
                          <TableCell className="font-medium">
                            Accounts Payable
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            AP as a % of 12 Months Forward COGS/OPEX
                          </TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0"
                              value={formData.accountsPayablePercent}
                              onChange={(e) => handleInputChange("accountsPayablePercent", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seasonality Section */}
            <TabsContent value="seasonality">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Seasonality Analysis
                  </CardTitle>
                  <CardDescription>
                    Enter monthly revenue distribution percentages (should total 100%)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-semibold">Month</TableHead>
                          <TableHead className="text-right font-semibold">Percentage (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">January</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.january}
                              onChange={(e) => handleInputChange("january", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">February</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.february}
                              onChange={(e) => handleInputChange("february", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">March</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.march}
                              onChange={(e) => handleInputChange("march", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">April</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.april}
                              onChange={(e) => handleInputChange("april", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">May</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.may}
                              onChange={(e) => handleInputChange("may", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">June</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.june}
                              onChange={(e) => handleInputChange("june", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">July</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.july}
                              onChange={(e) => handleInputChange("july", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">August</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.august}
                              onChange={(e) => handleInputChange("august", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">September</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.september}
                              onChange={(e) => handleInputChange("september", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">October</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.october}
                              onChange={(e) => handleInputChange("october", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">November</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.november}
                              onChange={(e) => handleInputChange("november", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">December</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={formData.december}
                              onChange={(e) => handleInputChange("december", e.target.value)}
                              className="text-right w-24 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-semibold">Total</TableCell>
                          <TableCell className="text-right">
                            <div className={`w-24 ml-auto text-right font-bold pr-3 ${
                              Math.abs((
                                (parseFloat(formData.january) || 0) +
                                (parseFloat(formData.february) || 0) +
                                (parseFloat(formData.march) || 0) +
                                (parseFloat(formData.april) || 0) +
                                (parseFloat(formData.may) || 0) +
                                (parseFloat(formData.june) || 0) +
                                (parseFloat(formData.july) || 0) +
                                (parseFloat(formData.august) || 0) +
                                (parseFloat(formData.september) || 0) +
                                (parseFloat(formData.october) || 0) +
                                (parseFloat(formData.november) || 0) +
                                (parseFloat(formData.december) || 0)
                              ) - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(
                                (parseFloat(formData.january) || 0) +
                                (parseFloat(formData.february) || 0) +
                                (parseFloat(formData.march) || 0) +
                                (parseFloat(formData.april) || 0) +
                                (parseFloat(formData.may) || 0) +
                                (parseFloat(formData.june) || 0) +
                                (parseFloat(formData.july) || 0) +
                                (parseFloat(formData.august) || 0) +
                                (parseFloat(formData.september) || 0) +
                                (parseFloat(formData.october) || 0) +
                                (parseFloat(formData.november) || 0) +
                                (parseFloat(formData.december) || 0)
                              ).toFixed(1)}%
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
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
            <Button>
              Next
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Completion Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Fields Completed</span>
                <span className="font-medium">{completedFields}/{totalFields}</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {completionPercentage}% of all required data fields completed
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Save className="h-4 w-4" />
                Save Progress
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Download className="h-4 w-4" />
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Upload className="h-4 w-4" />
                Import Template
              </Button>
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Having trouble with data entry? Contact our support team for assistance.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
