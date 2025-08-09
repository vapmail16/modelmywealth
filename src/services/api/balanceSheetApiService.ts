import { configService } from '@/services/config/ConfigService';
import {
  BalanceSheetDetails,
  BalanceSheetFormData,
  BalanceSheetUpdateRequest,
  BalanceSheetApiResponse,
  BalanceSheetAuditEntry
} from '@/types/balanceSheet';

/**
 * Balance Sheet API Service
 * 
 * Handles all HTTP communication with the balance sheet backend API
 * Matches the backend routes exactly:
 * - GET /api/balance-sheet/:projectId
 * - PUT /api/balance-sheet/:projectId
 * - PATCH /api/balance-sheet/:projectId
 * - GET /api/balance-sheet/:projectId/audit/history
 * - GET /api/balance-sheet/:projectId/audit/stats
 */
class BalanceSheetApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Transform form data to API request format
   */
  private transformFormToApiRequest(formData: BalanceSheetFormData): BalanceSheetUpdateRequest {
    const transformNumber = (value: string): number | null => {
      if (!value || value.trim() === '') return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    return {
      // Assets
      cash: transformNumber(formData.cash),
      accounts_receivable: transformNumber(formData.accounts_receivable),
      inventory: transformNumber(formData.inventory),
      prepaid_expenses: transformNumber(formData.prepaid_expenses),
      other_current_assets: transformNumber(formData.other_current_assets),
      total_current_assets: transformNumber(formData.total_current_assets),
      ppe: transformNumber(formData.ppe),
      intangible_assets: transformNumber(formData.intangible_assets),
      goodwill: transformNumber(formData.goodwill),
      other_assets: transformNumber(formData.other_assets),
      total_assets: transformNumber(formData.total_assets),
      
      // Liabilities
      accounts_payable: transformNumber(formData.accounts_payable),
      accrued_expenses: transformNumber(formData.accrued_expenses),
      short_term_debt: transformNumber(formData.short_term_debt),
      other_current_liabilities: transformNumber(formData.other_current_liabilities),
      total_current_liabilities: transformNumber(formData.total_current_liabilities),
      long_term_debt: transformNumber(formData.long_term_debt),
      other_liabilities: transformNumber(formData.other_liabilities),
      total_liabilities: transformNumber(formData.total_liabilities),
      
      // Equity
      common_stock: transformNumber(formData.common_stock),
      retained_earnings: transformNumber(formData.retained_earnings),
      other_equity: transformNumber(formData.other_equity),
      total_equity: transformNumber(formData.total_equity),
      total_liabilities_equity: transformNumber(formData.total_liabilities_equity),
      
      // Capital Expenditure & Depreciation
      capital_expenditure_additions: transformNumber(formData.capital_expenditure_additions),
      asset_depreciated_over_years: transformNumber(formData.asset_depreciated_over_years),
      
      // Change tracking
      change_reason: formData.change_reason || undefined
    };
  }

  /**
   * Transform API response to form data format
   */
  private transformApiToFormData(apiData: BalanceSheetDetails): BalanceSheetFormData {
    const transformToString = (value: number | null): string => {
      return value !== null && value !== undefined ? value.toString() : '';
    };

    return {
      // Assets
      cash: transformToString(apiData.cash),
      accounts_receivable: transformToString(apiData.accounts_receivable),
      inventory: transformToString(apiData.inventory),
      prepaid_expenses: transformToString(apiData.prepaid_expenses),
      other_current_assets: transformToString(apiData.other_current_assets),
      total_current_assets: transformToString(apiData.total_current_assets),
      ppe: transformToString(apiData.ppe),
      intangible_assets: transformToString(apiData.intangible_assets),
      goodwill: transformToString(apiData.goodwill),
      other_assets: transformToString(apiData.other_assets),
      total_assets: transformToString(apiData.total_assets),
      
      // Liabilities
      accounts_payable: transformToString(apiData.accounts_payable),
      accrued_expenses: transformToString(apiData.accrued_expenses),
      short_term_debt: transformToString(apiData.short_term_debt),
      other_current_liabilities: transformToString(apiData.other_current_liabilities),
      total_current_liabilities: transformToString(apiData.total_current_liabilities),
      long_term_debt: transformToString(apiData.long_term_debt),
      other_liabilities: transformToString(apiData.other_liabilities),
      total_liabilities: transformToString(apiData.total_liabilities),
      
      // Equity
      common_stock: transformToString(apiData.common_stock),
      retained_earnings: transformToString(apiData.retained_earnings),
      other_equity: transformToString(apiData.other_equity),
      total_equity: transformToString(apiData.total_equity),
      total_liabilities_equity: transformToString(apiData.total_liabilities_equity),
      
      // Capital Expenditure & Depreciation
      capital_expenditure_additions: transformToString(apiData.capital_expenditure_additions),
      asset_depreciated_over_years: transformToString(apiData.asset_depreciated_over_years),
      
      // Change tracking
      change_reason: apiData.change_reason || ''
    };
  }

  /**
   * Load balance sheet data for a project
   */
  async loadBalanceSheetData(projectId: string): Promise<BalanceSheetFormData> {
    try {
      const response = await fetch(`${this.baseURL}/balance-sheet/${projectId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          // Return empty form data if no data exists
          return this.getEmptyFormData();
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BalanceSheetApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load balance sheet data');
      }

      return this.transformApiToFormData(result.data);
    } catch (error) {
      console.error('Error loading balance sheet data:', error);
      throw error;
    }
  }

  /**
   * Save balance sheet data (create or update)
   */
  async saveBalanceSheetData(projectId: string, formData: BalanceSheetFormData): Promise<BalanceSheetApiResponse> {
    try {
      const apiData = this.transformFormToApiRequest(formData);
      
      const response = await fetch(`${this.baseURL}/balance-sheet/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BalanceSheetApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save balance sheet data');
      }

      return result;
    } catch (error) {
      console.error('Error saving balance sheet data:', error);
      throw error;
    }
  }

  /**
   * Update specific fields of balance sheet data
   */
  async updateBalanceSheetFields(projectId: string, fieldUpdates: Partial<BalanceSheetFormData>): Promise<BalanceSheetApiResponse> {
    try {
      const apiUpdates = this.transformFormToApiRequest(fieldUpdates as BalanceSheetFormData);
      
      const response = await fetch(`${this.baseURL}/balance-sheet/${projectId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(apiUpdates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: BalanceSheetApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update balance sheet fields');
      }

      return result;
    } catch (error) {
      console.error('Error updating balance sheet fields:', error);
      throw error;
    }
  }

  /**
   * Save a single field
   */
  async saveField(projectId: string, fieldName: keyof BalanceSheetFormData, value: string): Promise<BalanceSheetApiResponse> {
    const fieldUpdate = { [fieldName]: value } as Partial<BalanceSheetFormData>;
    return this.updateBalanceSheetFields(projectId, fieldUpdate);
  }

  /**
   * Get audit history for balance sheet data
   */
  async getAuditHistory(projectId: string): Promise<BalanceSheetAuditEntry[]> {
    try {
      const response = await fetch(`${this.baseURL}/balance-sheet/${projectId}/audit/history`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load audit history');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading audit history:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics for balance sheet data
   */
  async getAuditStats(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/balance-sheet/${projectId}/audit/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load audit statistics');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading audit statistics:', error);
      throw error;
    }
  }

  /**
   * Get empty form data for new records
   */
  getEmptyFormData(): BalanceSheetFormData {
    return {
      // Assets
      cash: '',
      accounts_receivable: '',
      inventory: '',
      prepaid_expenses: '',
      other_current_assets: '',
      total_current_assets: '',
      ppe: '',
      intangible_assets: '',
      goodwill: '',
      other_assets: '',
      total_assets: '',
      
      // Liabilities
      accounts_payable: '',
      accrued_expenses: '',
      short_term_debt: '',
      other_current_liabilities: '',
      total_current_liabilities: '',
      long_term_debt: '',
      other_liabilities: '',
      total_liabilities: '',
      
      // Equity
      common_stock: '',
      retained_earnings: '',
      other_equity: '',
      total_equity: '',
      total_liabilities_equity: '',
      
      // Capital Expenditure & Depreciation
      capital_expenditure_additions: '',
      asset_depreciated_over_years: '',
      
      // Change tracking
      change_reason: ''
    };
  }
}

export const balanceSheetApiService = new BalanceSheetApiService(); 