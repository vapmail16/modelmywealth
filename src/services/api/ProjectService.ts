import { supabase } from '@/integrations/supabase/client';
import type { 
  Project, 
  CreateProjectData, 
  UpdateProjectData, 
  ProjectResponse, 
  ProjectsListResponse,
  ProjectWithCompany 
} from '@/types/company';

export class ProjectService {
  async getProjectsByCompany(companyId: string): Promise<ProjectsListResponse> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch projects:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: projects as Project[] || [] };
    } catch (error) {
      console.error('Service error fetching projects:', error);
      return { success: false, error: 'Failed to fetch projects' };
    }
  }

  async getProjectById(id: string): Promise<ProjectResponse> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: project as Project };
    } catch (error) {
      console.error('Service error fetching project:', error);
      return { success: false, error: 'Failed to fetch project' };
    }
  }

  async getProjectWithCompany(id: string): Promise<{ success: boolean; data?: ProjectWithCompany; error?: string }> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          companies (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to fetch project with company:', error);
        return { success: false, error: error.message };
      }

      const projectWithCompany: ProjectWithCompany = {
        ...(project as Project),
        company: project.companies as any
      };

      return { success: true, data: projectWithCompany };
    } catch (error) {
      console.error('Service error fetching project with company:', error);
      return { success: false, error: 'Failed to fetch project with company' };
    }
  }

  async createProject(projectData: CreateProjectData): Promise<ProjectResponse> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: project as Project };
    } catch (error) {
      console.error('Service error creating project:', error);
      return { success: false, error: 'Failed to create project' };
    }
  }

  async updateProject(id: string, projectData: UpdateProjectData): Promise<ProjectResponse> {
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update project:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: project as Project };
    } catch (error) {
      console.error('Service error updating project:', error);
      return { success: false, error: 'Failed to update project' };
    }
  }

  async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete project:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Service error deleting project:', error);
      return { success: false, error: 'Failed to delete project' };
    }
  }

  async getUserProjects(): Promise<ProjectsListResponse> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          companies (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch user projects:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: projects as Project[] || [] };
    } catch (error) {
      console.error('Service error fetching user projects:', error);
      return { success: false, error: 'Failed to fetch user projects' };
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService();