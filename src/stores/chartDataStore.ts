import { create } from 'zustand';
import { ChartData } from '@/types/charts';
import { chartDataService } from '@/services/api/ChartDataService';

interface ChartDataState {
  // Chart data for all 9 specific charts
  chartData: {
    debtToEbitdaDscr: ChartData | null;
    ltvInterestCoverage: ChartData | null;
    debtEquityOperatingMargin: ChartData | null;
    revenueEbitda: ChartData | null;
    debtBalanceInterest: ChartData | null;
    cashPpeEquity: ChartData | null;
    profitabilityRatios: ChartData | null;
    arInventoryCycle: ChartData | null;
    keyRatiosOverview: ChartData | null;
  };
  
  // UI states
  isLoading: boolean;
  isExporting: boolean;
  lastUpdated: string | null;
  
  // Chart configurations
  chartConfigs: Record<string, any>;
  
  // Actions
  loadAllCharts: (projectId: string) => Promise<void>;
  loadSpecificChart: (chartType: string, projectId: string) => Promise<void>;
  exportChart: (chartId: string, format: string) => Promise<string>;
  exportAllCharts: (projectId: string, format: string) => Promise<string>;
  updateChartConfig: (chartId: string, config: any) => void;
  refreshCharts: (projectId: string) => Promise<void>;
  clearChartData: () => void;
}

export const useChartDataStore = create<ChartDataState>((set, get) => ({
  // Initial state
  chartData: {
    debtToEbitdaDscr: null,
    ltvInterestCoverage: null,
    debtEquityOperatingMargin: null,
    revenueEbitda: null,
    debtBalanceInterest: null,
    cashPpeEquity: null,
    profitabilityRatios: null,
    arInventoryCycle: null,
    keyRatiosOverview: null,
  },
  isLoading: false,
  isExporting: false,
  lastUpdated: null,
  chartConfigs: {},

  // Actions
  loadAllCharts: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const data = await chartDataService.getAllSpecificChartsData(projectId);
      set({
        chartData: data,
        isLoading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadSpecificChart: async (chartType: string, projectId: string) => {
    try {
      const data = await chartDataService.getChartData(chartType, {
        projectId,
        dateRange: {
          start: '2024-01-01',
          end: '2033-12-31',
          period: 'annually',
        },
        metrics: [],
        scenarios: [],
      });
      
      set((state) => ({
        chartData: {
          ...state.chartData,
          [chartType]: data,
        },
        lastUpdated: new Date().toISOString(),
      }));
    } catch (error) {
      console.error(`Failed to load ${chartType} chart:`, error);
      throw error;
    }
  },

  exportChart: async (chartId: string, format: string) => {
    set({ isExporting: true });
    try {
      const result = await chartDataService.exportChart(chartId, {
        format: format as any,
        filename: `${chartId}_${Date.now()}`,
        quality: 150,
        width: 1200,
        height: 500,
        includeData: true,
      });
      set({ isExporting: false });
      return result.url!;
    } catch (error) {
      set({ isExporting: false });
      throw error;
    }
  },

  exportAllCharts: async (projectId: string, format: string) => {
    set({ isExporting: true });
    try {
      const result = await chartDataService.exportAllCharts(projectId, format as any);
      set({ isExporting: false });
      return result.url!;
    } catch (error) {
      set({ isExporting: false });
      throw error;
    }
  },

  updateChartConfig: (chartId: string, config: any) => {
    set((state) => ({
      chartConfigs: {
        ...state.chartConfigs,
        [chartId]: config,
      },
    }));
  },

  refreshCharts: async (projectId: string) => {
    await get().loadAllCharts(projectId);
  },

  clearChartData: () => {
    set({
      chartData: {
        debtToEbitdaDscr: null,
        ltvInterestCoverage: null,
        debtEquityOperatingMargin: null,
        revenueEbitda: null,
        debtBalanceInterest: null,
        cashPpeEquity: null,
        profitabilityRatios: null,
        arInventoryCycle: null,
        keyRatiosOverview: null,
      },
      lastUpdated: null,
    });
  },
}));