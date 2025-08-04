import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import type { 
  Company, 
  CreateCompanyData, 
  UpdateCompanyData, 
  CompanyResponse, 
  CompaniesListResponse,
  CompanyWithProjects 
} from '@/types/company';

export class CompanyService {
  private baseUrl = '/companies';

  async getUserCompanies(): Promise<CompaniesListResponse> {
    try {
      const response: ApiResponse<CompanyWithProjects[]> = await httpClient.get(this.baseUrl);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch companies';
        console.error('Failed to fetch companies:', response.error);
        return { success: false, error: errorMessage };
      }

      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Service error fetching companies:', error);
      return { success: false, error: 'Failed to fetch companies' };
    }
  }

  async getCompanyById(id: string): Promise<CompanyResponse> {
    try {
      const response: ApiResponse<Company> = await httpClient.get(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch company';
        console.error('Failed to fetch company:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Company not found' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error fetching company:', error);
      return { success: false, error: 'Failed to fetch company' };
    }
  }

  async getCompanyWithProjects(id: string): Promise<CompanyResponse> {
    try {
      const response: ApiResponse<CompanyWithProjects> = await httpClient.get(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch company with projects';
        console.error('Failed to fetch company with projects:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Company not found' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error fetching company with projects:', error);
      return { success: false, error: 'Failed to fetch company with projects' };
    }
  }

  async createCompany(companyData: CreateCompanyData): Promise<CompanyResponse> {
    try {
      const response: ApiResponse<Company> = await httpClient.post(this.baseUrl, companyData);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to create company';
        console.error('Failed to create company:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Failed to create company' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error creating company:', error);
      return { success: false, error: 'Failed to create company' };
    }
  }

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<CompanyResponse> {
    try {
      const response: ApiResponse<Company> = await httpClient.put(`${this.baseUrl}/${id}`, companyData);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to update company';
        console.error('Failed to update company:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Failed to update company' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error updating company:', error);
      return { success: false, error: 'Failed to update company' };
    }
  }

  async deleteCompany(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: ApiResponse<void> = await httpClient.delete(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to delete company';
        console.error('Failed to delete company:', response.error);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Service error deleting company:', error);
      return { success: false, error: 'Failed to delete company' };
    }
  }
}

// Export singleton instance
export const companyService = new CompanyService();