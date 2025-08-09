import { configService } from '../config/ConfigService';
import {
  CashFlowDetails,
  CashFlowFormData,
  CashFlowUpdateRequest,
  CashFlowApiResponse,
  CashFlowAuditEntry
} from '../../types/cashFlow';

class CashFlowApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
  }

  async loadCashFlowData(projectId: string): Promise<CashFlowApiResponse> {
    const response = await fetch(`${this.baseURL}/cash-flow/${projectId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse<CashFlowApiResponse>(response);
  }

  async saveCashFlowData(
    projectId: string,
    data: CashFlowFormData,
    changeReason?: string
  ): Promise<CashFlowApiResponse> {
    const request: CashFlowUpdateRequest = {
      data: this.transformFormToApiRequest(data),
      changeReason
    };

    const response = await fetch(`${this.baseURL}/cash-flow/${projectId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });
    return this.handleResponse<CashFlowApiResponse>(response);
  }

  async updateCashFlowFields(
    projectId: string,
    fieldUpdates: Partial<CashFlowFormData>,
    changeReason?: string
  ): Promise<CashFlowApiResponse> {
    const request = {
      fieldUpdates: this.transformFormToApiRequest(fieldUpdates),
      changeReason
    };

    const response = await fetch(`${this.baseURL}/cash-flow/${projectId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(request)
    });
    return this.handleResponse<CashFlowApiResponse>(response);
  }

  async saveField(
    projectId: string,
    fieldName: keyof CashFlowFormData,
    value: string,
    changeReason?: string
  ): Promise<CashFlowApiResponse> {
    const fieldUpdates = { [fieldName]: value };
    return this.updateCashFlowFields(projectId, fieldUpdates, changeReason);
  }

  async getAuditHistory(projectId: string): Promise<{ data: CashFlowAuditEntry[] }> {
    const response = await fetch(`${this.baseURL}/cash-flow/${projectId}/audit`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse<{ data: CashFlowAuditEntry[] }>(response);
  }

  async getAuditStats(projectId: string): Promise<{
    data: {
      totalChanges: number;
      lastModified: string;
      changeTypes: { [key: string]: number };
      mostChangedFields: { [key: string]: number };
    };
  }> {
    const response = await fetch(`${this.baseURL}/cash-flow/${projectId}/audit/stats`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse<{
      data: {
        totalChanges: number;
        lastModified: string;
        changeTypes: { [key: string]: number };
        mostChangedFields: { [key: string]: number };
      };
    }>(response);
  }

  transformFormToApiRequest(formData: Partial<CashFlowFormData>): Partial<CashFlowFormData> {
    const transformed: Partial<CashFlowFormData> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        transformed[key as keyof CashFlowFormData] = value;
      }
    });

    return transformed;
  }

  transformApiToFormData(apiData: CashFlowDetails): CashFlowFormData {
    return {
      net_income: apiData.net_income?.toString() || '',
      depreciation: apiData.depreciation?.toString() || '',
      amortization: apiData.amortization?.toString() || '',
      changes_in_working_capital: apiData.changes_in_working_capital?.toString() || '',
      operating_cash_flow: apiData.operating_cash_flow?.toString() || '',
      capex: apiData.capex?.toString() || '',
      acquisitions: apiData.acquisitions?.toString() || '',
      investing_cash_flow: apiData.investing_cash_flow?.toString() || '',
      debt_issuance: apiData.debt_issuance?.toString() || '',
      debt_repayment: apiData.debt_repayment?.toString() || '',
      dividends: apiData.dividends?.toString() || '',
      financing_cash_flow: apiData.financing_cash_flow?.toString() || '',
      net_cash_flow: apiData.net_cash_flow?.toString() || '',
      capital_expenditures: apiData.capital_expenditures?.toString() || '',
      free_cash_flow: apiData.free_cash_flow?.toString() || '',
      debt_service: apiData.debt_service?.toString() || ''
    };
  }

  getEmptyFormData(): CashFlowFormData {
    return {
      net_income: '',
      depreciation: '',
      amortization: '',
      changes_in_working_capital: '',
      operating_cash_flow: '',
      capex: '',
      acquisitions: '',
      investing_cash_flow: '',
      debt_issuance: '',
      debt_repayment: '',
      dividends: '',
      financing_cash_flow: '',
      net_cash_flow: '',
      capital_expenditures: '',
      free_cash_flow: '',
      debt_service: ''
    };
  }
}

export const cashFlowApiService = new CashFlowApiService();