import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Maximize2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import stores
import { useFinancialDataStore } from '@/stores/financialDataStore';
import { useChartDataStore } from '@/stores/chartDataStore';

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
  
  // Store state
  const {
    currentProject,
    calculationResults,
    isLoading,
    loadProject,
  } = useFinancialDataStore();
  
  const {
    chartData,
    isLoading: isLoadingCharts,
    isExporting,
    loadAllCharts,
    exportAllCharts,
    refreshCharts,
  } = useChartDataStore();

  // For demo purposes, use mock data if no real project is loaded
  const data = generateMockData();

  // Load chart data on component mount
  useEffect(() => {
    if (currentProject) {
      loadAllCharts(currentProject.id).catch((error) => {
        toast({
          title: "Error loading charts",
          description: error.message,
          variant: "destructive",
        });
      });
    }
  }, [currentProject, loadAllCharts, toast]);

  // Handle refresh
  const handleRefresh = async () => {
    if (currentProject) {
      try {
        await refreshCharts(currentProject.id);
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
      }
    }
  };

  // Handle export all
  const handleExportAll = async () => {
    if (currentProject) {
      try {
        const downloadUrl = await exportAllCharts(currentProject.id, 'pdf');
        window.open(downloadUrl, '_blank');
        
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
      }
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
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isLoadingCharts}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingCharts ? 'animate-spin' : ''}`} />
            {isLoadingCharts ? 'Loading...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExportAll}
            disabled={isExporting || !currentProject}
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