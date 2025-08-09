import { configService } from '../config/ConfigService';
import {
  KpiValidationResponse,
  KpiCalculationResponse,
  KpiDataResponse,
  KpiHistoryResponse,
  KpiRestoreResponse,
  MonthlyKpi,
  QuarterlyKpi,
  YearlyKpi
} from '../../types/kpi';

class KpiApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If error response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Validation
  async validateData(projectId: string): Promise<KpiValidationResponse> {
    return this.makeRequest<KpiValidationResponse>(`/kpi/${projectId}/validate`);
  }

  // Calculation
  async performCalculation(projectId: string): Promise<KpiCalculationResponse> {
    return this.makeRequest<KpiCalculationResponse>(`/kpi/${projectId}/calculate`, {
      method: 'POST',
    });
  }

  // Data retrieval
  async getMonthlyKpis(projectId: string, calculationRunId?: string): Promise<KpiDataResponse> {
    const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
    return this.makeRequest<KpiDataResponse>(`/kpi/${projectId}/monthly${params}`);
  }

  async getQuarterlyKpis(projectId: string, calculationRunId?: string): Promise<KpiDataResponse> {
    const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
    return this.makeRequest<KpiDataResponse>(`/kpi/${projectId}/quarterly${params}`);
  }

  async getYearlyKpis(projectId: string, calculationRunId?: string): Promise<KpiDataResponse> {
    const params = calculationRunId ? `?calculationRunId=${calculationRunId}` : '';
    return this.makeRequest<KpiDataResponse>(`/kpi/${projectId}/yearly${params}`);
  }

  // History
  async getMonthlyKpiCalculationHistory(projectId: string): Promise<KpiHistoryResponse> {
    return this.makeRequest<KpiHistoryResponse>(`/kpi/${projectId}/history/monthly`);
  }

  async getQuarterlyKpiCalculationHistory(projectId: string): Promise<KpiHistoryResponse> {
    return this.makeRequest<KpiHistoryResponse>(`/kpi/${projectId}/history/quarterly`);
  }

  async getYearlyKpiCalculationHistory(projectId: string): Promise<KpiHistoryResponse> {
    return this.makeRequest<KpiHistoryResponse>(`/kpi/${projectId}/history/yearly`);
  }

  // Restore calculation run
  async restoreCalculationRun(projectId: string, runId: string): Promise<KpiRestoreResponse> {
    return this.makeRequest<KpiRestoreResponse>(`/kpi/${projectId}/${runId}/restore`);
  }

  // Export functionality
  async exportToExcel(projectId: string, data: MonthlyKpi[] | QuarterlyKpi[] | YearlyKpi[], type: 'monthly' | 'quarterly' | 'yearly'): Promise<void> {
    const XLSX = await import('xlsx');
    
    // Transform data for export
    const exportData = data.map(item => {
      const base = {
        'Debt to EBITDA': item.debt_to_ebitda,
        'Debt Service Coverage Ratio': item.debt_service_coverage_ratio,
        'Loan to Value Ratio': item.loan_to_value_ratio,
        'Interest Coverage Ratio': item.interest_coverage_ratio,
        'Current Ratio': item.current_ratio,
        'Quick Ratio': item.quick_ratio,
        'Debt to Equity Ratio': item.debt_to_equity_ratio,
        'Operating Margin': item.operating_margin,
        'FCFF': item.fcff,
        'FCFE': item.fcfe,
        'AR Cycle Days': item.ar_cycle_days,
        'Inventory Cycle Days': item.inventory_cycle_days,
      };

      if ('month' in item) {
        return {
          'Month': item.month,
          'Year': item.year,
          'Month Name': item.month_name,
          ...base
        };
      } else if ('quarter' in item) {
        return {
          'Quarter': item.quarter,
          'Year': item.year,
          'Quarter Name': item.quarter_name,
          ...base
        };
      } else {
        return {
          'Year': item.year,
          ...base
        };
      }
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${type.charAt(0).toUpperCase() + type.slice(1)} KPIs`);
    
    const fileName = `${type}_kpis_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }
}

export const kpiApiService = new KpiApiService(); 