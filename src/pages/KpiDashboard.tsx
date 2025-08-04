import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Target, Activity, MessageSquare, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import KPI overview charts
import {
  RevenueEbitdaChart,
} from '@/components/charts/SpecificCharts1';

import {
  ProfitabilityRatiosChart,
  KeyRatiosOverviewChart,
} from '@/components/charts/SpecificCharts2';

import { mockDataService } from '@/services';

export default function KpiDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState("yearly");
  const [timeFilter, setTimeFilter] = useState("10-years");
  
  const data = mockDataService.generateMockData();
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

  // Expanded KPI Summary - 12 KPI boxes as requested
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
    },
    {
      title: "Debt/EBITDA",
      value: `${currentData.debtToEbitda?.toFixed(2)}x`,
      trend: currentData.debtToEbitda < 3.0 ? "good" : currentData.debtToEbitda < 4.0 ? "warning" : "poor",
      description: "Debt relative to EBITDA",
      icon: AlertTriangle,
      target: "< 3.0x"
    },
    {
      title: "DSCR",
      value: `${currentData.dscr?.toFixed(2)}x`,
      trend: currentData.dscr > 1.45 ? "good" : currentData.dscr > 1.25 ? "warning" : "poor",
      description: "Debt service coverage ratio",
      icon: TrendingUp,
      target: "> 1.45x"
    },
    {
      title: "Interest Coverage",
      value: `${currentData.interestCoverage?.toFixed(1)}x`,
      trend: currentData.interestCoverage > 3.0 ? "good" : currentData.interestCoverage > 2.0 ? "warning" : "poor",
      description: "EBITDA relative to interest expense",
      icon: Target,
      target: "> 3.0x"
    },
    {
      title: "Current Ratio",
      value: `${currentData.currentRatio?.toFixed(2)}`,
      trend: currentData.currentRatio > 1.5 ? "good" : currentData.currentRatio > 1.2 ? "warning" : "poor",
      description: "Short-term liquidity position",
      icon: Activity,
      target: "> 1.5"
    },
    {
      title: "Asset Turnover",
      value: `${(currentData.revenue / (currentData.revenue * 1.2)).toFixed(2)}x`,
      trend: (currentData.revenue / (currentData.revenue * 1.2)) > 0.8 ? "good" : (currentData.revenue / (currentData.revenue * 1.2)) > 0.6 ? "warning" : "poor",
      description: "Asset utilization efficiency",
      icon: TrendingUp,
      target: "> 0.8x"
    },
    {
      title: "Working Capital Cycle",
      value: `${(45 + 60 - 30).toFixed(0)} days`,
      trend: (45 + 60 - 30) < 75 ? "good" : (45 + 60 - 30) < 90 ? "warning" : "poor",
      description: "Cash conversion cycle",
      icon: AlertTriangle,
      target: "< 75 days"
    },
    {
      title: "LTV Ratio",
      value: `${(currentData.ltv * 100).toFixed(1)}%`,
      trend: currentData.ltv < 0.70 ? "good" : currentData.ltv < 0.80 ? "warning" : "poor",
      description: "Loan-to-value ratio",
      icon: Target,
      target: "< 70%"
    },
    {
      title: "Free Cash Flow Margin",
      value: `${((currentData.freeCashFlow / currentData.revenue) * 100).toFixed(1)}%`,
      trend: (currentData.freeCashFlow / currentData.revenue) > 0.10 ? "good" : (currentData.freeCashFlow / currentData.revenue) > 0.05 ? "warning" : "poor",
      description: "Free cash flow as % of revenue",
      icon: Activity,
      target: "> 10%"
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
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-year">1 Year</SelectItem>
              <SelectItem value="3-years">3 Years</SelectItem>
              <SelectItem value="5-years">5 Years</SelectItem>
              <SelectItem value="10-years">10 Years</SelectItem>
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

      {/* Critical KPIs - 12 KPI boxes as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
    </div>
  );
}