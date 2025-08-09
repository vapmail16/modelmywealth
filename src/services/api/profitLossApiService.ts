import { configService } from '@/services/config/ConfigService';
import { 
  ProfitLossDetails, 
  ProfitLossSavePayload, 
  ProfitLossFormData,
  ProfitLossApiResponse 
} from '@/types/profitLoss';

class ProfitLossApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async loadProfitLossData(projectId: string): Promise<ProfitLossDetails | null> {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No data found
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load profit & loss data');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error loading profit & loss data:', error);
      throw error;
    }
  }

  async saveProfitLossData(projectId: string, data: ProfitLossSavePayload): Promise<ProfitLossDetails> {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profit & loss data');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error saving profit & loss data:', error);
      throw error;
    }
  }

  async updateProfitLossData(projectId: string, data: Partial<ProfitLossSavePayload>): Promise<ProfitLossDetails> {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profit & loss data');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error updating profit & loss data:', error);
      throw error;
    }
  }

  async deleteProfitLossData(projectId: string, changeReason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ change_reason: changeReason || 'Deleted via UI' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete profit & loss data');
      }
    } catch (error) {
      console.error('Error deleting profit & loss data:', error);
      throw error;
    }
  }

  // Transform API data to form format
  mapApiToForm(apiData: ProfitLossDetails): ProfitLossFormData {
    // Calculate gross profit for display
    const revenue = apiData.revenue || 0;
    const cogs = apiData.cogs || 0;
    const gross_profit = revenue - cogs;

    return {
      revenue: apiData.revenue?.toString() || '',
      cogs: apiData.cogs?.toString() || '',
      gross_profit: gross_profit.toString(),
      operating_expenses: apiData.operating_expenses?.toString() || '',
      ebitda: apiData.ebitda?.toString() || '',
      depreciation: apiData.depreciation?.toString() || '',
      ebit: apiData.ebit?.toString() || '',
      interest_expense: apiData.interest_expense?.toString() || '',
      pretax_income: apiData.ebt?.toString() || '', // Map ebt to pretax_income
      tax_rates: apiData.tax_rates?.toString() || '',
      taxes: apiData.taxes?.toString() || '',
      net_income: apiData.net_income?.toString() || ''
    };
  }

  // Transform form data to API format
  mapFormToSavePayload(formData: Partial<ProfitLossFormData>): ProfitLossSavePayload {
    const payload: ProfitLossSavePayload = {};

    // Only include fields that have values and convert strings to numbers
    if (formData.revenue?.trim()) {
      const revenue = parseFloat(formData.revenue.trim());
      if (!isNaN(revenue)) payload.revenue = revenue;
    }

    if (formData.cogs?.trim()) {
      const cogs = parseFloat(formData.cogs.trim());
      if (!isNaN(cogs)) payload.cogs = cogs;
    }

    if (formData.operating_expenses?.trim()) {
      const opex = parseFloat(formData.operating_expenses.trim());
      if (!isNaN(opex)) payload.operating_expenses = opex;
    }

    if (formData.ebitda?.trim()) {
      const ebitda = parseFloat(formData.ebitda.trim());
      if (!isNaN(ebitda)) payload.ebitda = ebitda;
    }

    if (formData.depreciation?.trim()) {
      const depreciation = parseFloat(formData.depreciation.trim());
      if (!isNaN(depreciation)) payload.depreciation = depreciation;
    }

    if (formData.ebit?.trim()) {
      const ebit = parseFloat(formData.ebit.trim());
      if (!isNaN(ebit)) payload.ebit = ebit;
    }

    if (formData.interest_expense?.trim()) {
      const interest = parseFloat(formData.interest_expense.trim());
      if (!isNaN(interest)) payload.interest_expense = interest;
    }

    if (formData.pretax_income?.trim()) {
      const pretax = parseFloat(formData.pretax_income.trim());
      if (!isNaN(pretax)) payload.ebt = pretax; // Map pretax_income to ebt
    }

    if (formData.tax_rates?.trim()) {
      const taxRate = parseFloat(formData.tax_rates.trim());
      if (!isNaN(taxRate)) payload.tax_rates = taxRate;
    }

    if (formData.taxes?.trim()) {
      const taxes = parseFloat(formData.taxes.trim());
      if (!isNaN(taxes)) payload.taxes = taxes;
    }

    if (formData.net_income?.trim()) {
      const netIncome = parseFloat(formData.net_income.trim());
      if (!isNaN(netIncome)) payload.net_income = netIncome;
    }

    return payload;
  }

  // Get initial empty form data
  getInitialFormData(): ProfitLossFormData {
    return {
      revenue: '',
      cogs: '',
      gross_profit: '',
      operating_expenses: '',
      ebitda: '',
      depreciation: '',
      ebit: '',
      interest_expense: '',
      pretax_income: '',
      tax_rates: '',
      taxes: '',
      net_income: ''
    };
  }

  // Calculate derived values (client-side for immediate feedback)
  calculateDerivedValues(formData: ProfitLossFormData): Partial<ProfitLossFormData> {
    const revenue = parseFloat(formData.revenue) || 0;
    const cogs = parseFloat(formData.cogs) || 0;
    const operating_expenses = parseFloat(formData.operating_expenses) || 0;
    const depreciation = parseFloat(formData.depreciation) || 0;
    const interest_expense = parseFloat(formData.interest_expense) || 0;
    const tax_rates = parseFloat(formData.tax_rates) || 0;

    const gross_profit = revenue - cogs;
    const ebitda = gross_profit - operating_expenses;
    const ebit = ebitda - depreciation; // Note: amortization not in form
    const pretax_income = ebit - interest_expense;
    const taxes = pretax_income * (tax_rates / 100);
    const net_income = pretax_income - taxes;

    return {
      gross_profit: gross_profit.toFixed(2),
      ebitda: ebitda.toFixed(2),
      ebit: ebit.toFixed(2),
      pretax_income: pretax_income.toFixed(2),
      taxes: taxes.toFixed(2),
      net_income: net_income.toFixed(2)
    };
  }

  /**
   * Validation functions
   */
  validateFormData(formData: ProfitLossFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required fields
    if (!formData.revenue?.trim()) {
      errors.push('Revenue is required');
    }

    // Validate numeric fields
    const numericFields = [
      'revenue', 'cogs', 'operating_expenses', 'depreciation', 
      'interest_expense', 'tax_rates'
    ];

    numericFields.forEach(field => {
      const value = formData[field as keyof ProfitLossFormData];
      if (value?.trim() && isNaN(parseFloat(value))) {
        errors.push(`${field.replace('_', ' ')} must be a valid number`);
      }
    });

    // Validate tax rate range
    if (formData.tax_rates?.trim()) {
      const taxRate = parseFloat(formData.tax_rates);
      if (!isNaN(taxRate) && (taxRate < 0 || taxRate > 100)) {
        errors.push('Tax rate must be between 0% and 100%');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get audit history for P&L data
   */
  async getAuditHistory(projectId: string, limit = 50) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss/history?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch audit history');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching audit history:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(projectId: string) {
    try {
      const response = await fetch(`${this.baseURL}/projects/${projectId}/profit-loss/audit-stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch audit statistics');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching audit statistics:', error);
      throw error;
    }
  }
}

export const profitLossApiService = new ProfitLossApiService();