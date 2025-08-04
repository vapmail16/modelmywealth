import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import type { 
  Project, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectResponse, 
  ProjectsListResponse,
  ProjectWithCompany 
} from '@/types/company';

export class ProjectService {
  private baseUrl = '/projects';

  async getProjectsByCompany(companyId: string): Promise<ProjectsListResponse> {
    try {
      const response: ApiResponse<Project[]> = await httpClient.get(`${this.baseUrl}?company_id=${companyId}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch projects';
        console.error('Failed to fetch projects:', response.error);
        return { success: false, error: errorMessage };
      }

      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Service error fetching projects:', error);
      return { success: false, error: 'Failed to fetch projects' };
    }
  }

  async getProjectById(id: string): Promise<ProjectResponse> {
    try {
      const response: ApiResponse<ProjectWithCompany> = await httpClient.get(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch project';
        console.error('Failed to fetch project:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Project not found' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error fetching project:', error);
      return { success: false, error: 'Failed to fetch project' };
    }
  }

  async getProjectWithCompany(id: string): Promise<ProjectResponse> {
    try {
      const response: ApiResponse<ProjectWithCompany> = await httpClient.get(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch project with company';
        console.error('Failed to fetch project with company:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Project not found' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error fetching project with company:', error);
      return { success: false, error: 'Failed to fetch project with company' };
    }
  }

  async createProject(projectData: CreateProjectData): Promise<ProjectResponse> {
    try {
      const response: ApiResponse<Project> = await httpClient.post(this.baseUrl, projectData);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to create project';
        console.error('Failed to create project:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Failed to create project' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error creating project:', error);
      return { success: false, error: 'Failed to create project' };
    }
  }

  async updateProject(id: string, projectData: UpdateProjectData): Promise<ProjectResponse> {
    try {
      const response: ApiResponse<Project> = await httpClient.put(`${this.baseUrl}/${id}`, projectData);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to update project';
        console.error('Failed to update project:', response.error);
        return { success: false, error: errorMessage };
      }

      if (!response.data) {
        return { success: false, error: 'Failed to update project' };
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Service error updating project:', error);
      return { success: false, error: 'Failed to update project' };
    }
  }

  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response: ApiResponse<void> = await httpClient.delete(`${this.baseUrl}/${id}`);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to delete project';
        console.error('Failed to delete project:', response.error);
        return { success: false, error: errorMessage };
      }

      return { success: true };
    } catch (error) {
      console.error('Service error deleting project:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  }

  async getUserProjects(): Promise<ProjectsListResponse> {
    try {
      const response: ApiResponse<ProjectWithCompany[]> = await httpClient.get(this.baseUrl);

      if (!response.success || response.error) {
        const errorMessage = response.error?.message || 'Failed to fetch user projects';
        console.error('Failed to fetch user projects:', response.error);
        return { success: false, error: errorMessage };
      }

      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Service error fetching user projects:', error);
      return { success: false, error: 'Failed to fetch user projects' };
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();