import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import { 
  FinancialData, 
  ProfitLossData, 
  BalanceSheetData, 
  DebtStructureData,
  GrowthAssumptionsData,
  ValidationError
} from '@/types/financial';

export interface DataTemplate {
  id: string;
  name: string;
  description: string;
  category: 'industry' | 'size' | 'custom';
  data: Partial<FinancialData>;
  isPublic: boolean;
}

export interface SaveResponse {
  id: string;
  version: number;
  savedAt: string;
}

export interface AutoSaveResponse {
  id: string;
  savedAt: string;
  status: 'success' | 'pending' | 'failed';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completeness: number;
}

class FinancialDataService {
  private baseUrl = '/financial-data';

  /**
   * Save complete financial data
   */
  async saveFinancialData(data: FinancialData): Promise<SaveResponse> {
    const response = await httpClient.post<SaveResponse>(
      `${this.baseUrl}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save financial data');
    }
    
    return response.data!;
  }

  /**
   * Load financial data by project ID
   */
  async loadFinancialData(projectId: string): Promise<FinancialData> {
    const response = await httpClient.get<FinancialData>(
      `${this.baseUrl}/${projectId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to load financial data');
    }
    
    return response.data!;
  }

  /**
   * Save individual sections for partial updates
   */
  async saveProfitLossData(projectId: string, data: ProfitLossData): Promise<SaveResponse> {
    const response = await httpClient.patch<SaveResponse>(
      `${this.baseUrl}/${projectId}/profit-loss`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save P&L data');
    }
    
    return response.data!;
  }

  async saveBalanceSheetData(projectId: string, data: BalanceSheetData): Promise<SaveResponse> {
    const response = await httpClient.patch<SaveResponse>(
      `${this.baseUrl}/${projectId}/balance-sheet`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save balance sheet data');
    }
    
    return response.data!;
  }

  async saveDebtStructureData(projectId: string, data: DebtStructureData): Promise<SaveResponse> {
    const response = await httpClient.patch<SaveResponse>(
      `${this.baseUrl}/${projectId}/debt-structure`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save debt structure data');
    }
    
    return response.data!;
  }

  async saveGrowthAssumptions(projectId: string, data: GrowthAssumptionsData): Promise<SaveResponse> {
    const response = await httpClient.patch<SaveResponse>(
      `${this.baseUrl}/${projectId}/growth-assumptions`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save growth assumptions');
    }
    
    return response.data!;
  }

  /**
   * Auto-save functionality for real-time saving
   */
  async autoSaveData(projectId: string, data: Partial<FinancialData>): Promise<AutoSaveResponse> {
    const response = await httpClient.post<AutoSaveResponse>(
      `${this.baseUrl}/${projectId}/auto-save`,
      data,
      { timeout: 5000 } // Shorter timeout for auto-save
    );
    
    if (!response.success) {
      // Don't throw error for auto-save failures, just log
      console.warn('Auto-save failed:', response.error?.message);
      return {
        id: projectId,
        savedAt: new Date().toISOString(),
        status: 'failed'
      };
    }
    
    return response.data!;
  }

  /**
   * Validate financial data
   */
  async validateInputs(data: Partial<FinancialData>): Promise<ValidationResult> {
    const response = await httpClient.post<ValidationResult>(
      `${this.baseUrl}/validate`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate data');
    }
    
    return response.data!;
  }

  /**
   * Get available data templates
   */
  async getDataTemplates(): Promise<DataTemplate[]> {
    const response = await httpClient.get<DataTemplate[]>(
      `${this.baseUrl}/templates`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to load templates');
    }
    
    return response.data!;
  }

  /**
   * Save current data as a new template
   */
  async saveAsTemplate(data: FinancialData, name: string, description?: string): Promise<DataTemplate> {
    const template = {
      name,
      description: description || '',
      category: 'custom' as const,
      data,
      isPublic: false
    };

    const response = await httpClient.post<DataTemplate>(
      `${this.baseUrl}/templates`,
      template
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save template');
    }
    
    return response.data!;
  }

  /**
   * Import data from CSV/Excel file
   */
  async importFromFile(file: File, mapping: Record<string, string>): Promise<Partial<FinancialData>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mapping', JSON.stringify(mapping));

    const response = await httpClient.post<Partial<FinancialData>>(
      `${this.baseUrl}/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000 // Longer timeout for file upload
      }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to import file');
    }
    
    return response.data!;
  }

  /**
   * Export data to various formats
   */
  async exportData(projectId: string, format: 'csv' | 'xlsx' | 'json'): Promise<{ url: string; filename: string }> {
    const response = await httpClient.post<{ url: string; filename: string }>(
      `${this.baseUrl}/${projectId}/export`,
      { format }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export data');
    }
    
    return response.data!;
  }

  /**
   * Get project history and versions
   */
  async getProjectHistory(projectId: string): Promise<Array<{
    version: number;
    savedAt: string;
    changes: string[];
    savedBy: string;
  }>> {
    const response = await httpClient.get<Array<{
      version: number;
      savedAt: string;
      changes: string[];
      savedBy: string;
    }>>(
      `${this.baseUrl}/${projectId}/history`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to load project history');
    }
    
    return response.data!;
  }

  /**
   * Restore to a previous version
   */
  async restoreVersion(projectId: string, version: number): Promise<FinancialData> {
    const response = await httpClient.post<FinancialData>(
      `${this.baseUrl}/${projectId}/restore`,
      { version }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to restore version');
    }
    
    return response.data!;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    const response = await httpClient.delete(
      `${this.baseUrl}/${projectId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete project');
    }
  }

  /**
   * Clone/duplicate project
   */
  async cloneProject(projectId: string, newName: string): Promise<{ id: string; name: string }> {
    const response = await httpClient.post<{ id: string; name: string }>(
      `${this.baseUrl}/${projectId}/clone`,
      { name: newName }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to clone project');
    }
    
    return response.data!;
  }

  /**
   * Get list of user's projects
   */
  async getUserProjects(): Promise<Array<{
    id: string;
    name: string;
    companyName: string;
    lastModified: string;
    isValid: boolean;
    completeness: number;
  }>> {
    const response = await httpClient.get<Array<{
      id: string;
      name: string;
      companyName: string;
      lastModified: string;
      isValid: boolean;
      completeness: number;
    }>>(
      `${this.baseUrl}/projects`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to load projects');
    }
    
    return response.data!;
  }
}

// Create and export the service instance
export const financialDataService = new FinancialDataService();

// Export the class for testing or custom instances
export { FinancialDataService };