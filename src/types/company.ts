// Company and Project Management Types

export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry?: string;
  headquarters?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  user_id: string;
  name: string;
  description?: string;
  project_type: 'analysis' | 'refinancing' | 'acquisition' | 'expansion' | 'other';
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CompanyWithProjects extends Company {
  projects: Project[];
}

export interface ProjectWithCompany extends Project {
  company: Company;
}

// Create/Update DTOs
export interface CreateCompanyData {
  name: string;
  industry?: string;
  headquarters?: string;
  description?: string;
}

export interface UpdateCompanyData {
  name?: string;
  industry?: string;
  headquarters?: string;
  description?: string;
}

export interface CreateProjectData {
  company_id: string;
  name: string;
  description?: string;
  project_type?: 'analysis' | 'refinancing' | 'acquisition' | 'expansion' | 'other';
  status?: 'active' | 'completed' | 'archived';
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  project_type?: 'analysis' | 'refinancing' | 'acquisition' | 'expansion' | 'other';
  status?: 'active' | 'completed' | 'archived';
}

// API Response Types
export interface CompanyResponse {
  success: boolean;
  data?: Company;
  error?: string;
}

export interface ProjectResponse {
  success: boolean;
  data?: Project;
  error?: string;
}

export interface CompaniesListResponse {
  success: boolean;
  data?: CompanyWithProjects[];
  error?: string;
}

export interface ProjectsListResponse {
  success: boolean;
  data?: Project[];
  error?: string;
}