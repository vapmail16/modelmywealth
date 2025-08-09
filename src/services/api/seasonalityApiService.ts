import { configService } from '../config/ConfigService';
import {
  SeasonalityDetails,
  SeasonalityFormData,
  SeasonalityUpdateRequest,
  SeasonalityApiResponse,
  SeasonalityAuditEntry
} from '../../types/seasonality';

class SeasonalityApiService {
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
   * Load seasonality data for a project
   * @param projectId - Project UUID
   * @returns Promise with seasonality data
   */
  async loadSeasonalityData(projectId: string): Promise<SeasonalityDetails | null> {
    try {
      const response = await fetch(`${this.baseURL}/seasonality/${projectId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: SeasonalityApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to load seasonality data');
      }

      return result.data;
    } catch (error) {
      console.error('Error loading seasonality data:', error);
      throw error;
    }
  }

  /**
   * Save seasonality data (create or update)
   * @param projectId - Project UUID
   * @param data - Seasonality data
   * @param changeReason - Reason for the change
   * @returns Promise with saved data and audit info
   */
  async saveSeasonalityData(
    projectId: string, 
    data: SeasonalityFormData, 
    changeReason?: string
  ): Promise<{ data: SeasonalityDetails; audit: any }> {
    try {
      const apiData = this.transformFormToApiRequest(data);
      
      const response = await fetch(`${this.baseURL}/seasonality/${projectId}`, {
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

      const result: SeasonalityApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save seasonality data');
      }

      return {
        data: result.data as SeasonalityDetails,
        audit: result.audit
      };
    } catch (error) {
      console.error('Error saving seasonality data:', error);
      throw error;
    }
  }

  /**
   * Update specific fields of seasonality data
   * @param projectId - Project UUID
   * @param fieldUpdates - Fields to update
   * @param changeReason - Reason for the change
   * @returns Promise with updated data and audit info
   */
  async updateSeasonalityFields(
    projectId: string,
    fieldUpdates: Partial<SeasonalityFormData>,
    changeReason?: string
  ): Promise<{ data: SeasonalityDetails; audit: any }> {
    try {
      const apiFieldUpdates = this.transformFormToApiRequest(fieldUpdates);
      
      const response = await fetch(`${this.baseURL}/seasonality/${projectId}`, {
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

      const result: SeasonalityApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update seasonality fields');
      }

      return {
        data: result.data as SeasonalityDetails,
        audit: result.audit
      };
    } catch (error) {
      console.error('Error updating seasonality fields:', error);
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
    fieldName: keyof SeasonalityFormData,
    value: string,
    changeReason?: string
  ): Promise<{ data: SeasonalityDetails; audit: any }> {
    const fieldUpdates = { [fieldName]: value } as Partial<SeasonalityFormData>;
    return this.updateSeasonalityFields(projectId, fieldUpdates, changeReason);
  }

  /**
   * Get audit history for seasonality data
   * @param projectId - Project UUID
   * @returns Promise with audit history
   */
  async getAuditHistory(projectId: string): Promise<SeasonalityAuditEntry[]> {
    try {
      const response = await fetch(`${this.baseURL}/seasonality/${projectId}/audit`, {
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
   * Get audit statistics for seasonality data
   * @param projectId - Project UUID
   * @returns Promise with audit statistics
   */
  async getAuditStats(projectId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/seasonality/${projectId}/audit/stats`, {
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
  getEmptyFormData(): SeasonalityFormData {
    return {
      january: '',
      february: '',
      march: '',
      april: '',
      may: '',
      june: '',
      july: '',
      august: '',
      september: '',
      october: '',
      november: '',
      december: '',
      seasonal_working_capital: '',
      seasonality_pattern: ''
    };
  }

  /**
   * Transform form data to API request format
   * @param formData - Form data
   * @returns API request data
   */
  private transformFormToApiRequest(formData: Partial<SeasonalityFormData>): Partial<SeasonalityDetails> {
    const apiData: Partial<SeasonalityDetails> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert string to number for numeric fields
        const numValue = parseFloat(value);
        apiData[key as keyof SeasonalityDetails] = isNaN(numValue) ? value : numValue;
      } else {
        apiData[key as keyof SeasonalityDetails] = null;
      }
    });
    
    return apiData;
  }

  /**
   * Transform API data to form format
   * @param apiData - API data
   * @returns Form data
   */
  private transformApiToFormData(apiData: SeasonalityDetails): SeasonalityFormData {
    const formData = this.getEmptyFormData();
    
    Object.entries(apiData).forEach(([key, value]) => {
      if (key in formData && value !== null && value !== undefined) {
        formData[key as keyof SeasonalityFormData] = value.toString();
      }
    });
    
    return formData;
  }
}

export default new SeasonalityApiService(); 