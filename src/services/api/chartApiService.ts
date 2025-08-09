import { ConfigService } from '../config/ConfigService';

const configService = new ConfigService();
const baseURL = configService.get('api').baseURL;

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

class ChartApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('access_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getRevenueData(projectId: string, runId?: string) {
    return this.makeRequest(`/consolidated/${projectId}/monthly/data${runId ? `?runId=${runId}` : ''}`);
  }

  async getEbitdaData(projectId: string, runId?: string) {
    return this.makeRequest(`/consolidated/${projectId}/monthly/data${runId ? `?runId=${runId}` : ''}`);
  }

  async getDebtData(projectId: string, runId?: string) {
    return this.makeRequest(`/debt-calculation/${projectId}/calculations${runId ? `?runId=${runId}` : ''}`);
  }

  async getKpiData(projectId: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly', runId?: string) {
    return this.makeRequest(`/kpi/${projectId}/${period}${runId ? `?runId=${runId}` : ''}`);
  }

  async getConsolidatedData(projectId: string, period: 'monthly' | 'quarterly' | 'yearly', runId?: string) {
    return this.makeRequest(`/consolidated/${projectId}/${period}/data${runId ? `?runId=${runId}` : ''}`);
  }

  async getYearlyConsolidatedData(projectId: string, runId?: string) {
    return this.makeRequest(`/consolidated/${projectId}/yearly/data${runId ? `?runId=${runId}` : ''}`);
  }

  async getYearlyKpiData(projectId: string, runId?: string) {
    return this.makeRequest(`/kpi/${projectId}/yearly${runId ? `?runId=${runId}` : ''}`);
  }
}

export const chartApiService = new ChartApiService(); 