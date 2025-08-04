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

import { mockDataService } from '@/services';

export default function DebtAnalysis() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const data = mockDataService.generateMockData();
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

    </div>
  );
}