import { 
  DebtStructureFormData, 
  DebtStructureUpdateRequest, 
  DebtStructureApiResponse, 
  DebtStructureDetails,
  DebtStructureAuditEntry 
} from '../../types/debtStructure';
import { configService } from '../config/ConfigService';

class DebtStructureApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  /**
   * Transform form data to API request format
   */
  private transformFormToApiRequest(formData: DebtStructureFormData): DebtStructureUpdateRequest {
    const transformNumber = (value: string): number | null => {
      if (!value || value.trim() === '') return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    };

    const transformDate = (value: string): string | null => {
      if (!value || value.trim() === '') return null;
      return value;
    };

    return {
      total_debt: transformNumber(formData.total_debt),
      interest_rate: transformNumber(formData.interest_rate),
      maturity_date: transformDate(formData.maturity_date),
      payment_frequency: formData.payment_frequency || null,
      senior_secured_loan_type: formData.senior_secured_loan_type || null,
      additional_loan_senior_secured: transformNumber(formData.additional_loan_senior_secured),
      bank_base_rate_senior_secured: transformNumber(formData.bank_base_rate_senior_secured),
      liquidity_premiums_senior_secured: transformNumber(formData.liquidity_premiums_senior_secured),
      credit_risk_premiums_senior_secured: transformNumber(formData.credit_risk_premiums_senior_secured),
      maturity_y_senior_secured: transformNumber(formData.maturity_y_senior_secured),
      amortization_y_senior_secured: transformNumber(formData.amortization_y_senior_secured),
      short_term_loan_type: formData.short_term_loan_type || null,
      additional_loan_short_term: transformNumber(formData.additional_loan_short_term),
      bank_base_rate_short_term: transformNumber(formData.bank_base_rate_short_term),
      liquidity_premiums_short_term: transformNumber(formData.liquidity_premiums_short_term),
      credit_risk_premiums_short_term: transformNumber(formData.credit_risk_premiums_short_term),
      maturity_y_short_term: transformNumber(formData.maturity_y_short_term),
      amortization_y_short_term: transformNumber(formData.amortization_y_short_term),
      change_reason: formData.change_reason || undefined
    };
  }

  /**
   * Transform API data to form format
   */
  private transformApiToFormData(apiData: DebtStructureDetails): DebtStructureFormData {
    const transformToString = (value: number | null): string => {
      return value !== null && value !== undefined ? value.toString() : '';
    };

    const transformDateToString = (value: string | null): string => {
      if (!value) return '';
      // Convert date to YYYY-MM-DD format for input fields
      const date = new Date(value);
      return date.toISOString().split('T')[0];
    };

    return {
      // Total Debt
      total_debt: transformToString(apiData.total_debt),
      interest_rate: transformToString(apiData.interest_rate),
      maturity_date: transformDateToString(apiData.maturity_date),
      payment_frequency: apiData.payment_frequency || '',
      
      // Senior Secured Loan
      senior_secured_loan_type: apiData.senior_secured_loan_type || '',
      additional_loan_senior_secured: transformToString(apiData.additional_loan_senior_secured),
      bank_base_rate_senior_secured: transformToString(apiData.bank_base_rate_senior_secured),
      liquidity_premiums_senior_secured: transformToString(apiData.liquidity_premiums_senior_secured),
      credit_risk_premiums_senior_secured: transformToString(apiData.credit_risk_premiums_senior_secured),
      maturity_y_senior_secured: transformToString(apiData.maturity_y_senior_secured),
      amortization_y_senior_secured: transformToString(apiData.amortization_y_senior_secured),
      
      // Short Term Loan
      short_term_loan_type: apiData.short_term_loan_type || '',
      additional_loan_short_term: transformToString(apiData.additional_loan_short_term),
      bank_base_rate_short_term: transformToString(apiData.bank_base_rate_short_term),
      liquidity_premiums_short_term: transformToString(apiData.liquidity_premiums_short_term),
      credit_risk_premiums_short_term: transformToString(apiData.credit_risk_premiums_short_term),
      maturity_y_short_term: transformToString(apiData.maturity_y_short_term),
      amortization_y_short_term: transformToString(apiData.amortization_y_short_term),
      
      // Change tracking
      change_reason: apiData.change_reason || ''
    };
  }

  /**
   * Load debt structure data for a project
   */
  async loadDebtStructureData(projectId: string): Promise<DebtStructureFormData> {
    try {
      const response = await fetch(`${this.baseURL}/debt-structure/${projectId}`, {
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

      const result: DebtStructureApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load debt structure data');
      }

      return this.transformApiToFormData(result.data);
    } catch (error) {
      console.error('Error loading debt structure data:', error);
      throw error;
    }
  }

  /**
   * Save debt structure data (create or update)
   */
  async saveDebtStructureData(projectId: string, formData: DebtStructureFormData): Promise<DebtStructureApiResponse> {
    try {
      const apiData = this.transformFormToApiRequest(formData);
      
      const response = await fetch(`${this.baseURL}/debt-structure/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DebtStructureApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save debt structure data');
      }

      return result;
    } catch (error) {
      console.error('Error saving debt structure data:', error);
      throw error;
    }
  }

  /**
   * Update specific fields of debt structure data
   */
  async updateDebtStructureFields(projectId: string, fieldUpdates: Partial<DebtStructureFormData>): Promise<DebtStructureApiResponse> {
    try {
      const apiUpdates = this.transformFormToApiRequest(fieldUpdates as DebtStructureFormData);
      
      const response = await fetch(`${this.baseURL}/debt-structure/${projectId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(apiUpdates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DebtStructureApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update debt structure fields');
      }

      return result;
    } catch (error) {
      console.error('Error updating debt structure fields:', error);
      throw error;
    }
  }

  /**
   * Save a single field
   */
  async saveField(projectId: string, fieldName: keyof DebtStructureFormData, value: string): Promise<DebtStructureApiResponse> {
    return this.updateDebtStructureFields(projectId, { [fieldName]: value });
  }

  /**
   * Get audit history for debt structure data
   */
  async getAuditHistory(projectId: string): Promise<DebtStructureAuditEntry[]> {
    try {
      const response = await fetch(`${this.baseURL}/debt-structure/${projectId}/audit`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get audit history');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting debt structure audit history:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics for debt structure data
   */
  async getAuditStats(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/debt-structure/${projectId}/audit/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to get audit statistics');
      }

      return result.data;
    } catch (error) {
      console.error('Error getting debt structure audit statistics:', error);
      throw error;
    }
  }

  /**
   * Get empty form data structure
   */
  getEmptyFormData(): DebtStructureFormData {
    return {
      // Total Debt
      total_debt: '',
      interest_rate: '',
      maturity_date: '',
      payment_frequency: '',
      
      // Senior Secured Loan
      senior_secured_loan_type: '',
      additional_loan_senior_secured: '',
      bank_base_rate_senior_secured: '',
      liquidity_premiums_senior_secured: '',
      credit_risk_premiums_senior_secured: '',
      maturity_y_senior_secured: '',
      amortization_y_senior_secured: '',
      
      // Short Term Loan
      short_term_loan_type: '',
      additional_loan_short_term: '',
      bank_base_rate_short_term: '',
      liquidity_premiums_short_term: '',
      credit_risk_premiums_short_term: '',
      maturity_y_short_term: '',
      amortization_y_short_term: '',
      
      // Change tracking
      change_reason: ''
    };
  }
}

export default new DebtStructureApiService(); 