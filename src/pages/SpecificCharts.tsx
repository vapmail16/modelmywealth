import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Maximize2, RefreshCw, Calendar, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import all specific charts
import {
  DebtToEbitdaDscrChart,
  LtvInterestCoverageChart,
  DebtEquityOperatingMarginChart,
  RevenueEbitdaChart,
  DebtBalanceInterestChart,
  CashPpeEquityChart,
} from '@/components/charts/SpecificCharts1';

import {
  ProfitabilityRatiosChart,
  ArInventoryCycleChart,
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
      // Raw financial data
      revenue,
      cogs,
      ebitda,
      cash: inputs.cash,
      ppe: inputs.ppe,
      totalEquity: inputs.totalEquity,
      seniorSecuredDebt: inputs.seniorSecuredDebt,
      debtTranche1: inputs.debtTranche1,
      interestPaid: inputs.interestExpense,
      
      // Calculated KPIs
      ...kpis
    };
  });
};

export default function SpecificCharts() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [timeFilter, setTimeFilter] = useState("yearly");
  const [dateRange, setDateRange] = useState("10-years");
  
  // For demo purposes, use mock data
  const data = generateMockData();

  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Charts refreshed",
        description: "Chart data has been updated with the latest calculations",
      });
    } catch (error: any) {
      toast({
        title: "Refresh failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export all
  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Export successful",
        description: "All charts have been exported to PDF",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-franklin">Financial Analysis Charts</h1>
          <p className="text-muted-foreground mt-1">
            9 specific charts matching your Streamlit application with exact KPI calculations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="3-years">3 Years</SelectItem>
                <SelectItem value="5-years">5 Years</SelectItem>
                <SelectItem value="10-years">10 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportAll}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export All Charts'}
          </Button>
        </div>
      </div>

      {/* Charts Grid - Exact 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Column 1: Debt Analysis Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary">Debt Analysis</h2>
          
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Chart 1: Debt Ratios</CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Maximize2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-2">
              <DebtToEbitdaDscrChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <LtvInterestCoverageChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <DebtEquityOperatingMarginChart data={data} />
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Financial Performance Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary">Financial Performance</h2>
          
          <Card className="shadow-card">
            <CardContent className="p-2">
              <RevenueEbitdaChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <DebtBalanceInterestChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <CashPpeEquityChart data={data} />
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Profitability & Working Capital Charts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-primary">Profitability & Working Capital</h2>
          
          <Card className="shadow-card">
            <CardContent className="p-2">
              <ProfitabilityRatiosChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <ArInventoryCycleChart data={data} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-2">
              <KeyRatiosOverviewChart data={data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}