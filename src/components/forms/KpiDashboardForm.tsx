import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Calculator, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useKpiData } from '@/hooks/useKpiData';
import { MonthlyKpi, QuarterlyKpi, YearlyKpi } from '@/types/kpi';

interface KpiDashboardFormProps {
  projectId: string;
}

export const KpiDashboardForm: React.FC<KpiDashboardFormProps> = ({ projectId }) => {
  const {
    monthlyKpis,
    quarterlyKpis,
    yearlyKpis,
    validationStatus,
    monthlyHistory,
    quarterlyHistory,
    yearlyHistory,
    loading,
    calculating,
    error,
    selectedCalculationRun,
    setSelectedCalculationRun,
    performCalculation,
    restoreCalculationRun,
    exportData
  } = useKpiData({ projectId });

  const [activeTab, setActiveTab] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const handleCalculate = async () => {
    await performCalculation();
  };

  const handleExport = async () => {
    await exportData(activeTab);
  };

  const handleHistoryChange = (runId: string) => {
    setSelectedCalculationRun(runId);
    restoreCalculationRun(runId);
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'monthly':
        return monthlyKpis;
      case 'quarterly':
        return quarterlyKpis;
      case 'yearly':
        return yearlyKpis;
      default:
        return [];
    }
  };

    const getCurrentHistory = () => {
    switch (activeTab) {
      case 'monthly':
        return monthlyHistory;
      case 'quarterly':
        return quarterlyHistory;
      case 'yearly':
        return yearlyHistory;
      default:
        return [];
    }
  };

  // Helper function to safely format numbers
  const formatNumber = (value: any, decimals: number = 2) => {
    if (value === null || value === undefined) return 'N/A';
    const num = Number(value);
    return isNaN(num) ? 'N/A' : num.toFixed(decimals);
  };

  const renderSummaryCards = (data: MonthlyKpi[] | QuarterlyKpi[] | YearlyKpi[]) => {
    if (data.length === 0) return null;
    
    const latest = data[data.length - 1];
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debt to EBITDA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(latest.debt_to_ebitda, 2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Debt Service Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(latest.debt_service_coverage_ratio, 2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(latest.current_ratio, 2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Operating Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(latest.operating_margin ? latest.operating_margin * 100 : null, 1)}%
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDataTable = (data: MonthlyKpi[] | QuarterlyKpi[] | YearlyKpi[]) => {
    if (data.length === 0) {
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No KPI data available. Please run calculations first.
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Data</CardTitle>
          <CardDescription>
            Detailed Key Performance Indicators for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {activeTab === 'monthly' && (
                    <>
                      <TableHead>Month</TableHead>
                      <TableHead>Year</TableHead>
                    </>
                  )}
                  {activeTab === 'quarterly' && (
                    <>
                      <TableHead>Quarter</TableHead>
                      <TableHead>Year</TableHead>
                    </>
                  )}
                  {activeTab === 'yearly' && (
                    <TableHead>Year</TableHead>
                  )}
                  <TableHead>Debt to EBITDA</TableHead>
                  <TableHead>DSCR</TableHead>
                  <TableHead>LTV Ratio</TableHead>
                  <TableHead>Interest Coverage</TableHead>
                  <TableHead>Current Ratio</TableHead>
                  <TableHead>Quick Ratio</TableHead>
                  <TableHead>Debt to Equity</TableHead>
                  <TableHead>Operating Margin</TableHead>
                  <TableHead>FCFF</TableHead>
                  <TableHead>FCFE</TableHead>
                  <TableHead>AR Cycle Days</TableHead>
                  <TableHead>Inventory Cycle Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={index}>
                    {activeTab === 'monthly' && (
                      <>
                        <TableCell>{(item as MonthlyKpi).month_name}</TableCell>
                        <TableCell>{(item as MonthlyKpi).year}</TableCell>
                      </>
                    )}
                    {activeTab === 'quarterly' && (
                      <>
                        <TableCell>{(item as QuarterlyKpi).quarter_name}</TableCell>
                        <TableCell>{(item as QuarterlyKpi).year}</TableCell>
                      </>
                    )}
                    {activeTab === 'yearly' && (
                      <TableCell>{(item as YearlyKpi).year}</TableCell>
                    )}
                    <TableCell>{formatNumber(item.debt_to_ebitda, 2)}</TableCell>
                    <TableCell>{formatNumber(item.debt_service_coverage_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.loan_to_value_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.interest_coverage_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.current_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.quick_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.debt_to_equity_ratio, 2)}</TableCell>
                    <TableCell>{formatNumber(item.operating_margin ? item.operating_margin * 100 : null, 1)}%</TableCell>
                    <TableCell>{formatNumber(item.fcff, 0)}</TableCell>
                    <TableCell>{formatNumber(item.fcfe, 0)}</TableCell>
                    <TableCell>{formatNumber(item.ar_cycle_days, 1)}</TableCell>
                    <TableCell>{formatNumber(item.inventory_cycle_days, 1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KPI Dashboard</h2>
          <p className="text-muted-foreground">
            Key Performance Indicators and Financial Ratios
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {validationStatus && (
            <Badge variant={validationStatus.valid ? "default" : "destructive"}>
              {validationStatus.valid ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Invalid
                </>
              )}
            </Badge>
          )}
          
          <Button
            onClick={handleCalculate}
            disabled={calculating || !validationStatus?.valid}
            className="flex items-center gap-2"
          >
            {calculating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            {calculating ? 'Calculating...' : 'Calculate KPIs'}
          </Button>
          
          <Button
            onClick={handleExport}
            disabled={getCurrentData().length === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Validation Alert */}
      {validationStatus && !validationStatus.valid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationStatus.message}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* History Selector */}
      {getCurrentHistory().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Calculation History</CardTitle>
            <CardDescription>
              Select a previous calculation run to restore
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCalculationRun || ''}
              onValueChange={handleHistoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select calculation run" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentHistory().map((run) => (
                  <SelectItem key={run.id} value={run.id}>
                    {run.run_name} - {new Date(run.created_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'monthly' | 'quarterly' | 'yearly')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly KPIs</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly KPIs</TabsTrigger>
          <TabsTrigger value="yearly">Yearly KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {renderSummaryCards(monthlyKpis)}
          {renderDataTable(monthlyKpis)}
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-6">
          {renderSummaryCards(quarterlyKpis)}
          {renderDataTable(quarterlyKpis)}
        </TabsContent>

        <TabsContent value="yearly" className="space-y-6">
          {renderSummaryCards(yearlyKpis)}
          {renderDataTable(yearlyKpis)}
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading KPI data...</span>
          </div>
        </div>
      )}
    </div>
  );
}; 