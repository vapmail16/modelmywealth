/**
 * Company API Service
 * 
 * Handles HTTP communication with the backend company endpoints.
 * Ensures exact column name consistency between frontend and backend.
 * 
 * Backend endpoints:
 * - GET /api/projects/:projectId/company
 * - PUT /api/projects/:projectId/company  
 * - PATCH /api/projects/:projectId/company
 * - GET /api/projects/:projectId/company/history
 * - GET /api/projects/:projectId/company/audit-stats
 */

import { configService } from '../config/ConfigService';
import {
  CompanyDetails,
  CompanyUpdateRequest,
  CompanyApiResponse,
  CompanyApiError,
  CompanyAuditEntry,
  CompanyFormData
} from '../../types/company';

export class CompanyApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = configService.get('api').baseURL;
  }

  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: CompanyApiError;
      
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          success: false,
          error: 'Network error',
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      throw new Error(errorData.message || errorData.error || 'API request failed');
    }
    
    return response.json();
  }

  /**
   * Transform form data to API request format
   * Converts string form values to proper types and only includes non-empty fields
   */
  private transformFormToApiRequest(formData: CompanyFormData): CompanyUpdateRequest {
    const request: CompanyUpdateRequest = {};
    
    // String fields - include if not empty
    if (formData.company_name?.trim()) {
      request.company_name = formData.company_name.trim();
    }
    if (formData.industry?.trim()) {
      request.industry = formData.industry.trim();
    }
    if (formData.fiscal_year_end?.trim()) {
      request.fiscal_year_end = formData.fiscal_year_end.trim();
    }
    if (formData.reporting_currency?.trim()) {
      request.reporting_currency = formData.reporting_currency.trim();
    }
    if (formData.region?.trim()) {
      request.region = formData.region.trim();
    }
    if (formData.country?.trim()) {
      request.country = formData.country.trim();
    }
    if (formData.company_website?.trim()) {
      request.company_website = formData.company_website.trim();
    }
    if (formData.business_case?.trim()) {
      request.business_case = formData.business_case.trim();
    }
    if (formData.notes?.trim()) {
      request.notes = formData.notes.trim();
    }
    
    // Number fields - include if valid numbers
    if (formData.employee_count?.trim()) {
      const empCount = parseInt(formData.employee_count.trim());
      if (!isNaN(empCount) && empCount >= 0) {
        request.employee_count = empCount;
      }
    }
    if (formData.founded?.trim()) {
      const foundedYear = parseInt(formData.founded.trim());
      if (!isNaN(foundedYear) && foundedYear >= 1800) {
        request.founded = foundedYear;
      }
    }
    if (formData.projection_start_month?.trim()) {
      const month = parseInt(formData.projection_start_month.trim());
      if (!isNaN(month) && month >= 1 && month <= 12) {
        request.projection_start_month = month;
      }
    }
    if (formData.projection_start_year?.trim()) {
      const year = parseInt(formData.projection_start_year.trim());
      if (!isNaN(year) && year >= new Date().getFullYear()) {
        request.projection_start_year = year;
      }
    }
    if (formData.projections_year?.trim()) {
      const projYear = parseInt(formData.projections_year.trim());
      if (!isNaN(projYear) && projYear >= new Date().getFullYear()) {
        request.projections_year = projYear;
      }
    }
    
    // Change reason
    if (formData.change_reason?.trim()) {
      request.change_reason = formData.change_reason.trim();
    }
    
    return request;
  }

  /**
   * Transform API response to form data format
   * Converts database types to string form values
   */
  private transformApiToFormData(apiData: CompanyDetails): CompanyFormData {
    return {
      company_name: apiData.company_name || '',
      industry: apiData.industry || '',
      fiscal_year_end: apiData.fiscal_year_end || '',
      reporting_currency: apiData.reporting_currency || '',
      region: apiData.region || '',
      country: apiData.country || '',
      employee_count: apiData.employee_count?.toString() || '',
      founded: apiData.founded?.toString() || '',
      company_website: apiData.company_website || '',
      business_case: apiData.business_case || '',
      notes: apiData.notes || '',
      projection_start_month: apiData.projection_start_month?.toString() || '',
      projection_start_year: apiData.projection_start_year?.toString() || '',
      projections_year: apiData.projections_year?.toString() || '',
      change_reason: ''  // Always empty for new changes
    };
  }

  /**
   * Load company details for a project
   * GET /api/projects/:projectId/company
   */
  async loadCompanyData(projectId: string): Promise<CompanyDetails | null> {
    try {
      const response = await fetch(
        `${this.baseURL}/projects/${projectId}/company`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      if (response.status === 404) {
        // Company details don't exist yet
        return null;
      }

      const result: CompanyApiResponse = await this.handleResponse(response);
      return result.data;
    } catch (error) {
      console.error('Failed to load company data:', error);
      throw error;
    }
  }

  /**
   * Save company details (full update)
   * PUT /api/projects/:projectId/company
   */
  async saveCompanyData(
    projectId: string,
    formData: CompanyFormData
  ): Promise<CompanyApiResponse> {
    try {
      const requestData = this.transformFormToApiRequest(formData);
      
      const response = await fetch(
        `${this.baseURL}/projects/${projectId}/company`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData)
        }
      );

      return await this.handleResponse<CompanyApiResponse>(response);
    } catch (error) {
      console.error('Failed to save company data:', error);
      throw error;
    }
  }

  /**
   * Update specific company fields (partial update)
   * PATCH /api/projects/:projectId/company
   */
  async updateCompanyFields(
    projectId: string,
    fields: Partial<CompanyFormData>,
    changeReason?: string
  ): Promise<CompanyApiResponse> {
    try {
      // Create a temporary form data object with only the provided fields
      const formData: CompanyFormData = {
        company_name: '',
        industry: '',
        fiscal_year_end: '',
        reporting_currency: '',
        region: '',
        country: '',
        employee_count: '',
        founded: '',
        company_website: '',
        business_case: '',
        notes: '',
        projection_start_month: '',
        projection_start_year: '',
        projections_year: '',
        change_reason: changeReason || '',
        ...fields  // Override with provided fields
      };

      const requestData = this.transformFormToApiRequest(formData);
      
      const response = await fetch(
        `${this.baseURL}/projects/${projectId}/company`,
        {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(requestData)
        }
      );

      return await this.handleResponse<CompanyApiResponse>(response);
    } catch (error) {
      console.error('Failed to update company fields:', error);
      throw error;
    }
  }

  /**
   * Save single field change
   * Optimized for individual field updates to preserve other data
   */
  async saveField(
    projectId: string,
    fieldName: keyof CompanyFormData,
    value: string,
    changeReason?: string
  ): Promise<CompanyApiResponse> {
    try {
      const fields: Partial<CompanyFormData> = {
        [fieldName]: value,
        change_reason: changeReason || `Updated ${fieldName}`
      };

      return await this.updateCompanyFields(projectId, fields, changeReason);
    } catch (error) {
      console.error(`Failed to save field ${fieldName}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for company details
   * GET /api/projects/:projectId/company/history
   */
  async getAuditHistory(
    projectId: string,
    options: {
      limit?: number;
      offset?: number;
      action?: string;
    } = {}
  ): Promise<CompanyAuditEntry[]> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.action) params.append('action', options.action);

      const queryString = params.toString();
      const url = `${this.baseURL}/projects/${projectId}/company/history${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse<{ success: boolean; data: CompanyAuditEntry[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Failed to get audit history:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   * GET /api/projects/:projectId/company/audit-stats
   */
  async getAuditStats(projectId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/projects/${projectId}/company/audit-stats`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );

      const result = await this.handleResponse<{ success: boolean; data: any[] }>(response);
      return result.data;
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      throw error;
    }
  }

  /**
   * Convert loaded API data to form data
   * Helper method for components to transform API response to form state
   */
  apiDataToFormData(apiData: CompanyDetails | null): CompanyFormData {
    if (!apiData) {
      // Return empty form data if no API data
      return {
        company_name: '',
        industry: '',
        fiscal_year_end: '',
        reporting_currency: '',
        region: '',
        country: '',
        employee_count: '',
        founded: '',
        company_website: '',
        business_case: '',
        notes: '',
        projection_start_month: '',
        projection_start_year: '',
        projections_year: '',
        change_reason: ''
      };
    }

    return this.transformApiToFormData(apiData);
  }

  /**
   * Validate form data before sending to API
   */
  validateFormData(formData: CompanyFormData): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Company name validation
    if (formData.company_name && formData.company_name.length > 255) {
      errors.company_name = 'Company name must be 255 characters or less';
    }

    // Industry validation
    if (formData.industry && formData.industry.length > 255) {
      errors.industry = 'Industry must be 255 characters or less';
    }

    // Employee count validation
    if (formData.employee_count) {
      const empCount = parseInt(formData.employee_count);
      if (isNaN(empCount) || empCount < 0) {
        errors.employee_count = 'Employee count must be a positive number';
      }
    }

    // Founded year validation
    if (formData.founded) {
      const foundedYear = parseInt(formData.founded);
      const currentYear = new Date().getFullYear();
      if (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > currentYear) {
        errors.founded = `Founded year must be between 1800 and ${currentYear}`;
      }
    }

    // Website URL validation
    if (formData.company_website && formData.company_website.trim()) {
      try {
        new URL(formData.company_website);
      } catch (e) {
        errors.company_website = 'Please enter a valid URL';
      }
    }

    // Projections year validation
    if (formData.projections_year) {
      const projYear = parseInt(formData.projections_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(projYear) || projYear < currentYear) {
        errors.projections_year = `Projections year must be ${currentYear} or later`;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if form data has changes compared to original
   */
  hasChanges(current: CompanyFormData, original: CompanyFormData): boolean {
    const fields: (keyof CompanyFormData)[] = [
      'company_name', 'industry', 'fiscal_year_end', 'reporting_currency',
      'region', 'country', 'employee_count', 'founded', 'company_website',
      'business_case', 'notes', 'projection_start_month', 'projection_start_year',
      'projections_year'
    ];

    return fields.some(field => current[field] !== original[field]);
  }

  /**
   * Get only the changed fields between current and original form data
   */
  getChangedFields(current: CompanyFormData, original: CompanyFormData): Partial<CompanyFormData> {
    const changes: Partial<CompanyFormData> = {};

    const fields: (keyof CompanyFormData)[] = [
      'company_name', 'industry', 'fiscal_year_end', 'reporting_currency',
      'region', 'country', 'employee_count', 'founded', 'company_website',
      'business_case', 'notes', 'projection_start_month', 'projection_start_year',
      'projections_year'
    ];

    fields.forEach(field => {
      if (current[field] !== original[field]) {
        changes[field] = current[field];
      }
    });

    return changes;
  }
}

// Export singleton instance
export const companyApiService = new CompanyApiService();

/**
 * COLUMN NAME VERIFICATION ✅
 * 
 * This service ensures EXACT column name consistency:
 * 
 * Database Column → API Field → Frontend Field
 * ✅ company_name → company_name → company_name
 * ✅ industry → industry → industry
 * ✅ fiscal_year_end → fiscal_year_end → fiscal_year_end
 * ✅ reporting_currency → reporting_currency → reporting_currency
 * ✅ region → region → region
 * ✅ country → country → country
 * ✅ employee_count → employee_count → employee_count
 * ✅ founded → founded → founded
 * ✅ company_website → company_website → company_website
 * ✅ business_case → business_case → business_case
 * ✅ notes → notes → notes
 * ✅ projection_start_month → projection_start_month → projection_start_month
 * ✅ projection_start_year → projection_start_year → projection_start_year
 * ✅ projections_year → projections_year → projections_year
 * 
 * FIELD PRESERVATION GUARANTEED: Only fields with values are sent to API! ✅
 */