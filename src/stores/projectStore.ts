import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Company } from '@/types/company';
import { projectService } from '@/services/api/ProjectService';
import { companyService } from '@/services/api/CompanyService';

interface ProjectState {
  // Current context
  selectedProject: Project | null;
  selectedCompany: Company | null;
  
  // Available projects for current user
  userProjects: Project[];
  userCompanies: Company[];
  
  // UI states
  isLoading: boolean;
  isLoadingProjects: boolean;
  
  // Actions
  setSelectedProject: (project: Project) => void;
  setSelectedCompany: (company: Company) => void;
  loadUserProjects: () => Promise<void>;
  loadUserCompanies: () => Promise<void>;
  createProject: (name: string, description?: string, projectType?: string) => Promise<Project>;
  clearSelection: () => void;
  refreshProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedProject: null,
      selectedCompany: null,
      userProjects: [],
      userCompanies: [],
      isLoading: false,
      isLoadingProjects: false,

      // Actions
      setSelectedProject: (project: Project) => {
        set({ selectedProject: project });
      },

      setSelectedCompany: (company: Company) => {
        set({ selectedCompany: company });
      },

      loadUserProjects: async () => {
        set({ isLoadingProjects: true });
        try {
          const response = await projectService.getUserProjects();
          if (response.success && response.data) {
            set({ userProjects: response.data, isLoadingProjects: false });
          } else {
            console.error('Failed to load projects:', response.error);
            set({ isLoadingProjects: false });
          }
        } catch (error) {
          console.error('Error loading projects:', error);
          set({ isLoadingProjects: false });
        }
      },

      loadUserCompanies: async () => {
        set({ isLoading: true });
        try {
          const response = await companyService.getUserCompanies();
          if (response.success && response.data) {
            set({ userCompanies: response.data, isLoading: false });
          } else {
            console.error('Failed to load companies:', response.error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error loading companies:', error);
          set({ isLoading: false });
        }
      },

      createProject: async (name: string, description?: string, projectType?: string) => {
        const { selectedCompany } = get();
        if (!selectedCompany) {
          throw new Error('No company selected');
        }

        set({ isLoading: true });
        try {
          const response = await projectService.createProject({
            company_id: selectedCompany.id,
            name,
            description,
            project_type: (projectType as any) || 'analysis',
            status: 'active'
          });

          if (response.success && response.data) {
            // Refresh projects and set as selected
            await get().loadUserProjects();
            set({ selectedProject: response.data, isLoading: false });
            return response.data;
          } else {
            set({ isLoading: false });
            throw new Error(response.error || 'Failed to create project');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearSelection: () => {
        set({
          selectedProject: null,
          selectedCompany: null,
        });
      },

      refreshProjects: async () => {
        await get().loadUserProjects();
        await get().loadUserCompanies();
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        selectedProject: state.selectedProject,
        selectedCompany: state.selectedCompany,
      }),
    }
  )
);