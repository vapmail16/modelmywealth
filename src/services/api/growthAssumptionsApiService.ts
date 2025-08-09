import { configService } from '../config/ConfigService';
import {
  GrowthAssumptionsDetails,
  GrowthAssumptionsFormData,
  GrowthAssumptionsUpdateRequest,
  GrowthAssumptionsApiResponse,
  GrowthAssumptionsAuditEntry
} from '../../types/growthAssumptions';

class GrowthAssumptionsApiService {
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
   * Load growth assumptions data for a project
   * @param projectId - Project UUID
   * @returns Promise with growth assumptions data
   */
  async loadGrowthAssumptionsData(projectId: string): Promise<GrowthAssumptionsDetails | null> {
    try {
      const response = await fetch(`${this.baseURL}/growth-assumptions/${projectId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GrowthAssumptionsApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load growth assumptions data');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading growth assumptions data:', error);
      throw error;
    }
  }

  /**
   * Save growth assumptions data (create or update)
   * @param projectId - Project UUID
   * @param data - Growth assumptions data
   * @param changeReason - Reason for the change
   * @returns Promise with saved data and audit info
   */
  async saveGrowthAssumptionsData(
    projectId: string, 
    data: GrowthAssumptionsFormData, 
    changeReason?: string
  ): Promise<{ data: GrowthAssumptionsDetails; audit: any }> {
    try {
      const apiData = this.transformFormToApiRequest(data);
      
      const response = await fetch(`${this.baseURL}/growth-assumptions/${projectId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          data: apiData,
          changeReason: changeReason || 'Data entry update'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GrowthAssumptionsApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save growth assumptions data');
      }

      return {
        data: result.data as GrowthAssumptionsDetails,
        audit: result.audit
      };
    } catch (error) {
      console.error('Error saving growth assumptions data:', error);
      throw error;
    }
  }

  /**
   * Update specific fields of growth assumptions data
   * @param projectId - Project UUID
   * @param fieldUpdates - Fields to update
   * @param changeReason - Reason for the change
   * @returns Promise with updated data and audit info
   */
  async updateGrowthAssumptionsFields(
    projectId: string,
    fieldUpdates: Partial<GrowthAssumptionsFormData>,
    changeReason?: string
  ): Promise<{ data: GrowthAssumptionsDetails; audit: any }> {
    try {
      const apiFieldUpdates = this.transformFormToApiRequest(fieldUpdates);
      
      const response = await fetch(`${this.baseURL}/growth-assumptions/${projectId}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          fieldUpdates: apiFieldUpdates,
          changeReason: changeReason || 'Field update'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: GrowthAssumptionsApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update growth assumptions fields');
      }

      return {
        data: result.data as GrowthAssumptionsDetails,
        audit: result.audit
      };
    } catch (error) {
      console.error('Error updating growth assumptions fields:', error);
      throw error;
    }
  }

  /**
   * Save a single field
   * @param projectId - Project UUID
   * @param fieldName - Field name to update
   * @param value - New value
   * @param changeReason - Reason for the change
   * @returns Promise with updated data
   */
  async saveField(
    projectId: string,
    fieldName: keyof GrowthAssumptionsFormData,
    value: string,
    changeReason?: string
  ): Promise<{ data: GrowthAssumptionsDetails; audit: any }> {
    const fieldUpdates = { [fieldName]: value } as Partial<GrowthAssumptionsFormData>;
    return this.updateGrowthAssumptionsFields(projectId, fieldUpdates, changeReason);
  }

  /**
   * Get audit history for growth assumptions data
   * @param projectId - Project UUID
   * @returns Promise with audit history
   */
  async getAuditHistory(projectId: string): Promise<GrowthAssumptionsAuditEntry[]> {
    try {
      const response = await fetch(`${this.baseURL}/growth-assumptions/${projectId}/audit`, {
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
      console.error('Error getting audit history:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics for growth assumptions data
   * @param projectId - Project UUID
   * @returns Promise with audit statistics
   */
  async getAuditStats(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/growth-assumptions/${projectId}/audit/stats`, {
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
      console.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  /**
   * Get empty form data structure
   * @returns Empty form data object
   */
  getEmptyFormData(): GrowthAssumptionsFormData {
    return {
      gr_revenue_1: '',
      gr_revenue_2: '',
      gr_revenue_3: '',
      gr_revenue_4: '',
      gr_revenue_5: '',
      gr_revenue_6: '',
      gr_revenue_7: '',
      gr_revenue_8: '',
      gr_revenue_9: '',
      gr_revenue_10: '',
      gr_revenue_11: '',
      gr_revenue_12: '',
      gr_cost_1: '',
      gr_cost_2: '',
      gr_cost_3: '',
      gr_cost_4: '',
      gr_cost_5: '',
      gr_cost_6: '',
      gr_cost_7: '',
      gr_cost_8: '',
      gr_cost_9: '',
      gr_cost_10: '',
      gr_cost_11: '',
      gr_cost_12: '',
      gr_cost_oper_1: '',
      gr_cost_oper_2: '',
      gr_cost_oper_3: '',
      gr_cost_oper_4: '',
      gr_cost_oper_5: '',
      gr_cost_oper_6: '',
      gr_cost_oper_7: '',
      gr_cost_oper_8: '',
      gr_cost_oper_9: '',
      gr_cost_oper_10: '',
      gr_cost_oper_11: '',
      gr_cost_oper_12: '',
      gr_capex_1: '',
      gr_capex_2: '',
      gr_capex_3: '',
      gr_capex_4: '',
      gr_capex_5: '',
      gr_capex_6: '',
      gr_capex_7: '',
      gr_capex_8: '',
      gr_capex_9: '',
      gr_capex_10: '',
      gr_capex_11: '',
      gr_capex_12: ''
    };
  }

  /**
   * Transform form data to API request format
   * @param formData - Form data
   * @returns API request data
   */
  private transformFormToApiRequest(formData: Partial<GrowthAssumptionsFormData>): Partial<GrowthAssumptionsDetails> {
    const apiData: Partial<GrowthAssumptionsDetails> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert string to number for numeric fields
        const numValue = parseFloat(value);
        apiData[key as keyof GrowthAssumptionsDetails] = isNaN(numValue) ? null : numValue;
      } else {
        apiData[key as keyof GrowthAssumptionsDetails] = null;
      }
    });
    
    return apiData;
  }

  /**
   * Transform API data to form format
   * @param apiData - API data
   * @returns Form data
   */
  private transformApiToFormData(apiData: GrowthAssumptionsDetails): GrowthAssumptionsFormData {
    const formData = this.getEmptyFormData();
    
    Object.entries(apiData).forEach(([key, value]) => {
      if (key in formData && value !== null && value !== undefined) {
        formData[key as keyof GrowthAssumptionsFormData] = value.toString();
      }
    });
    
    return formData;
  }
}

export default new GrowthAssumptionsApiService(); 