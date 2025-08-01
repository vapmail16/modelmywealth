import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import cash flow related charts
import {
  CashPpeEquityChart,
} from '@/components/charts/SpecificCharts1';

import {
  ArInventoryCycleChart,
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
      ...kpis
    };
  });
};

export default function CashFlow() {
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
        title: "Cash flow analysis refreshed",
        description: "Latest cash flow data has been updated",
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
        description: "Cash flow report has been exported",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Cash Flow KPI Cards
  const cashFlowKPIs = [
    {
      title: "Operating Cash Flow",
      value: `$${(currentData.operatingCashFlow / 1000000).toFixed(1)}M`,
      trend: currentData.operatingCashFlow > 0 ? "good" : "poor",
      description: "Cash generated from operations",
      change: "+5.2%"
    },
    {
      title: "Free Cash Flow",
      value: `$${(currentData.freeCashFlow / 1000000).toFixed(1)}M`,
      trend: currentData.freeCashFlow > 0 ? "good" : "poor",
      description: "Cash after capital expenditures",
      change: "+3.8%"
    },
    {
      title: "Cash Position",
      value: `$${(currentData.cash / 1000000).toFixed(1)}M`,
      trend: "good",
      description: "Total cash and equivalents",
      change: "+12.1%"
    },
    {
      title: "Current Ratio",
      value: currentData.currentRatio?.toFixed(2) || "N/A",
      trend: currentData.currentRatio > 1.5 ? "good" : currentData.currentRatio > 1.2 ? "warning" : "poor",
      description: "Short-term liquidity position",
      change: "+0.15"
    }
  ];

  // Working Capital Metrics
  const workingCapitalMetrics = [
    {
      title: "AR Days",
      value: "45 days",
      description: "Average collection period",
      target: "< 45 days"
    },
    {
      title: "Inventory Days",
      value: "60 days",
      description: "Inventory turnover period",
      target: "< 60 days"
    },
    {
      title: "AP Days",
      value: "30 days",
      description: "Payment period to suppliers",
      target: "> 30 days"
    },
    {
      title: "Cash Cycle",
      value: `${currentData.cashConversionCycle?.toFixed(0) || "N/A"} days`,
      description: "Working capital efficiency",
      target: "< 75 days"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Flow Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Cash generation, liquidity, and working capital management
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

      {/* Key Cash Flow Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cashFlowKPIs.map((kpi, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {kpi.trend === "good" && <TrendingUp className="h-3 w-3 text-green-500" />}
                {kpi.trend === "poor" && <TrendingDown className="h-3 w-3 text-red-500" />}
                <span className={`text-xs ${kpi.trend === "good" ? "text-green-500" : "text-red-500"}`}>
                  {kpi.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Working Capital Metrics */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Working Capital Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {workingCapitalMetrics.map((metric, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className="text-xl font-bold text-primary">{metric.value}</div>
                <div className="text-sm font-medium mt-1">{metric.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{metric.description}</div>
                <Badge variant="outline" className="mt-2 text-xs">
                  Target: {metric.target}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cash Flow Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Cash, PPE & Equity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <CashPpeEquityChart data={data} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Working Capital Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <ArInventoryCycleChart data={data} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cash Flow Statement with PS-PL Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Position Statement Integration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Position Statement (PS) Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Total Assets</span>
              <span className="font-medium">${(currentData.revenue * 1.2 / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Current Assets</span>
              <span className="font-medium">${(currentData.revenue * 0.25 / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">PPE Assets</span>
              <span className="font-medium">${(currentData.ppe / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Equity</span>
              <span className="font-medium">${(currentData.totalEquity / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Asset-Cash Flow Ratio</span>
              <span className="font-bold text-blue-600">
                {((currentData.operatingCashFlow / (currentData.revenue * 1.2)) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit & Loss Integration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Profit & Loss (PL) to Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Revenue</span>
              <span className="font-medium">${(currentData.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">EBITDA</span>
              <span className="font-medium">${(currentData.ebitda / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Expense</span>
              <span className="font-medium text-red-600">-${(currentData.interestPaid / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Working Capital Impact</span>
              <span className="font-medium">-$2.1M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Cash Conversion %</span>
              <span className="font-bold text-green-600">
                {((currentData.operatingCashFlow / currentData.ebitda) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Operating Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">EBITDA</span>
              <span className="font-medium">${(currentData.ebitda / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Working Capital Changes</span>
              <span className="font-medium">-$2.1M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Operating Cash Flow</span>
              <span className="font-bold text-green-600">
                ${(currentData.operatingCashFlow / 1000000).toFixed(1)}M
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Investing Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Capital Expenditures</span>
              <span className="font-medium text-red-600">
                -${(currentData.revenue * 0.04 / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Asset Acquisitions</span>
              <span className="font-medium">$0.0M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Investing Cash Flow</span>
              <span className="font-bold text-red-600">
                -${(currentData.revenue * 0.04 / 1000000).toFixed(1)}M
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Financing Activities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Debt Payments</span>
              <span className="font-medium text-red-600">-$2.5M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Payments</span>
              <span className="font-medium text-red-600">
                -${(currentData.interestPaid / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Financing Cash Flow</span>
              <span className="font-bold text-red-600">
                -${((currentData.interestPaid + 2500000) / 1000000).toFixed(1)}M
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}