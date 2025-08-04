import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import cash flow related charts
import {
  CashPpeEquityChart,
} from '@/components/charts/SpecificCharts1';

import {
  ArInventoryCycleChart,
} from '@/components/charts/SpecificCharts2';

import { mockDataService } from '@/services';

export default function CashFlow() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>("3"); // Default to 3 months
  
  const data = mockDataService.generateMockData();
  
  // Filter data based on selected time period
  const getFilteredData = () => {
    const months = parseInt(timeFilter);
    const totalPeriods = data.length;
    const periodsToShow = Math.min(months, totalPeriods);
    return data.slice(-periodsToShow);
  };
  
  const filteredData = getFilteredData();
  const currentData = filteredData[filteredData.length - 1]; // Latest period data
  
  // Calculate aggregated metrics from filtered data
  const aggregatedMetrics = {
    totalOperatingCashFlow: filteredData.reduce((sum, period) => sum + period.operatingCashFlow, 0),
    totalFreeCashFlow: filteredData.reduce((sum, period) => sum + period.freeCashFlow, 0),
    averageCash: filteredData.reduce((sum, period) => sum + period.cash, 0) / filteredData.length,
    averageCurrentRatio: filteredData.reduce((sum, period) => sum + (period.currentRatio || 0), 0) / filteredData.length,
    totalRevenue: filteredData.reduce((sum, period) => sum + period.revenue, 0),
    totalEbitda: filteredData.reduce((sum, period) => sum + period.ebitda, 0),
    totalInterestPaid: filteredData.reduce((sum, period) => sum + period.interestPaid, 0),
    averagePpe: filteredData.reduce((sum, period) => sum + period.ppe, 0) / filteredData.length,
    averageTotalEquity: filteredData.reduce((sum, period) => sum + period.totalEquity, 0) / filteredData.length,
    averageCashConversionCycle: filteredData.reduce((sum, period) => sum + (period.cashConversionCycle || 0), 0) / filteredData.length
  };

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

  // Cash Flow KPI Cards - now using aggregated metrics
  const cashFlowKPIs = [
    {
      title: "Operating Cash Flow",
      value: `$${(aggregatedMetrics.totalOperatingCashFlow / 1000000).toFixed(1)}M`,
      trend: aggregatedMetrics.totalOperatingCashFlow > 0 ? "good" : "poor",
      description: `Cash generated from operations (${timeFilter} months)`,
      change: "+5.2%"
    },
    {
      title: "Free Cash Flow",
      value: `$${(aggregatedMetrics.totalFreeCashFlow / 1000000).toFixed(1)}M`,
      trend: aggregatedMetrics.totalFreeCashFlow > 0 ? "good" : "poor",
      description: `Cash after capital expenditures (${timeFilter} months)`,
      change: "+3.8%"
    },
    {
      title: "Cash Position",
      value: `$${(aggregatedMetrics.averageCash / 1000000).toFixed(1)}M`,
      trend: "good",
      description: `Average cash and equivalents (${timeFilter} months)`,
      change: "+12.1%"
    },
    {
      title: "Current Ratio",
      value: aggregatedMetrics.averageCurrentRatio?.toFixed(2) || "N/A",
      trend: aggregatedMetrics.averageCurrentRatio > 1.5 ? "good" : aggregatedMetrics.averageCurrentRatio > 1.2 ? "warning" : "poor",
      description: `Average liquidity position (${timeFilter} months)`,
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
      value: `${aggregatedMetrics.averageCashConversionCycle?.toFixed(0) || "N/A"} days`,
      description: `Average working capital efficiency (${timeFilter} months)`,
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
          <p className="text-sm text-muted-foreground mt-1">
            Data is by default of last 3 months
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 months</SelectItem>
              <SelectItem value="6">6 months</SelectItem>
              <SelectItem value="12">12 months</SelectItem>
              <SelectItem value="24">24 months</SelectItem>
              <SelectItem value="36">36 months</SelectItem>
            </SelectContent>
          </Select>
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


      {/* Cash Flow Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Cash, PPE & Equity Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <CashPpeEquityChart data={filteredData} />
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Working Capital Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <ArInventoryCycleChart data={filteredData} />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Cash Flow Statement with PS-PL Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Position Statement Integration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Position Statement (PS) Impact ({timeFilter} months avg)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Total Assets</span>
              <span className="font-medium">${(aggregatedMetrics.totalRevenue * 1.2 / filteredData.length / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Current Assets</span>
              <span className="font-medium">${(aggregatedMetrics.totalRevenue * 0.25 / filteredData.length / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">PPE Assets</span>
              <span className="font-medium">${(aggregatedMetrics.averagePpe / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Equity</span>
              <span className="font-medium">${(aggregatedMetrics.averageTotalEquity / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Asset-Cash Flow Ratio</span>
              <span className="font-bold text-blue-600">
                {((aggregatedMetrics.totalOperatingCashFlow / (aggregatedMetrics.totalRevenue * 1.2)) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Profit & Loss Integration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Profit & Loss (PL) to Cash Flow ({timeFilter} months total)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Revenue</span>
              <span className="font-medium">${(aggregatedMetrics.totalRevenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">EBITDA</span>
              <span className="font-medium">${(aggregatedMetrics.totalEbitda / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interest Expense</span>
              <span className="font-medium text-red-600">-${(aggregatedMetrics.totalInterestPaid / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Working Capital Impact</span>
              <span className="font-medium">-${(filteredData.length * 2.1).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="font-medium">Cash Conversion %</span>
              <span className="font-bold text-green-600">
                {((aggregatedMetrics.totalOperatingCashFlow / aggregatedMetrics.totalEbitda) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}