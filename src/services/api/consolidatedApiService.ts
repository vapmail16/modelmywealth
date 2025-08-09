import { configService } from '../config/ConfigService';
import {
    MonthlyConsolidatedData,
    QuarterlyConsolidatedData,
    YearlyConsolidatedData,
    ConsolidatedValidationResult,
    ConsolidatedCalculationResult,
    ConsolidatedDataResponse,
    ConsolidatedHistoryResponse,
    ConsolidatedFormData,
    CalculationRun
} from '../../types/consolidated';

class ConsolidatedApiService {
    private baseURL: string;

    constructor() {
        this.baseURL = configService.get('api').baseURL;
    }

        private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If JSON parsing fails, create a basic error object
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        
        const errorMessage = errorData?.message || errorData?.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Consolidated API error:', error);
      throw error;
    }
  }

    // Monthly Consolidated Methods
    async validateMonthlyData(projectId: string): Promise<ConsolidatedValidationResult> {
        return this.makeRequest<ConsolidatedValidationResult>(
            `/consolidated/${projectId}/monthly/validate`
        );
    }

    async performMonthlyCalculation(projectId: string): Promise<ConsolidatedCalculationResult> {
        return this.makeRequest<ConsolidatedCalculationResult>(
            `/consolidated/${projectId}/monthly/calculate`,
            { method: 'POST' }
        );
    }

    async getMonthlyConsolidated(projectId: string, calculationRunId?: string): Promise<ConsolidatedDataResponse> {
        const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
        return this.makeRequest<ConsolidatedDataResponse>(
            `/consolidated/${projectId}/monthly/data${params}`
        );
    }

    async getMonthlyCalculationHistory(projectId: string): Promise<ConsolidatedHistoryResponse> {
        return this.makeRequest<ConsolidatedHistoryResponse>(
            `/consolidated/${projectId}/monthly/history`
        );
    }

    // Quarterly Consolidated Methods
    async validateQuarterlyData(projectId: string): Promise<ConsolidatedValidationResult> {
        return this.makeRequest<ConsolidatedValidationResult>(
            `/consolidated/${projectId}/quarterly/validate`
        );
    }

    async performQuarterlyCalculation(projectId: string): Promise<ConsolidatedCalculationResult> {
        return this.makeRequest<ConsolidatedCalculationResult>(
            `/consolidated/${projectId}/quarterly/calculate`,
            { method: 'POST' }
        );
    }

    async getQuarterlyConsolidated(projectId: string, calculationRunId?: string): Promise<ConsolidatedDataResponse> {
        const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
        return this.makeRequest<ConsolidatedDataResponse>(
            `/consolidated/${projectId}/quarterly/data${params}`
        );
    }

    async getQuarterlyCalculationHistory(projectId: string): Promise<ConsolidatedHistoryResponse> {
        return this.makeRequest<ConsolidatedHistoryResponse>(
            `/consolidated/${projectId}/quarterly/history`
        );
    }

    // Yearly Consolidated Methods
    async validateYearlyData(projectId: string): Promise<ConsolidatedValidationResult> {
        return this.makeRequest<ConsolidatedValidationResult>(
            `/consolidated/${projectId}/yearly/validate`
        );
    }

    async performYearlyCalculation(projectId: string): Promise<ConsolidatedCalculationResult> {
        return this.makeRequest<ConsolidatedCalculationResult>(
            `/consolidated/${projectId}/yearly/calculate`,
            { method: 'POST' }
        );
    }

    async getYearlyConsolidated(projectId: string, calculationRunId?: string): Promise<ConsolidatedDataResponse> {
        const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
        return this.makeRequest<ConsolidatedDataResponse>(
            `/consolidated/${projectId}/yearly/data${params}`
        );
    }

    async getYearlyCalculationHistory(projectId: string): Promise<ConsolidatedHistoryResponse> {
        return this.makeRequest<ConsolidatedHistoryResponse>(
            `/consolidated/${projectId}/yearly/history`
        );
    }

    // Generic Methods
    async restoreCalculationRun(projectId: string, runId: string, type: string): Promise<{ success: boolean; calculationRun?: CalculationRun; error?: string }> {
        return this.makeRequest<{ success: boolean; calculationRun?: CalculationRun; error?: string }>(
            `/consolidated/${projectId}/${runId}/restore?type=${type}`
        );
    }

    // Export Methods
    async exportToExcel(projectId: string, type: 'monthly' | 'quarterly' | 'yearly', calculationRunId?: string): Promise<Blob> {
        const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
        const response = await fetch(`${this.baseURL}/consolidated/${projectId}/${type}/export${params}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Export failed');
        }

        return response.blob();
    }

    // Utility Methods
    getEmptyFormData(): ConsolidatedFormData {
        return {
            projectId: '',
            calculationRunId: undefined
        };
    }

    // Data Processing Methods
    processMonthlyData(data: MonthlyConsolidatedData[]) {
        return data.map(item => ({
            ...item,
            period: `${item.month_name} ${item.year}`,
            formattedRevenue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.revenue),
            formattedEbitda: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.ebitda),
            formattedNetIncome: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_income),
            formattedTotalAssets: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total_assets),
            formattedNetCashFlow: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_cash_flow)
        }));
    }

    processQuarterlyData(data: QuarterlyConsolidatedData[]) {
        return data.map(item => ({
            ...item,
            period: `${item.quarter_name} ${item.year}`,
            formattedRevenue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.revenue),
            formattedEbitda: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.ebitda),
            formattedNetIncome: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_income),
            formattedTotalAssets: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total_assets),
            formattedNetCashFlow: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_cash_flow)
        }));
    }

    processYearlyData(data: YearlyConsolidatedData[]) {
        return data.map(item => ({
            ...item,
            period: `Year ${item.year}`,
            formattedRevenue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.revenue),
            formattedEbitda: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.ebitda),
            formattedNetIncome: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_income),
            formattedTotalAssets: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.total_assets),
            formattedNetCashFlow: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.net_cash_flow)
        }));
    }
}

export const consolidatedApiService = new ConsolidatedApiService(); 