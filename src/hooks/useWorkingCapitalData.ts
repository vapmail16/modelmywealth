import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import workingCapitalApiService from '../services/api/workingCapitalApiService';
import {
  WorkingCapitalFormData,
  WorkingCapitalDetails,
  WorkingCapitalValidationErrors
} from '../types/workingCapital';

interface UseWorkingCapitalDataProps {
  projectId: string;
}

interface UseWorkingCapitalDataReturn {
  // Data state
  formData: WorkingCapitalFormData;
  originalData: WorkingCapitalDetails | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  setFieldValue: (field: keyof WorkingCapitalFormData, value: string) => void;
  saveField: (field: keyof WorkingCapitalFormData, value: string) => Promise<void>;
  saveAllFields: () => Promise<void>;
  resetForm: () => void;
  revertChanges: () => void;
  
  // Computed states
  hasChanged: boolean;
  hasUnsavedChanges: boolean;
  validateForm: () => WorkingCapitalValidationErrors;
}

export const useWorkingCapitalData = ({ projectId }: UseWorkingCapitalDataProps): UseWorkingCapitalDataReturn => {
  const { toast } = useToast();
  
  // Data state
  const [formData, setFormData] = useState<WorkingCapitalFormData>(workingCapitalApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<WorkingCapitalDetails | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId]);

  // Load data from API
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const data = await workingCapitalApiService.loadWorkingCapitalData(projectId);
      
      if (data) {
        setOriginalData(data);
        // Transform API data to form data
        const formDataFromApi = workingCapitalApiService.getEmptyFormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key in formDataFromApi && value !== null && value !== undefined) {
            formDataFromApi[key as keyof WorkingCapitalFormData] = value.toString();
          }
        });
        setFormData(formDataFromApi);
      } else {
        setOriginalData(null);
        setFormData(workingCapitalApiService.getEmptyFormData());
      }
    } catch (error) {
      console.error('Error loading working capital data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load data');
      toast({
        title: 'Error',
        description: 'Failed to load working capital data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  // Set field value
  const setFieldValue = useCallback((field: keyof WorkingCapitalFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Save a single field
  const saveField = useCallback(async (field: keyof WorkingCapitalFormData, value: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await workingCapitalApiService.saveField(projectId, field, value);
      
      setOriginalData(result.data);
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      if (result.audit.changesDetected) {
        toast({
          title: 'Success',
          description: `Updated ${field}`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Info',
          description: 'No changes detected',
          variant: 'secondary'
        });
      }
    } catch (error) {
      console.error('Error saving field:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save field');
      toast({
        title: 'Error',
        description: 'Failed to save field',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, toast]);

  // Save all fields
  const saveAllFields = useCallback(async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await workingCapitalApiService.saveWorkingCapitalData(projectId, formData);
      
      setOriginalData(result.data);
      
      if (result.audit.changesDetected) {
        toast({
          title: 'Success',
          description: result.audit.isNewRecord 
            ? 'Working capital data created successfully' 
            : 'Working capital data updated successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Info',
          description: 'No changes detected',
          variant: 'secondary'
        });
      }
    } catch (error) {
      console.error('Error saving working capital data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      toast({
        title: 'Error',
        description: 'Failed to save working capital data',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, formData, toast]);

  // Reset form to original data
  const resetForm = useCallback(() => {
    if (originalData) {
      const formDataFromOriginal = workingCapitalApiService.getEmptyFormData();
      Object.entries(originalData).forEach(([key, value]) => {
        if (key in formDataFromOriginal && value !== null && value !== undefined) {
          formDataFromOriginal[key as keyof WorkingCapitalFormData] = value.toString();
        }
      });
      setFormData(formDataFromOriginal);
    } else {
      setFormData(workingCapitalApiService.getEmptyFormData());
    }
  }, [originalData]);

  // Revert changes
  const revertChanges = useCallback(() => {
    resetForm();
    toast({
      title: 'Info',
      description: 'Changes reverted',
      variant: 'secondary'
    });
  }, [resetForm, toast]);

  // Check if form has changed
  const hasChanged = useCallback(() => {
    if (!originalData) return false;
    
    for (const [key, value] of Object.entries(formData)) {
      const originalValue = originalData[key as keyof WorkingCapitalDetails];
      const formValue = value;
      
      // Handle null/undefined/empty string equivalencies
      if (originalValue === null && formValue === '') continue;
      if (originalValue === null && formValue !== '') return true;
      if (originalValue !== null && formValue === '') return true;
      
      // Handle numeric comparisons
      if (originalValue !== null && formValue !== '') {
        const originalNum = parseFloat(originalValue.toString());
        const formNum = parseFloat(formValue);
        
        if (!isNaN(originalNum) && !isNaN(formNum)) {
          if (originalNum !== formNum) return true;
        } else {
          // Fallback to string comparison for non-numeric values
          if (originalValue.toString() !== formValue) return true;
        }
      }
    }
    
    return false;
  }, [formData, originalData]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = hasChanged();

  // Validate form
  const validateForm = useCallback((): WorkingCapitalValidationErrors => {
    const errors: WorkingCapitalValidationErrors = {};
    
    // Add validation logic here if needed
    // For now, all fields are optional
    
    return errors;
  }, []);

  return {
    // Data state
    formData,
    originalData,
    
    // Loading states
    isLoading,
    isSaving,
    saveError,
    
    // Actions
    loadData,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    
    // Computed states
    hasChanged: hasChanged(),
    hasUnsavedChanges,
    validateForm
  };
}; 