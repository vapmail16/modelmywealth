import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Target, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import KPI overview charts
import {
  RevenueEbitdaChart,
} from '@/components/charts/SpecificCharts1';

import {
  ProfitabilityRatiosChart,
  KeyRatiosOverviewChart,
} from '@/components/charts/SpecificCharts2';

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
      freeCashFlow: inputs.freeCashFlow,
      netIncome: inputs.netIncome,
      ...kpis
    };
  });
};

export default function KpiDashboard() {
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
        title: "KPI dashboard refreshed",
        description: "All key performance indicators have been updated",
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
        description: "KPI dashboard report has been exported",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Critical KPI Summary
  const criticalKPIs = [
    {
      title: "Revenue Growth",
      value: "3.0%",
      trend: "good",
      description: "Annual revenue growth rate",
      icon: TrendingUp,
      target: "> 2.5%"
    },
    {
      title: "EBITDA Margin",
      value: `${((currentData.ebitda / currentData.revenue) * 100).toFixed(1)}%`,
      trend: "good",
      description: "Operating profitability",
      icon: Target,
      target: "> 18%"
    },
    {
      title: "Net Margin",
      value: `${((currentData.netIncome / currentData.revenue) * 100).toFixed(1)}%`,
      trend: "good",
      description: "Bottom-line profitability",
      icon: Activity,
      target: "> 10%"
    },
    {
      title: "ROE",
      value: `${((currentData.netIncome / currentData.totalEquity) * 100).toFixed(1)}%`,
      trend: (currentData.netIncome / currentData.totalEquity) > 0.15 ? "good" : (currentData.netIncome / currentData.totalEquity) > 0.12 ? "warning" : "poor",
      description: "Return on equity",
      icon: TrendingUp,
      target: "> 15%"
    }
  ];

  // Financial Health Score Components
  const healthComponents = [
    {
      category: "Profitability",
      score: 85,
      status: "good",
      metrics: ["EBITDA Margin", "Net Margin", "ROA", "ROE"]
    },
    {
      category: "Liquidity",
      score: 78,
      status: "good",
      metrics: ["Current Ratio", "Quick Ratio", "Cash Position"]
    },
    {
      category: "Leverage",
      score: 72,
      status: "warning",
      metrics: ["Debt/EBITDA", "DSCR", "Interest Coverage"]
    },
    {
      category: "Efficiency",
      score: 68,
      status: "warning",
      metrics: ["Asset Turnover", "Working Capital", "Cash Cycle"]
    }
  ];

  const overallHealthScore = Math.round(
    healthComponents.reduce((sum, comp) => sum + comp.score, 0) / healthComponents.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Executive overview of key performance indicators and financial health
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
            {isExporting ? 'Exporting...' : 'Export Dashboard'}
          </Button>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-4xl font-bold text-primary">{overallHealthScore}</div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={overallHealthScore >= 80 ? "default" : overallHealthScore >= 70 ? "secondary" : "destructive"}
                className="text-sm"
              >
                {overallHealthScore >= 80 ? "Excellent" : overallHealthScore >= 70 ? "Good" : "Needs Attention"}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {healthComponents.map((component, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{component.score}</div>
                <div className="font-medium mt-1">{component.category}</div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      component.status === "good" ? "bg-green-500" : 
                      component.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${component.score}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {component.metrics.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {criticalKPIs.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="shadow-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${
                    kpi.trend === "good" ? "text-green-500" : 
                    kpi.trend === "warning" ? "text-yellow-500" : "text-red-500"
                  }`} />
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
          );
        })}
      </div>

      {/* Key Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Revenue & EBITDA Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueEbitdaChart data={data} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Profitability Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitabilityRatiosChart data={data} />
          </CardContent>
        </Card>
      </div>

      {/* Comprehensive KPI Overview */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Key Ratios Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <KeyRatiosOverviewChart data={data} />
        </CardContent>
      </Card>

      {/* Quick Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Annual Revenue</span>
              <span className="font-bold">${(currentData.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">EBITDA</span>
              <span className="font-bold">${(currentData.ebitda / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Net Income</span>
              <span className="font-bold">${(currentData.netIncome / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Free Cash Flow</span>
              <span className="font-bold">${(currentData.freeCashFlow / 1000000).toFixed(1)}M</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Risk Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Debt/EBITDA Ratio</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentData.debtToEbitda?.toFixed(2)}</span>
                {currentData.debtToEbitda > 4 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Interest Coverage</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentData.interestCoverage?.toFixed(1)}x</span>
                {currentData.interestCoverage < 2.5 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Ratio</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentData.currentRatio?.toFixed(2)}</span>
                {currentData.currentRatio < 1.2 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">DSCR</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{currentData.dscr?.toFixed(2)}</span>
                {currentData.dscr < 1.25 && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}