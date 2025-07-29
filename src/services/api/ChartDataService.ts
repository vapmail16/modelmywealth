import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import { 
  ChartConfig, 
  ChartData, 
  ChartExportConfig, 
  ChartExportResult,
  DashboardConfig,
  ChartUpdateEvent 
} from '@/types/charts';

export interface ChartFilters {
  dateRange: {
    start: string;
    end: string;
    period: 'monthly' | 'quarterly' | 'annually';
  };
  metrics: string[];
  scenarios: string[];
  projectId: string;
}

export interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  chartType: string;
  configuration: ChartConfig;
  category: 'debt' | 'profitability' | 'cashflow' | 'custom';
  isPublic: boolean;
}

class ChartDataService {
  private baseUrl = '/charts';
  private subscribers: Map<string, ((event: ChartUpdateEvent) => void)[]> = new Map();

  /**
   * Get chart data for specific chart types
   */
  async getChartData(chartType: string, filters: ChartFilters): Promise<ChartData> {
    const response = await httpClient.post<ChartData>(
      `${this.baseUrl}/data`,
      { chartType, filters }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get chart data');
    }
    
    return response.data!;
  }

  /**
   * Get data for all 9 specific charts
   */
  async getAllSpecificChartsData(projectId: string): Promise<{
    debtToEbitdaDscr: ChartData;
    ltvInterestCoverage: ChartData;
    debtEquityOperatingMargin: ChartData;
    revenueEbitda: ChartData;
    debtBalanceInterest: ChartData;
    cashPpeEquity: ChartData;
    profitabilityRatios: ChartData;
    arInventoryCycle: ChartData;
    keyRatiosOverview: ChartData;
  }> {
    const response = await httpClient.get<{
      debtToEbitdaDscr: ChartData;
      ltvInterestCoverage: ChartData;
      debtEquityOperatingMargin: ChartData;
      revenueEbitda: ChartData;
      debtBalanceInterest: ChartData;
      cashPpeEquity: ChartData;
      profitabilityRatios: ChartData;
      arInventoryCycle: ChartData;
      keyRatiosOverview: ChartData;
    }>(`${this.baseUrl}/specific/${projectId}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get specific charts data');
    }
    
    return response.data!;
  }

  /**
   * Export chart to various formats
   */
  async exportChart(chartId: string, config: ChartExportConfig): Promise<ChartExportResult> {
    const response = await httpClient.post<ChartExportResult>(
      `${this.baseUrl}/export/${chartId}`,
      config,
      { timeout: 30000 } // Longer timeout for export
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export chart');
    }
    
    return response.data!;
  }

  /**
   * Export all charts as a package
   */
  async exportAllCharts(
    projectId: string, 
    format: 'pdf' | 'png' | 'zip'
  ): Promise<ChartExportResult> {
    const response = await httpClient.post<ChartExportResult>(
      `${this.baseUrl}/export-all/${projectId}`,
      { format },
      { timeout: 60000 }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export all charts');
    }
    
    return response.data!;
  }

  /**
   * Get available chart templates
   */
  async getChartTemplates(): Promise<ChartTemplate[]> {
    const response = await httpClient.get<ChartTemplate[]>(
      `${this.baseUrl}/templates`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get chart templates');
    }
    
    return response.data!;
  }

  /**
   * Save chart configuration as template
   */
  async saveChartTemplate(
    name: string,
    description: string,
    config: ChartConfig
  ): Promise<ChartTemplate> {
    const response = await httpClient.post<ChartTemplate>(
      `${this.baseUrl}/templates`,
      { name, description, config }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save chart template');
    }
    
    return response.data!;
  }

  /**
   * Update chart configuration
   */
  async updateChartConfig(chartId: string, config: Partial<ChartConfig>): Promise<ChartConfig> {
    const response = await httpClient.patch<ChartConfig>(
      `${this.baseUrl}/config/${chartId}`,
      config
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update chart config');
    }
    
    return response.data!;
  }

  /**
   * Get dashboard configuration
   */
  async getDashboardConfig(dashboardId: string): Promise<DashboardConfig> {
    const response = await httpClient.get<DashboardConfig>(
      `${this.baseUrl}/dashboard/${dashboardId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get dashboard config');
    }
    
    return response.data!;
  }

  /**
   * Save dashboard configuration
   */
  async saveDashboardConfig(config: DashboardConfig): Promise<DashboardConfig> {
    const response = await httpClient.post<DashboardConfig>(
      `${this.baseUrl}/dashboard`,
      config
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save dashboard config');
    }
    
    return response.data!;
  }

  /**
   * Subscribe to real-time chart updates
   */
  subscribeToChartUpdates(
    chartId: string, 
    callback: (event: ChartUpdateEvent) => void
  ): () => void {
    if (!this.subscribers.has(chartId)) {
      this.subscribers.set(chartId, []);
    }
    
    this.subscribers.get(chartId)!.push(callback);
    
    // In a real implementation, this would use WebSockets
    const interval = setInterval(async () => {
      try {
        // Simulate real-time updates
        const updateEvent: ChartUpdateEvent = {
          chartId,
          type: 'data',
          data: { timestamp: Date.now() },
          timestamp: new Date().toISOString()
        };
        callback(updateEvent);
      } catch (error) {
        console.error('Failed to get chart updates:', error);
      }
    }, 30000); // Update every 30 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(interval);
      const callbacks = this.subscribers.get(chartId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get chart performance analytics
   */
  async getChartAnalytics(chartId: string, days: number = 30): Promise<{
    views: number;
    exports: number;
    averageLoadTime: number;
    errorRate: number;
    popularTimeframes: string[];
  }> {
    const response = await httpClient.get<{
      views: number;
      exports: number;
      averageLoadTime: number;
      errorRate: number;
      popularTimeframes: string[];
    }>(`${this.baseUrl}/analytics/${chartId}?days=${days}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get chart analytics');
    }
    
    return response.data!;
  }

  /**
   * Validate chart configuration
   */
  async validateChartConfig(config: ChartConfig): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await httpClient.post<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>(`${this.baseUrl}/validate`, config);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate chart config');
    }
    
    return response.data!;
  }

  /**
   * Get chart data cache status
   */
  async getCacheStatus(chartId: string): Promise<{
    isCached: boolean;
    lastUpdated: string;
    expiresAt: string;
    size: number;
  }> {
    const response = await httpClient.get<{
      isCached: boolean;
      lastUpdated: string;
      expiresAt: string;
      size: number;
    }>(`${this.baseUrl}/cache/${chartId}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get cache status');
    }
    
    return response.data!;
  }

  /**
   * Clear chart data cache
   */
  async clearCache(chartId?: string): Promise<void> {
    const url = chartId ? `${this.baseUrl}/cache/${chartId}` : `${this.baseUrl}/cache`;
    const response = await httpClient.delete(url);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to clear cache');
    }
  }
}

// Create and export the service instance
export const chartDataService = new ChartDataService();

// Export the class for testing or custom instances
export { ChartDataService };