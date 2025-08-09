import { configService } from '../config/ConfigService';
import {
  DebtCalculationDetails,
  DebtCalculationFormData,
  DebtCalculationUpdateRequest,
  DebtCalculationApiResponse,
  CalculationRunDetails,
  DebtCalculationValidationResult
} from '../../types/debtCalculation';

class DebtCalculationApiService {
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
    const url = `${this.baseURL}${endpoint}`;
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
      console.error('Debt calculation API error:', error);
      throw error;
    }
  }

  /**
   * Validate calculation data before performing calculation
   */
  async validateCalculationData(projectId: string): Promise<DebtCalculationValidationResult> {
    try {
      const response = await this.makeRequest<DebtCalculationApiResponse>(
        `/debt-calculation/${projectId}/validate`,
        { method: 'GET' }
      );

      if (response && response.success) {
        return {
          isValid: true,
          debtStructureData: response.data?.debtStructureData,
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
   * Perform debt calculation
   */
  async performDebtCalculation(
    projectId: string, 
    changeReason?: string
  ): Promise<{
    success: boolean;
    calculationRun: CalculationRunDetails;
    results: DebtCalculationDetails[];
    summary: any;
  }> {
    const requestData: DebtCalculationUpdateRequest = {
      change_reason: changeReason || 'Debt calculation performed'
    };

    const response = await this.makeRequest<DebtCalculationApiResponse>(
      `/debt-calculation/${projectId}/calculate`,
      {
        method: 'POST',
        body: JSON.stringify(requestData)
      }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Calculation failed';
      throw new Error(errorMessage);
    }

    return response.data;
  }

  /**
   * Get debt calculations for a project
   */
  async getDebtCalculations(projectId: string): Promise<DebtCalculationDetails[]> {
    const response = await this.makeRequest<DebtCalculationApiResponse>(
      `/debt-calculation/${projectId}/calculations`,
      { method: 'GET' }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to get debt calculations';
      throw new Error(errorMessage);
    }

    return response.data as DebtCalculationDetails[];
  }

  /**
   * Get calculation history for a project
   */
  async getCalculationHistory(projectId: string): Promise<CalculationRunDetails[]> {
    const response = await this.makeRequest<DebtCalculationApiResponse>(
      `/debt-calculation/${projectId}/history`,
      { method: 'GET' }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to get calculation history';
      throw new Error(errorMessage);
    }

    return response.data as CalculationRunDetails[];
  }

  /**
   * Restore calculation from a specific run
   */
  async restoreCalculationRun(runId: string, projectId: string): Promise<DebtCalculationDetails[]> {
    const response = await this.makeRequest<DebtCalculationApiResponse>(
      `/debt-calculation/${runId}/restore`,
      { 
        method: 'POST',
        body: JSON.stringify({ projectId })
      }
    );

    if (!response || !response.success) {
      const errorMessage = response?.message || response?.error || 'Failed to restore calculation';
      throw new Error(errorMessage);
    }

    return response.data as DebtCalculationDetails[];
  }

  /**
   * Export debt calculations to Excel
   */
  async exportToExcel(projectId: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/debt-calculation/${projectId}/export`, {
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
  getEmptyFormData(): DebtCalculationFormData {
    return {}; // No form data needed for calculations
  }
}

export const debtCalculationApiService = new DebtCalculationApiService(); 