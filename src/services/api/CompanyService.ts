import { supabase } from '@/integrations/supabase/client';
import type { 
  Company, 
  CreateCompanyData, 
  UpdateCompanyData, 
  CompanyResponse, 
  CompaniesListResponse,
  CompanyWithProjects 
} from '@/types/company';

export class CompanyService {
  async getUserCompanies(): Promise<CompaniesListResponse> {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          *,
          projects (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch companies:', error);
        return { success: false, error: error.message };
      }

      const companiesWithProjects: CompanyWithProjects[] = companies?.map(company => ({
        ...company,
        projects: (company.projects || []) as any[]
      })) || [];

      return { success: true, data: companiesWithProjects };
    } catch (error) {
      console.error('Service error fetching companies:', error);
      return { success: false, error: 'Failed to fetch companies' };
    }
  }

  async getCompanyById(id: string): Promise<CompanyResponse> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch company:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: company };
    } catch (error) {
      console.error('Service error fetching company:', error);
      return { success: false, error: 'Failed to fetch company' };
    }
  }

  async createCompany(companyData: CreateCompanyData): Promise<CompanyResponse> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          ...companyData,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create company:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: company };
    } catch (error) {
      console.error('Service error creating company:', error);
      return { success: false, error: 'Failed to create company' };
    }
  }

  async updateCompany(id: string, companyData: UpdateCompanyData): Promise<CompanyResponse> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update company:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: company };
    } catch (error) {
      console.error('Service error updating company:', error);
      return { success: false, error: 'Failed to update company' };
    }
  }

  async deleteCompany(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete company:', error);
        return { success: false, error: error.message };
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