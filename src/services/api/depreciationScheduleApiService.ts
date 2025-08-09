import { configService } from '../config/ConfigService';
import {
  DepreciationScheduleDetails,
  DepreciationScheduleSummary,
  DepreciationScheduleValidationResult,
  DepreciationScheduleApiResponse,
  DepreciationScheduleUpdateRequest,
  DepreciationScheduleFormData
} from '../../types/depreciationSchedule';

class DepreciationScheduleApiService {
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
    const url = `${this.baseURL}/depreciation-schedule${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
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
      console.error('Depreciation schedule API error:', error);
      throw error;
    }
  }

  /**
   * Validate calculation data before performing calculation
   */
  async validateCalculationData(projectId: string): Promise<DepreciationScheduleValidationResult> {
    try {
      const response = await this.makeRequest<DepreciationScheduleApiResponse>(
        `/${projectId}/validate`,
        { method: 'GET' }
      );

      if (response && response.success) {
        return {
          isValid: true,
          balanceSheetData: response.data?.balanceSheetData
        };
      } else {
        return {
          isValid: false,
          missingFields: response?.message || 'Validation failed'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        missingFields: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  /**
   * Perform depreciation calculation
   */
  async performDepreciationCalculation(
    projectId: string, 
    changeReason?: string
  ): Promise<{
    success: boolean;
    calculationRun: any;
    results: DepreciationScheduleDetails[];
    summary: any;
  }> {
    const requestData: DepreciationScheduleUpdateRequest = {
      change_reason: changeReason || 'Depreciation calculation performed'
    };

    const response = await this.makeRequest<DepreciationScheduleApiResponse>(
      `/${projectId}/calculate`,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Calculation failed';
      throw new Error(errorMessage);
    }

    return response.data as any;
  }

  /**
   * Get depreciation schedule for a project
   */
  async getDepreciationSchedule(projectId: string): Promise<DepreciationScheduleDetails[]> {
    const response = await this.makeRequest<DepreciationScheduleApiResponse>(
      `/${projectId}/schedule`,
      { method: 'GET' }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to get depreciation schedule';
      throw new Error(errorMessage);
    }

    return response.data as DepreciationScheduleDetails[];
  }

  /**
   * Get calculation history for a project
   */
  async getCalculationHistory(projectId: string): Promise<any[]> {
    const response = await this.makeRequest<DepreciationScheduleApiResponse>(
      `/${projectId}/history`,
      { method: 'GET' }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to get calculation history';
      throw new Error(errorMessage);
    }

    return response.data as any[];
  }

  /**
   * Restore calculation from a specific run
   */
  async restoreCalculationRun(runId: string, projectId: string): Promise<DepreciationScheduleDetails[]> {
    const response = await this.makeRequest<DepreciationScheduleApiResponse>(
      `/${runId}/restore`,
      { 
        method: 'POST',
        body: JSON.stringify({ projectId })
      }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to restore calculation';
      throw new Error(errorMessage);
    }

    return response.data as DepreciationScheduleDetails[];
  }

  /**
   * Export depreciation schedule to Excel
   */
  async exportToExcel(projectId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/depreciation-schedule/${projectId}/export`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  /**
   * Get empty form data (not applicable for calculations)
   */
  getEmptyFormData(): DepreciationScheduleFormData {
    return {}; // No form data needed for calculations
  }
}

export const depreciationScheduleApiService = new DepreciationScheduleApiService(); 