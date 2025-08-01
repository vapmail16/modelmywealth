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

import { mockDataService } from '@/services';

export default function SpecificCharts() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [timeFilter, setTimeFilter] = useState("yearly");
  const [dateRange, setDateRange] = useState("10-years");
  
  // For demo purposes, use mock data
  const data = mockDataService.generateMockData();

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