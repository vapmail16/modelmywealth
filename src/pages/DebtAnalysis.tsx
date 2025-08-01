import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import debt-related charts
import {
  DebtToEbitdaDscrChart,
  LtvInterestCoverageChart,
  DebtEquityOperatingMarginChart,
  DebtBalanceInterestChart,
} from '@/components/charts/SpecificCharts1';

import { FinancialKPICalculator, FinancialInputs } from '@/utils/kpiCalculations';

// Mock data generator for demonstration
const generateMockData = () => {
  const years = Array.from({ length: 10 }, (_, i) => i + 1);
  
  return years.map(year => {
    const baseRevenue = 125000000; // $125M
    const growthRate = 0.03; // 3% annual growth
    const revenue = baseRevenue * Math.pow(1 + growthRate, year - 1);
    const cogs = revenue * 0.60; // 60% of revenue
    const ebitda = revenue * 0.20; // 20% EBITDA margin
    const totalDebt = 45200000; // $45.2M
    const totalEquity = 74400000; // $74.4M
    
    // Calculate all KPIs using the calculator
    const inputs: FinancialInputs = {
      revenue,
      cogs,
      operatingExpenses: revenue * 0.15,
      ebitda,
      depreciation: revenue * 0.03,
      interestExpense: totalDebt * 0.055, // 5.5% interest rate
      netIncome: ebitda * 0.65, // After interest and tax
      cash: 8700000 + (year - 1) * 500000,
      accountsReceivable: revenue / 365 * 45, // 45 days
      inventory: cogs / 365 * 60, // 60 days
      currentAssets: revenue * 0.25,
      ppe: 85300000 + (year - 1) * 2000000,
      totalAssets: revenue * 1.2,
      accountsPayable: cogs / 365 * 30, // 30 days
      currentLiabilities: revenue * 0.15,
      seniorSecuredDebt: totalDebt * 0.65,
      debtTranche1: totalDebt * 0.35,
      totalDebt,
      totalEquity: totalEquity + (year - 1) * 3000000,
      operatingCashFlow: ebitda * 0.85,
      capitalExpenditures: revenue * 0.04,
      freeCashFlow: ebitda * 0.85 - revenue * 0.04,
      tangibleAssets: revenue * 1.1,
      debtService: totalDebt * 0.12 // 12% debt service
    };
    
    const kpis = FinancialKPICalculator.calculateAllKPIs(inputs);
    
    return {
      year,
      revenue,
      cogs,
      ebitda,
      cash: inputs.cash,
      ppe: inputs.ppe,
      totalEquity: inputs.totalEquity,
      seniorSecuredDebt: inputs.seniorSecuredDebt,
      debtTranche1: inputs.debtTranche1,
      interestPaid: inputs.interestExpense,
      operatingCashFlow: inputs.operatingCashFlow,
      ...kpis
    };
  });
};

export default function DebtAnalysis() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const data = generateMockData();
  const currentData = data[data.length - 1]; // Latest year data

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Debt analysis refreshed",
        description: "Latest debt metrics have been calculated",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export successful",
        description: "Debt analysis report has been exported",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Debt KPI Cards
  const debtKPIs = [
    {
      title: "Debt-to-EBITDA",
      value: currentData.debtToEbitda?.toFixed(2) || "N/A",
      trend: currentData.debtToEbitda < 3 ? "good" : currentData.debtToEbitda < 5 ? "warning" : "poor",
      description: "Total debt relative to EBITDA",
      target: "< 3.0x"
    },
    {
      title: "DSCR",
      value: currentData.dscr?.toFixed(2) || "N/A",
      trend: currentData.dscr > 1.25 ? "good" : currentData.dscr > 1.1 ? "warning" : "poor",
      description: "Debt service coverage ratio",
      target: "> 1.25x"
    },
    {
      title: "Interest Coverage",
      value: currentData.interestCoverage?.toFixed(1) || "N/A",
      trend: currentData.interestCoverage > 3 ? "good" : currentData.interestCoverage > 2 ? "warning" : "poor",
      description: "EBITDA relative to interest expense",
      target: "> 3.0x"
    },
    {
      title: "LTV Ratio",
      value: `${(currentData.ltv * 100)?.toFixed(1)}%` || "N/A",
      trend: currentData.ltv < 0.7 ? "good" : currentData.ltv < 0.8 ? "warning" : "poor",
      description: "Loan-to-value ratio",
      target: "< 70%"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Debt Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive debt structure and coverage analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Key Debt Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {debtKPIs.map((kpi, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                {kpi.trend === "good" && <TrendingUp className="h-4 w-4 text-green-500" />}
                {kpi.trend === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {kpi.trend === "poor" && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              <Badge 
                variant={kpi.trend === "good" ? "default" : kpi.trend === "warning" ? "secondary" : "destructive"}
                className="mt-2 text-xs"
              >
                Target: {kpi.target}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debt Analysis Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Debt Ratios & Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <DebtToEbitdaDscrChart data={data} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">LTV & Interest Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <LtvInterestCoverageChart data={data} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Debt Structure Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <DebtEquityOperatingMarginChart data={data} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Debt Balance & Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <DebtBalanceInterestChart data={data} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Financial Statements Integration */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Financial Statements Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-xl font-bold text-primary">${(currentData.revenue / 1000000).toFixed(1)}M</div>
              <div className="text-sm font-medium mt-1">Revenue (IS)</div>
              <div className="text-xs text-muted-foreground mt-1">Income Statement</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-xl font-bold text-primary">${(currentData.ebitda / 1000000).toFixed(1)}M</div>
              <div className="text-sm font-medium mt-1">EBITDA (IS)</div>
              <div className="text-xs text-muted-foreground mt-1">Operating Performance</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-xl font-bold text-primary">${((currentData.seniorSecuredDebt + currentData.debtTranche1) / 1000000).toFixed(1)}M</div>
              <div className="text-sm font-medium mt-1">Total Debt (BS)</div>
              <div className="text-xs text-muted-foreground mt-1">Balance Sheet</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-xl font-bold text-primary">${(currentData.operatingCashFlow / 1000000).toFixed(1)}M</div>
              <div className="text-sm font-medium mt-1">Op. Cash Flow (CF)</div>
              <div className="text-xs text-muted-foreground mt-1">Cash Flow Statement</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom KPI Creation */}
      <Card className="shadow-card mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Create Your KPI</CardTitle>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Add Custom KPI
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">KPI Name</label>
              <div className="p-3 border rounded bg-muted/50">
                <span className="text-sm text-muted-foreground">e.g., Custom Debt Ratio</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Formula</label>
              <div className="p-3 border rounded bg-muted/50">
                <span className="text-sm text-muted-foreground">e.g., Total Debt / Total Assets</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Range</label>
              <div className="p-3 border rounded bg-muted/50">
                <span className="text-sm text-muted-foreground">e.g., &lt; 60%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Summary Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Debt Structure Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Senior Secured Debt</h4>
              <p className="text-2xl font-bold">${(currentData.seniorSecuredDebt / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">65% of total debt</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Second Lien Debt</h4>
              <p className="text-2xl font-bold">${(currentData.debtTranche1 / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">35% of total debt</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Total Debt</h4>
              <p className="text-2xl font-bold">${((currentData.seniorSecuredDebt + currentData.debtTranche1) / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Annual interest: ${(currentData.interestPaid / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}