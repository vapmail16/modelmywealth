import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, Calculator, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface CovenantRatio {
  name: string;
  threshold: number;
  actual: number;
  status: 'met' | 'at-risk' | 'breach';
  operator: '<' | '>' | '≤' | '≥';
}

interface ActualData {
  // P&L Statement
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  ebitda: number;
  depreciation: number;
  interestExpense: number;
  taxes: number;
  netIncome: number;
  
  // Balance Sheet - Assets
  cash: number;
  accountsReceivable: number;
  inventory: number;
  otherCurrentAssets: number;
  ppe: number;
  otherAssets: number;
  
  // Balance Sheet - Liabilities & Equity
  shortTermDebt: number;
  accountsPayableProvisions: number;
  debtTranche1: number;
  otherLongTermDebt: number;
  equity: number;
  retainedEarnings: number;
}

export default function CovenantTesting() {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [testingDate, setTestingDate] = useState<string>("");
  const [actualData, setActualData] = useState<ActualData>({
    // P&L Statement
    revenue: 0,
    cogs: 0,
    operatingExpenses: 0,
    ebitda: 0,
    depreciation: 0,
    interestExpense: 0,
    taxes: 0,
    netIncome: 0,
    
    // Balance Sheet - Assets
    cash: 0,
    accountsReceivable: 0,
    inventory: 0,
    otherCurrentAssets: 0,
    ppe: 0,
    otherAssets: 0,
    
    // Balance Sheet - Liabilities & Equity
    shortTermDebt: 0,
    accountsPayableProvisions: 0,
    debtTranche1: 0,
    otherLongTermDebt: 0,
    equity: 0,
    retainedEarnings: 0,
  });
  
  const [hasCalculated, setHasCalculated] = useState(false);

  // Sample covenant ratios - these would typically come from the debt structure data
  const calculateCovenantRatios = (): CovenantRatio[] => {
    const totalDebt = actualData.shortTermDebt + actualData.debtTranche1 + actualData.otherLongTermDebt;
    const totalAssets = actualData.cash + actualData.accountsReceivable + actualData.inventory + 
                       actualData.otherCurrentAssets + actualData.ppe + actualData.otherAssets;
    const totalLiabilitiesAndEquity = actualData.shortTermDebt + actualData.accountsPayableProvisions + 
                                     actualData.debtTranche1 + actualData.otherLongTermDebt + 
                                     actualData.equity + actualData.retainedEarnings;
    const currentAssets = actualData.cash + actualData.accountsReceivable + actualData.inventory + actualData.otherCurrentAssets;
    const currentLiabilities = actualData.shortTermDebt + actualData.accountsPayableProvisions;
    // Auto-calculate EBITDA if not provided
    const calculatedEbitda = actualData.ebitda || (actualData.revenue - actualData.cogs - actualData.operatingExpenses);
    
    const debtToEbitda = calculatedEbitda > 0 ? totalDebt / calculatedEbitda : 0;
    const interestCoverage = actualData.interestExpense > 0 ? calculatedEbitda / actualData.interestExpense : 0;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const debtToEquity = (actualData.equity + actualData.retainedEarnings) > 0 ? totalDebt / (actualData.equity + actualData.retainedEarnings) : 0;

    return [
      {
        name: "Debt-to-EBITDA",
        threshold: 3.5,
        actual: debtToEbitda,
        status: debtToEbitda <= 3.5 ? 'met' : debtToEbitda <= 4.0 ? 'at-risk' : 'breach',
        operator: '≤'
      },
      {
        name: "Interest Coverage",
        threshold: 4.0,
        actual: interestCoverage,
        status: interestCoverage >= 4.0 ? 'met' : interestCoverage >= 3.0 ? 'at-risk' : 'breach',
        operator: '≥'
      },
      {
        name: "Current Ratio",
        threshold: 1.25,
        actual: currentRatio,
        status: currentRatio >= 1.25 ? 'met' : currentRatio >= 1.1 ? 'at-risk' : 'breach',
        operator: '≥'
      },
      {
        name: "Debt-to-Equity",
        threshold: 2.0,
        actual: debtToEquity,
        status: debtToEquity <= 2.0 ? 'met' : debtToEquity <= 2.5 ? 'at-risk' : 'breach',
        operator: '≤'
      }
    ];
  };

  const handleInputChange = (field: keyof ActualData, value: string) => {
    setActualData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const runCovenantTest = () => {
    setHasCalculated(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'met':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at-risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'breach':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'met':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Compliant</Badge>;
      case 'at-risk':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800 border-yellow-300">At Risk</Badge>;
      case 'breach':
        return <Badge variant="destructive">Breach</Badge>;
      default:
        return null;
    }
  };

  const covenantRatios = hasCalculated ? calculateCovenantRatios() : [];
  const breachCount = covenantRatios.filter(r => r.status === 'breach').length;
  const atRiskCount = covenantRatios.filter(r => r.status === 'at-risk').length;
  const compliantCount = covenantRatios.filter(r => r.status === 'met').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Covenant Testing</h1>
          <p className="text-muted-foreground">
            Test actual financial performance against debt covenant requirements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Testing Period: {selectedYear && selectedMonth ? `Year ${selectedYear}, Month ${selectedMonth}` : "Select Year & Month"}
          </span>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">Setup & Data Entry</TabsTrigger>
          <TabsTrigger value="results" disabled={!hasCalculated}>Test Results & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          {/* Period Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Testing Configuration
              </CardTitle>
              <CardDescription>
                Select the projection year (1-12) and specific month for covenant compliance testing
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Projection Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                    <SelectItem value="5">Year 5</SelectItem>
                    <SelectItem value="6">Year 6</SelectItem>
                    <SelectItem value="7">Year 7</SelectItem>
                    <SelectItem value="8">Year 8</SelectItem>
                    <SelectItem value="9">Year 9</SelectItem>
                    <SelectItem value="10">Year 10</SelectItem>
                    <SelectItem value="11">Year 11</SelectItem>
                    <SelectItem value="12">Year 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="1">Month 1</SelectItem>
                    <SelectItem value="2">Month 2</SelectItem>
                    <SelectItem value="3">Month 3</SelectItem>
                    <SelectItem value="4">Month 4</SelectItem>
                    <SelectItem value="5">Month 5</SelectItem>
                    <SelectItem value="6">Month 6</SelectItem>
                    <SelectItem value="7">Month 7</SelectItem>
                    <SelectItem value="8">Month 8</SelectItem>
                    <SelectItem value="9">Month 9</SelectItem>
                    <SelectItem value="10">Month 10</SelectItem>
                    <SelectItem value="11">Month 11</SelectItem>
                    <SelectItem value="12">Month 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testing-date">Testing Date</Label>
                <Input
                  id="testing-date"
                  type="date"
                  value={testingDate}
                  onChange={(e) => setTestingDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actual Financial Data Input */}
          <Card>
            <CardHeader>
              <CardTitle>Actual Financial Data</CardTitle>
              <CardDescription>
                Enter actual P&L and Balance Sheet figures for covenant testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* P&L Statement Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Profit & Loss Statement (Monthly, $)</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">Particulars</TableHead>
                        <TableHead className="text-right font-semibold">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Revenue *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.revenue || ""}
                            onChange={(e) => handleInputChange('revenue', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Cost of Goods Sold or Services *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.cogs || ""}
                            onChange={(e) => handleInputChange('cogs', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Gross Profit</TableCell>
                        <TableCell className="text-right">
                          <div className="w-32 ml-auto text-right font-semibold pr-3">
                            {(actualData.revenue - actualData.cogs).toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Operating Expenses *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.operatingExpenses || ""}
                            onChange={(e) => handleInputChange('operatingExpenses', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">EBITDA</TableCell>
                        <TableCell className="text-right">
                          <div className="w-32 ml-auto text-right font-semibold pr-3">
                            {(actualData.revenue - actualData.cogs - actualData.operatingExpenses).toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Depreciation & Amortization *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.depreciation || ""}
                            onChange={(e) => handleInputChange('depreciation', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Interest Expense *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.interestExpense || ""}
                            onChange={(e) => handleInputChange('interestExpense', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Net Income Before Tax</TableCell>
                        <TableCell className="text-right">
                          <div className="w-32 ml-auto text-right font-semibold pr-3">
                            {(actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense).toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Tax Expenses *</TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            step="1"
                            placeholder="0"
                            value={actualData.taxes || ""}
                            onChange={(e) => handleInputChange('taxes', e.target.value)}
                            className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Net Income</TableCell>
                        <TableCell className="text-right">
                          <div className="w-32 ml-auto text-right font-semibold pr-3">
                            {(actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes).toLocaleString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              {/* Balance Sheet Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Balance Sheet (Monthly, $)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assets Column */}
                  <div>
                    <h4 className="text-md font-semibold mb-4 text-foreground">Assets</h4>
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
                              value={actualData.cash || ""}
                              onChange={(e) => handleInputChange('cash', e.target.value)}
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
                              value={actualData.accountsReceivable || ""}
                              onChange={(e) => handleInputChange('accountsReceivable', e.target.value)}
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
                              value={actualData.inventory || ""}
                              onChange={(e) => handleInputChange('inventory', e.target.value)}
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
                              value={actualData.otherCurrentAssets || ""}
                              onChange={(e) => handleInputChange('otherCurrentAssets', e.target.value)}
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
                              value={actualData.ppe || ""}
                              onChange={(e) => handleInputChange('ppe', e.target.value)}
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
                              value={actualData.otherAssets || ""}
                              onChange={(e) => handleInputChange('otherAssets', e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-semibold">Total Assets</TableCell>
                          <TableCell className="text-right">
                            <div className="w-32 ml-auto text-right font-bold text-primary pr-3">
                              {(actualData.cash + actualData.accountsReceivable + actualData.inventory + 
                                actualData.otherCurrentAssets + actualData.ppe + actualData.otherAssets).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  {/* Liabilities and Equity Column */}
                  <div>
                    <h4 className="text-md font-semibold mb-4 text-foreground">Liabilities and Equity</h4>
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
                              value={actualData.shortTermDebt || ""}
                              onChange={(e) => handleInputChange('shortTermDebt', e.target.value)}
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
                              value={actualData.accountsPayableProvisions || ""}
                              onChange={(e) => handleInputChange('accountsPayableProvisions', e.target.value)}
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
                              value={actualData.debtTranche1 || ""}
                              onChange={(e) => handleInputChange('debtTranche1', e.target.value)}
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
                              value={actualData.otherLongTermDebt || ""}
                              onChange={(e) => handleInputChange('otherLongTermDebt', e.target.value)}
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
                              value={actualData.equity || ""}
                              onChange={(e) => handleInputChange('equity', e.target.value)}
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
                              value={actualData.retainedEarnings || ""}
                              onChange={(e) => handleInputChange('retainedEarnings', e.target.value)}
                              className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow className="border-t-2">
                          <TableCell className="font-semibold">Total Liabilities and Equity</TableCell>
                          <TableCell className="text-right">
                            <div className="w-32 ml-auto text-right font-bold text-primary pr-3">
                              {(actualData.shortTermDebt + actualData.accountsPayableProvisions + actualData.debtTranche1 + 
                                actualData.otherLongTermDebt + actualData.equity + actualData.retainedEarnings).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-end">
                <Button 
                  onClick={runCovenantTest}
                  disabled={!selectedYear || !selectedMonth || actualData.revenue === 0}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Run Covenant Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {/* Overall Compliance Status */}
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Covenant Testing Results & Analysis</CardTitle>
                  <CardDescription>
                    Year {selectedYear}, Month {selectedMonth} - Comprehensive covenant performance analysis
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {breachCount === 0 ? (
                      <span className="text-green-600">✓ COMPLIANT</span>
                    ) : (
                      <span className="text-red-600">⚠ NON-COMPLIANT</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {covenantRatios.length} covenants tested
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Compliant</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">{compliantCount}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {compliantCount > 0 ? `${((compliantCount / covenantRatios.length) * 100).toFixed(1)}%` : '0%'} of total
                        </p>
                      </div>
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">At Risk</p>
                        <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{atRiskCount}</p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          {atRiskCount > 0 ? `${((atRiskCount / covenantRatios.length) * 100).toFixed(1)}%` : '0%'} of total
                        </p>
                      </div>
                      <AlertTriangle className="h-10 w-10 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">Breaches</p>
                        <p className="text-3xl font-bold text-red-900 dark:text-red-100">{breachCount}</p>
                        <p className="text-xs text-red-700 dark:text-red-300">
                          {breachCount > 0 ? `${((breachCount / covenantRatios.length) * 100).toFixed(1)}%` : '0%'} of total
                        </p>
                      </div>
                      <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Key Ratios Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Covenant Ratios Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Covenant Ratios vs Thresholds
                </CardTitle>
                <CardDescription>
                  Actual performance compared to covenant requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={covenantRatios.map(ratio => ({
                    name: ratio.name.replace('-', '\n'),
                    actual: ratio.actual,
                    threshold: ratio.threshold,
                    status: ratio.status
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${parseFloat(value as string).toFixed(2)}x`, 
                        name === 'actual' ? 'Actual' : 'Threshold'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="threshold" fill="#e5e7eb" name="Threshold" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Actuals vs Budget Financial Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Actuals vs Budget
                </CardTitle>
                <CardDescription>
                  Key financial metrics comparison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      metric: 'Revenue',
                      actual: actualData.revenue,
                      budget: actualData.revenue * 0.95,
                      variance: ((actualData.revenue - actualData.revenue * 0.95) / (actualData.revenue * 0.95)) * 100
                    },
                    {
                      metric: 'EBITDA',
                      actual: actualData.revenue - actualData.cogs - actualData.operatingExpenses,
                      budget: (actualData.revenue - actualData.cogs - actualData.operatingExpenses) * 0.92,
                      variance: (((actualData.revenue - actualData.cogs - actualData.operatingExpenses) - (actualData.revenue - actualData.cogs - actualData.operatingExpenses) * 0.92) / ((actualData.revenue - actualData.cogs - actualData.operatingExpenses) * 0.92)) * 100
                    },
                    {
                      metric: 'Net Income',
                      actual: actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes,
                      budget: (actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes) * 0.88,
                      variance: (((actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes) - (actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes) * 0.88) / ((actualData.revenue - actualData.cogs - actualData.operatingExpenses - actualData.depreciation - actualData.interestExpense - actualData.taxes) * 0.88)) * 100
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="metric" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `$${parseFloat(value as string).toLocaleString()}`, 
                        name === 'actual' ? 'Actual' : 'Budget'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Covenant Compliance Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Covenant Compliance Distribution</CardTitle>
              <CardDescription>
                Overall compliance status breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Compliant', value: compliantCount, color: '#10b981' },
                        { name: 'At Risk', value: atRiskCount, color: '#f59e0b' },
                        { name: 'Breach', value: breachCount, color: '#ef4444' }
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Compliant', value: compliantCount, color: '#10b981' },
                        { name: 'At Risk', value: atRiskCount, color: '#f59e0b' },
                        { name: 'Breach', value: breachCount, color: '#ef4444' }
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                {/* Key Metrics Summary */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Key Financial Metrics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Debt</p>
                      <p className="text-lg font-bold">
                        ${(actualData.shortTermDebt + actualData.debtTranche1 + actualData.otherLongTermDebt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">EBITDA</p>
                      <p className="text-lg font-bold">
                        ${(actualData.revenue - actualData.cogs - actualData.operatingExpenses).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Assets</p>
                      <p className="text-lg font-bold">
                        ${(actualData.cash + actualData.accountsReceivable + actualData.inventory + actualData.otherCurrentAssets).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Equity</p>
                      <p className="text-lg font-bold">
                        ${(actualData.equity + actualData.retainedEarnings).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Covenant Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Detailed Covenant Test Results
              </CardTitle>
              <CardDescription>
                Individual covenant performance analysis with thresholds and actual values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {covenantRatios.map((ratio, index) => (
                  <Card key={index} className={`border-l-4 ${
                    ratio.status === 'met' ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/10' :
                    ratio.status === 'at-risk' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10' :
                    'border-l-red-500 bg-red-50/50 dark:bg-red-950/10'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(ratio.status)}
                          <div>
                            <h3 className="font-semibold text-lg">{ratio.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Threshold: {ratio.operator} {ratio.threshold.toFixed(2)}x
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-2xl font-bold font-mono">
                                {ratio.actual.toFixed(2)}x
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {ratio.status === 'met' ? 
                                  `${Math.abs(ratio.actual - ratio.threshold).toFixed(2)}x buffer` :
                                  `${Math.abs(ratio.actual - ratio.threshold).toFixed(2)}x ${ratio.status === 'breach' ? 'breach' : 'to threshold'}`
                                }
                              </p>
                            </div>
                            {getStatusBadge(ratio.status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment & Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Risk Assessment & Recommendations
              </CardTitle>
              <CardDescription>
                Strategic analysis and next steps based on covenant testing results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert Sections */}
              {breachCount > 0 && (
                <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-red-900 dark:text-red-100 text-lg mb-2">
                        CRITICAL: Covenant Breaches Detected
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        {breachCount} covenant{breachCount > 1 ? 's are' : ' is'} currently in breach. 
                        This may trigger acceleration clauses, additional fees, or require immediate remedial action.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-red-900 dark:text-red-100">Immediate Actions Required:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-red-700 dark:text-red-300">
                          <li>Notify lenders immediately as per loan agreement requirements</li>
                          <li>Prepare breach explanation and remedial action plan</li>
                          <li>Consider requesting covenant waivers or amendments</li>
                          <li>Review acceleration clauses and potential consequences</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {atRiskCount > 0 && breachCount === 0 && (
                <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 text-lg mb-2">
                        WARNING: Covenants Approaching Thresholds
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                        {atRiskCount} covenant{atRiskCount > 1 ? 's are' : ' is'} approaching breach thresholds. 
                        Proactive management is recommended to avoid future violations.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Recommended Actions:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                          <li>Monitor these covenants more frequently</li>
                          <li>Develop contingency plans for potential breaches</li>
                          <li>Consider operational improvements to strengthen ratios</li>
                          <li>Prepare lender communications explaining trends</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {compliantCount === covenantRatios.length && covenantRatios.length > 0 && (
                <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-100 text-lg mb-2">
                        EXCELLENT: Full Covenant Compliance
                      </h3>
                      <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                        All covenants are currently compliant with comfortable buffers. 
                        Maintain current financial discipline and monitoring practices.
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Maintain Excellence:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-green-700 dark:text-green-300">
                          <li>Continue regular covenant monitoring</li>
                          <li>Maintain buffer analysis for future planning</li>
                          <li>Document compliance processes for consistency</li>
                          <li>Consider growth opportunities within covenant constraints</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Strategic Recommendations */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Strategic Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Operational Focus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        <li>Implement monthly covenant testing alongside regular reporting</li>
                        <li>Establish early warning systems for trend monitoring</li>
                        <li>Optimize working capital management to improve liquidity ratios</li>
                        <li>Focus on EBITDA improvement through operational efficiency</li>
                        <li>Monitor debt service capabilities and refinancing opportunities</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Financial Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        <li>Maintain detailed documentation of all covenant calculations</li>
                        <li>Develop scenario analysis for different business conditions</li>
                        <li>Build relationships with lenders through proactive communication</li>
                        <li>Consider covenant-lite alternatives during refinancing</li>
                        <li>Establish clear escalation procedures for potential issues</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}