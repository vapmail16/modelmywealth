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
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, Calculator } from "lucide-react";

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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
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
          <span className="text-sm text-muted-foreground">Testing Period: {selectedPeriod || "Select Period"}</span>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup & Data Entry</TabsTrigger>
          <TabsTrigger value="results" disabled={!hasCalculated}>Test Results</TabsTrigger>
          <TabsTrigger value="analysis" disabled={!hasCalculated}>Analysis</TabsTrigger>
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
                Select the testing period and specify when covenant compliance is being tested
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Testing Period</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select testing month" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border z-50">
                    <SelectItem value="january">January</SelectItem>
                    <SelectItem value="february">February</SelectItem>
                    <SelectItem value="march">March</SelectItem>
                    <SelectItem value="april">April</SelectItem>
                    <SelectItem value="may">May</SelectItem>
                    <SelectItem value="june">June</SelectItem>
                    <SelectItem value="july">July</SelectItem>
                    <SelectItem value="august">August</SelectItem>
                    <SelectItem value="september">September</SelectItem>
                    <SelectItem value="october">October</SelectItem>
                    <SelectItem value="november">November</SelectItem>
                    <SelectItem value="december">December</SelectItem>
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
                  disabled={!selectedPeriod || actualData.revenue === 0}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Compliant</p>
                    <p className="text-2xl font-bold text-green-900">{compliantCount}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">At Risk</p>
                    <p className="text-2xl font-bold text-yellow-900">{atRiskCount}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Breaches</p>
                    <p className="text-2xl font-bold text-red-900">{breachCount}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Covenant Test Results</CardTitle>
              <CardDescription>
                Detailed covenant compliance analysis for {selectedPeriod} period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {covenantRatios.map((ratio, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(ratio.status)}
                      <div>
                        <h3 className="font-medium">{ratio.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Required: {ratio.operator} {ratio.threshold.toFixed(2)}x
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg">
                          {ratio.actual.toFixed(2)}x
                        </span>
                        {getStatusBadge(ratio.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Compliance Analysis & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {breachCount > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-900 mb-2">Covenant Breaches Detected</h3>
                  <p className="text-sm text-red-700">
                    {breachCount} covenant{breachCount > 1 ? 's' : ''} in breach. Immediate action required to address compliance issues.
                  </p>
                </div>
              )}
              
              {atRiskCount > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-yellow-900 mb-2">At-Risk Covenants</h3>
                  <p className="text-sm text-yellow-700">
                    {atRiskCount} covenant{atRiskCount > 1 ? 's' : ''} approaching threshold limits. Monitor closely and consider corrective actions.
                  </p>
                </div>
              )}
              
              {compliantCount === covenantRatios.length && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Full Compliance</h3>
                  <p className="text-sm text-green-700">
                    All covenants are compliant. Continue monitoring to maintain strong financial position.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-medium">Recommendations:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Schedule regular covenant testing aligned with reporting periods</li>
                  <li>Implement early warning systems for covenant thresholds</li>
                  <li>Consider covenant amendments if persistent compliance issues arise</li>
                  <li>Maintain detailed documentation of all covenant calculations</li>
                  <li>Establish action plans for potential covenant breaches</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}