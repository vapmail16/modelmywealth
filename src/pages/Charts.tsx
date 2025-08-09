import React, { useState, useEffect } from 'react';
import { RevenueChart } from '../components/charts/RevenueChart';
import { KpiChart } from '../components/charts/KpiChart';
import { DualAxisChart } from '../components/charts/DualAxisChart';
import { BarChart } from '../components/charts/BarChart';
import { CombinedChart } from '../components/charts/CombinedChart';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { chartApiService } from '../services/api/chartApiService';
import { useProjectStore } from '../stores/projectStore';
import { useToast } from '../hooks/use-toast';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    type?: 'bar' | 'line';
    yAxisID?: string;
  }[];
}

type DataPeriod = 'monthly' | 'quarterly' | 'yearly';

const Charts: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const { toast } = useToast();
  const [selectedRun, setSelectedRun] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<DataPeriod>('yearly');
  const [chartData, setChartData] = useState<{
    revenue?: ChartData;
    ebitda?: ChartData;
    debt?: ChartData;
    kpis?: ChartData;
    // Debt Analysis Charts
    debtToEbitdaDscr?: ChartData;
    ltvInterestCoverage?: ChartData;
    debtToEquityOperatingMargin?: ChartData;
    // Financial Performance Charts
    revenueEbitda?: ChartData;
    outstandingDebtInterest?: ChartData;
    cashPpeEquity?: ChartData;
    // Profitability Charts
    profitabilityRatios?: ChartData;
    arInventoryCycle?: ChartData;
    keyRatiosOverview?: ChartData;
  }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedProject) {
      loadChartData();
    }
  }, [selectedProject, selectedRun, selectedPeriod]);

  const loadChartData = async () => {
    if (!selectedProject?.id) return;
    
    setLoading(true);
    try {
      const runId = selectedRun === 'latest' ? undefined : selectedRun;
      
      // Load all chart data from our real database based on selected period
      const [revenueData, ebitdaData, debtData, kpiData, consolidatedData, kpiPeriodData] = await Promise.all([
        chartApiService.getRevenueData(selectedProject.id, runId),
        chartApiService.getEbitdaData(selectedProject.id, runId),
        chartApiService.getDebtData(selectedProject.id, runId),
        chartApiService.getKpiData(selectedProject.id, 'monthly', runId),
        chartApiService.getConsolidatedData(selectedProject.id, selectedPeriod, runId),
        chartApiService.getKpiData(selectedProject.id, selectedPeriod, runId),
      ]);

      // Create all 9 charts from Streamlit app
      const charts = {
        revenue: revenueData,
        ebitda: ebitdaData,
        debt: debtData,
        kpis: kpiData,
        
        // 1. Debt to EBITDA & DSCR
        debtToEbitdaDscr: createDebtToEbitdaDscrChart(kpiPeriodData),
        
        // 2. LTV and Interest Coverage Ratio
        ltvInterestCoverage: createLtvInterestCoverageChart(kpiPeriodData),
        
        // 3. Debt to Equity Ratio & Operating Margin
        debtToEquityOperatingMargin: createDebtToEquityOperatingMarginChart(kpiPeriodData),
        
        // 4. Revenue and EBITDA
        revenueEbitda: createRevenueEbitdaChart(consolidatedData),
        
        // 5. Outstanding Debt Balance and Interest Paid
        outstandingDebtInterest: createOutstandingDebtInterestChart(consolidatedData, kpiPeriodData),
        
        // 6. Cash, PPE and Total Equity Balance
        cashPpeEquity: createCashPpeEquityChart(consolidatedData),
        
        // 7. Profitability Ratios as % of Revenue
        profitabilityRatios: createProfitabilityRatiosChart(consolidatedData),
        
        // 8. AR and Inventory Cycle Days
        arInventoryCycle: createArInventoryCycleChart(consolidatedData),
        
        // 9. Key Ratios Overview
        keyRatiosOverview: createKeyRatiosOverviewChart(kpiPeriodData),
      };

      setChartData(charts);

      toast({
        title: "Charts loaded successfully",
        description: `All 9 financial charts have been loaded with ${selectedPeriod} data.`,
      });
    } catch (error) {
      console.error('Failed to load chart data:', error);
      toast({
        title: "Error loading charts",
        description: "Failed to load chart data. Please ensure you have calculated data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart creation functions using real data
  const createDebtToEbitdaDscrChart = (kpiData: any[]): ChartData => {
    const labels = kpiData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Debt to EBITDA',
          data: kpiData.map(item => item.debt_to_ebitda || 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'DSCR',
          data: kpiData.map(item => item.debt_service_coverage_ratio || 0),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createLtvInterestCoverageChart = (kpiData: any[]): ChartData => {
    const labels = kpiData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Interest Coverage Ratio',
          data: kpiData.map(item => item.interest_coverage_ratio || 0),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'LTV Ratio',
          data: kpiData.map(item => item.loan_to_value_ratio || 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createDebtToEquityOperatingMarginChart = (kpiData: any[]): ChartData => {
    const labels = kpiData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Operating Margin',
          data: kpiData.map(item => (item.operating_margin || 0) * 100), // Convert to percentage
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'Debt to Equity',
          data: kpiData.map(item => item.debt_to_equity_ratio || 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createRevenueEbitdaChart = (consolidatedData: any[]): ChartData => {
    const labels = consolidatedData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: consolidatedData.map(item => item.revenue || 0),
          backgroundColor: 'rgb(54, 162, 235)',
        },
        {
          label: 'EBITDA',
          data: consolidatedData.map(item => item.ebitda || 0),
          backgroundColor: 'rgb(255, 159, 64)',
        }
      ]
    };
  };

  const createOutstandingDebtInterestChart = (consolidatedData: any[], kpiData: any[]): ChartData => {
    const labels = consolidatedData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Senior Secured',
          data: consolidatedData.map(item => item.senior_secured || 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          type: 'line',
          yAxisID: 'y',
        },
        {
          label: 'Debt Tranche 1',
          data: consolidatedData.map(item => item.debt_tranche_1 || 0),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          type: 'line',
          yAxisID: 'y',
        },
        {
          label: 'Interest Paid',
          data: consolidatedData.map(item => Math.abs(item.interest_expense || 0)),
          backgroundColor: 'rgb(75, 192, 192)',
          type: 'bar',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createCashPpeEquityChart = (consolidatedData: any[]): ChartData => {
    const labels = consolidatedData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Cash',
          data: consolidatedData.map(item => item.cash || 0),
          backgroundColor: 'rgb(54, 162, 235)',
          type: 'bar',
          yAxisID: 'y',
        },
        {
          label: 'PPE',
          data: consolidatedData.map(item => item.property_plant_equipment || 0),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          type: 'line',
          yAxisID: 'y1',
        },
        {
          label: 'Total Equity',
          data: consolidatedData.map(item => (item.equity || 0) + (item.retained_earnings || 0)),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          type: 'line',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createProfitabilityRatiosChart = (consolidatedData: any[]): ChartData => {
    const labels = consolidatedData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'Gross Profit %',
          data: consolidatedData.map(item => ((item.gross_profit || 0) / (item.revenue || 1)) * 100),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'EBITDA %',
          data: consolidatedData.map(item => ((item.ebitda || 0) / (item.revenue || 1)) * 100),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
        },
        {
          label: 'Net Income %',
          data: consolidatedData.map(item => ((item.net_income || 0) / (item.revenue || 1)) * 100),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }
      ]
    };
  };

  const createArInventoryCycleChart = (consolidatedData: any[]): ChartData => {
    const labels = consolidatedData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'AR Cycle Days',
          data: consolidatedData.map(item => (item.accounts_receivable || 0) / (item.revenue || 1) * 365),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          type: 'line',
          yAxisID: 'y',
        },
        {
          label: 'Inventory Cycle Days',
          data: consolidatedData.map(item => (item.inventory || 0) / Math.abs(item.cost_of_goods_sold || 1) * 365),
          borderColor: 'rgb(255, 159, 64)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          type: 'line',
          yAxisID: 'y',
        },
        {
          label: 'Revenue',
          data: consolidatedData.map(item => item.revenue || 0),
          backgroundColor: 'rgb(75, 192, 192)',
          type: 'bar',
          yAxisID: 'y1',
        },
        {
          label: 'COGS',
          data: consolidatedData.map(item => Math.abs(item.cost_of_goods_sold || 0)),
          backgroundColor: 'rgb(255, 99, 132)',
          type: 'bar',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const createKeyRatiosOverviewChart = (kpiData: any[]): ChartData => {
    const labels = kpiData.map(item => `${item.year}-${item.month || item.quarter || ''}`);
    return {
      labels,
      datasets: [
        {
          label: 'DSCR',
          data: kpiData.map(item => item.debt_service_coverage_ratio || 0),
          backgroundColor: 'rgb(255, 159, 64)',
          type: 'bar',
          yAxisID: 'y',
        },
        {
          label: 'Debt to EBITDA',
          data: kpiData.map(item => item.debt_to_ebitda || 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          type: 'line',
          yAxisID: 'y1',
        },
        {
          label: 'Debt to Equity',
          data: kpiData.map(item => item.debt_to_equity_ratio || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          type: 'line',
          yAxisID: 'y1',
        }
      ]
    };
  };

  const handleExportChart = (chartType: string) => {
    // Implementation for chart export
    console.log(`Exporting ${chartType} chart`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Charts & Analytics</h1>
        <p className="text-gray-600">9 specific charts matching your Streamlit application with exact KPI calculations</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4 items-center">
        <div className="flex gap-4">
          <div className="text-sm text-gray-600">
            <strong>Current Project:</strong> {selectedProject?.name || 'No project selected'}
          </div>

          <Select value={selectedPeriod} onValueChange={(value: DataPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Data Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRun} onValueChange={setSelectedRun}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Calculation Run" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest Run</SelectItem>
              <SelectItem value="run1">Previous Run</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={loadChartData}
          disabled={loading || !selectedProject?.id}
        >
          {loading ? 'Loading...' : 'Refresh Charts'}
        </Button>

        <Button variant="outline" onClick={() => handleExportChart('all')}>
          Export All Charts
        </Button>
      </div>

      {/* Charts */}
      <Tabs defaultValue="debt-analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="debt-analysis">Debt Analysis</TabsTrigger>
          <TabsTrigger value="financial-performance">Financial Performance</TabsTrigger>
          <TabsTrigger value="profitability">Profitability & Working Capital</TabsTrigger>
        </TabsList>

        {/* Debt Analysis Charts */}
        <TabsContent value="debt-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Debt to EBITDA & DSCR</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.debtToEbitdaDscr && (
                  <DualAxisChart 
                    data={chartData.debtToEbitdaDscr} 
                    title="Debt to EBITDA & DSCR"
                    leftYAxisLabel="Debt to EBITDA"
                    rightYAxisLabel="DSCR"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LTV and Interest Coverage Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.ltvInterestCoverage && (
                  <DualAxisChart 
                    data={chartData.ltvInterestCoverage} 
                    title="LTV and Interest Coverage Ratio"
                    leftYAxisLabel="Interest Coverage"
                    rightYAxisLabel="LTV Ratio"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Debt to Equity Ratio & Operating Margin</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.debtToEquityOperatingMargin && (
                  <DualAxisChart 
                    data={chartData.debtToEquityOperatingMargin} 
                    title="Debt to Equity Ratio & Operating Margin"
                    leftYAxisLabel="Operating Margin (%)"
                    rightYAxisLabel="Debt to Equity"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Performance Charts */}
        <TabsContent value="financial-performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue and EBITDA</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.revenueEbitda && (
                  <BarChart 
                    data={chartData.revenueEbitda} 
                    title="Revenue and EBITDA"
                    yAxisLabel="Amount ($)"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outstanding Debt Balance and Interest Paid</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.outstandingDebtInterest && (
                  <CombinedChart 
                    data={chartData.outstandingDebtInterest} 
                    title="Outstanding Debt Balance and Interest Paid"
                    leftYAxisLabel="Debt Balance ($)"
                    rightYAxisLabel="Interest Paid ($)"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash, PPE and Total Equity Balance</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.cashPpeEquity && (
                  <CombinedChart 
                    data={chartData.cashPpeEquity} 
                    title="Cash, PPE and Total Equity Balance"
                    leftYAxisLabel="Cash ($)"
                    rightYAxisLabel="PPE & Equity ($)"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profitability & Working Capital Charts */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profitability Ratios as % of Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.profitabilityRatios && (
                  <KpiChart 
                    data={chartData.profitabilityRatios} 
                    title="Profitability Ratios as % of Revenue"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AR and Inventory Cycle Days</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.arInventoryCycle && (
                  <CombinedChart 
                    data={chartData.arInventoryCycle} 
                    title="AR and Inventory Cycle Days"
                    leftYAxisLabel="Cycle Days"
                    rightYAxisLabel="Amount ($)"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Ratios Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.keyRatiosOverview && (
                  <CombinedChart 
                    data={chartData.keyRatiosOverview} 
                    title="Key Ratios Overview"
                    leftYAxisLabel="DSCR"
                    rightYAxisLabel="Debt Ratios"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Charts; 