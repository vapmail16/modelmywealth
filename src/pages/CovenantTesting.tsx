import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Calendar, Calculator } from "lucide-react";

interface CovenantRatio {
  name: string;
  threshold: number;
  actual: number;
  status: 'met' | 'at-risk' | 'breach';
  operator: '<' | '>' | '≤' | '≥';
}

interface ActualData {
  revenue: number;
  ebitda: number;
  netIncome: number;
  totalDebt: number;
  currentAssets: number;
  currentLiabilities: number;
  interestExpense: number;
  totalAssets: number;
  totalEquity: number;
}

export default function CovenantTesting() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [testingDate, setTestingDate] = useState<string>("");
  const [actualData, setActualData] = useState<ActualData>({
    revenue: 0,
    ebitda: 0,
    netIncome: 0,
    totalDebt: 0,
    currentAssets: 0,
    currentLiabilities: 0,
    interestExpense: 0,
    totalAssets: 0,
    totalEquity: 0,
  });
  
  const [hasCalculated, setHasCalculated] = useState(false);

  // Sample covenant ratios - these would typically come from the debt structure data
  const calculateCovenantRatios = (): CovenantRatio[] => {
    const debtToEbitda = actualData.ebitda > 0 ? actualData.totalDebt / actualData.ebitda : 0;
    const interestCoverage = actualData.interestExpense > 0 ? actualData.ebitda / actualData.interestExpense : 0;
    const currentRatio = actualData.currentLiabilities > 0 ? actualData.currentAssets / actualData.currentLiabilities : 0;
    const debtToEquity = actualData.totalEquity > 0 ? actualData.totalDebt / actualData.totalEquity : 0;

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
                  <SelectTrigger>
                    <SelectValue placeholder="Select testing period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Q1 (3 months)</SelectItem>
                    <SelectItem value="q2">Q2 (6 months)</SelectItem>
                    <SelectItem value="q3">Q3 (9 months)</SelectItem>
                    <SelectItem value="annual">Annual (12 months)</SelectItem>
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="0"
                    value={actualData.revenue || ""}
                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ebitda">EBITDA ($)</Label>
                  <Input
                    id="ebitda"
                    type="number"
                    placeholder="0"
                    value={actualData.ebitda || ""}
                    onChange={(e) => handleInputChange('ebitda', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="netIncome">Net Income ($)</Label>
                  <Input
                    id="netIncome"
                    type="number"
                    placeholder="0"
                    value={actualData.netIncome || ""}
                    onChange={(e) => handleInputChange('netIncome', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalDebt">Total Debt ($)</Label>
                  <Input
                    id="totalDebt"
                    type="number"
                    placeholder="0"
                    value={actualData.totalDebt || ""}
                    onChange={(e) => handleInputChange('totalDebt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAssets">Current Assets ($)</Label>
                  <Input
                    id="currentAssets"
                    type="number"
                    placeholder="0"
                    value={actualData.currentAssets || ""}
                    onChange={(e) => handleInputChange('currentAssets', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentLiabilities">Current Liabilities ($)</Label>
                  <Input
                    id="currentLiabilities"
                    type="number"
                    placeholder="0"
                    value={actualData.currentLiabilities || ""}
                    onChange={(e) => handleInputChange('currentLiabilities', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestExpense">Interest Expense ($)</Label>
                  <Input
                    id="interestExpense"
                    type="number"
                    placeholder="0"
                    value={actualData.interestExpense || ""}
                    onChange={(e) => handleInputChange('interestExpense', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAssets">Total Assets ($)</Label>
                  <Input
                    id="totalAssets"
                    type="number"
                    placeholder="0"
                    value={actualData.totalAssets || ""}
                    onChange={(e) => handleInputChange('totalAssets', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalEquity">Total Equity ($)</Label>
                  <Input
                    id="totalEquity"
                    type="number"
                    placeholder="0"
                    value={actualData.totalEquity || ""}
                    onChange={(e) => handleInputChange('totalEquity', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex justify-end">
                <Button 
                  onClick={runCovenantTest}
                  disabled={!selectedPeriod || actualData.ebitda === 0}
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