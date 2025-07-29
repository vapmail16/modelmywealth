import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { FinancialData, CalculationResults } from '@/types/financial';
import { financialDataService } from '@/services/api/FinancialDataService';
import { calculationService } from '@/services/api/CalculationService';
import { validationService } from '@/services/api/ValidationService';

interface FinancialDataState {
  // Current data
  currentProject: FinancialData | null;
  calculationResults: CalculationResults | null;
  
  // UI states
  isLoading: boolean;
  isSaving: boolean;
  isCalculating: boolean;
  isValidating: boolean;
  
  // Validation
  validationResult: any | null;
  lastValidated: string | null;
  
  // Auto-save
  hasUnsavedChanges: boolean;
  lastSaved: string | null;
  autoSaveEnabled: boolean;
  
  // Actions
  loadProject: (projectId: string) => Promise<void>;
  saveProject: (data: FinancialData) => Promise<void>;
  updateSection: (section: string, data: any) => Promise<void>;
  calculateMetrics: () => Promise<void>;
  validateData: () => Promise<void>;
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  markAsChanged: () => void;
  clearProject: () => void;
}

export const useFinancialDataStore = create<FinancialDataState>()(
  subscribeWithSelector((set, get) => {
    let autoSaveTimer: NodeJS.Timeout | null = null;

    const startAutoSave = () => {
      if (autoSaveTimer) clearInterval(autoSaveTimer);
      
      autoSaveTimer = setInterval(async () => {
        const state = get();
        if (state.hasUnsavedChanges && state.currentProject && state.autoSaveEnabled) {
          try {
            await financialDataService.autoSaveData(
              state.currentProject.id,
              state.currentProject
            );
            set({
              hasUnsavedChanges: false,
              lastSaved: new Date().toISOString(),
            });
            console.log('Auto-saved project data');
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, 30000); // Auto-save every 30 seconds
    };

    return {
      // Initial state
      currentProject: null,
      calculationResults: null,
      isLoading: false,
      isSaving: false,
      isCalculating: false,
      isValidating: false,
      validationResult: null,
      lastValidated: null,
      hasUnsavedChanges: false,
      lastSaved: null,
      autoSaveEnabled: true,

      // Actions
      loadProject: async (projectId: string) => {
        set({ isLoading: true });
        try {
          const project = await financialDataService.loadFinancialData(projectId);
          set({
            currentProject: project,
            isLoading: false,
            hasUnsavedChanges: false,
            lastSaved: project.metadata.updatedAt,
          });
          
          // Trigger calculation if data is valid
          if (project.metadata.isValid) {
            get().calculateMetrics();
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      saveProject: async (data: FinancialData) => {
        set({ isSaving: true });
        try {
          const result = await financialDataService.saveFinancialData(data);
          set({
            currentProject: { ...data, id: result.id },
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: result.savedAt,
          });
        } catch (error) {
          set({ isSaving: false });
          throw error;
        }
      },

      updateSection: async (section: string, sectionData: any) => {
        const state = get();
        if (!state.currentProject) return;

        set({ isSaving: true });
        try {
          let result;
          switch (section) {
            case 'profitLoss':
              result = await financialDataService.saveProfitLossData(
                state.currentProject.id,
                sectionData
              );
              break;
            case 'balanceSheet':
              result = await financialDataService.saveBalanceSheetData(
                state.currentProject.id,
                sectionData
              );
              break;
            case 'debtStructure':
              result = await financialDataService.saveDebtStructureData(
                state.currentProject.id,
                sectionData
              );
              break;
            case 'growthAssumptions':
              result = await financialDataService.saveGrowthAssumptions(
                state.currentProject.id,
                sectionData
              );
              break;
            default:
              throw new Error(`Unknown section: ${section}`);
          }

          // Update the current project
          set({
            currentProject: {
              ...state.currentProject,
              [section]: sectionData,
            },
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: result.savedAt,
          });

          // Trigger validation and calculation
          get().validateData();
          get().calculateMetrics();
        } catch (error) {
          set({ isSaving: false });
          throw error;
        }
      },

      calculateMetrics: async () => {
        const state = get();
        if (!state.currentProject) return;

        set({ isCalculating: true });
        try {
          const results = await calculationService.calculateMetrics(state.currentProject);
          set({
            calculationResults: results,
            isCalculating: false,
          });
        } catch (error) {
          set({ isCalculating: false });
          console.error('Calculation failed:', error);
        }
      },

      validateData: async () => {
        const state = get();
        if (!state.currentProject) return;

        set({ isValidating: true });
        try {
          const result = await validationService.validateFinancialData(state.currentProject);
          set({
            validationResult: result,
            isValidating: false,
            lastValidated: new Date().toISOString(),
          });
        } catch (error) {
          set({ isValidating: false });
          console.error('Validation failed:', error);
        }
      },

      enableAutoSave: () => {
        set({ autoSaveEnabled: true });
        startAutoSave();
      },

      disableAutoSave: () => {
        set({ autoSaveEnabled: false });
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
          autoSaveTimer = null;
        }
      },

      markAsChanged: () => {
        set({ hasUnsavedChanges: true });
      },

      clearProject: () => {
        if (autoSaveTimer) {
          clearInterval(autoSaveTimer);
          autoSaveTimer = null;
        }
        set({
          currentProject: null,
          calculationResults: null,
          validationResult: null,
          hasUnsavedChanges: false,
          lastSaved: null,
          lastValidated: null,
        });
      },
    };
  })
);