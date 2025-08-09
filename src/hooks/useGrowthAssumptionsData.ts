import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import growthAssumptionsApiService from '../services/api/growthAssumptionsApiService';
import {
  GrowthAssumptionsFormData,
  GrowthAssumptionsDetails,
  GrowthAssumptionsValidationErrors
} from '../types/growthAssumptions';

interface UseGrowthAssumptionsDataProps {
  projectId: string;
}

interface UseGrowthAssumptionsDataReturn {
  // Data state
  formData: GrowthAssumptionsFormData;
  originalData: GrowthAssumptionsDetails | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  setFieldValue: (field: keyof GrowthAssumptionsFormData, value: string) => void;
  saveField: (field: keyof GrowthAssumptionsFormData, value: string) => Promise<void>;
  saveAllFields: () => Promise<void>;
  resetForm: () => void;
  revertChanges: () => void;
  
  // Computed states
  hasChanged: boolean;
  hasUnsavedChanges: boolean;
  validateForm: () => GrowthAssumptionsValidationErrors;
}

export const useGrowthAssumptionsData = ({ projectId }: UseGrowthAssumptionsDataProps): UseGrowthAssumptionsDataReturn => {
  const { toast } = useToast();
  
  // Data state
  const [formData, setFormData] = useState<GrowthAssumptionsFormData>(growthAssumptionsApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<GrowthAssumptionsDetails | null>(null);
  
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
      const data = await growthAssumptionsApiService.loadGrowthAssumptionsData(projectId);
      
      if (data) {
        setOriginalData(data);
        // Transform API data to form data
        const formDataFromApi = growthAssumptionsApiService.getEmptyFormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key in formDataFromApi && value !== null && value !== undefined) {
            formDataFromApi[key as keyof GrowthAssumptionsFormData] = value.toString();
          }
        });
        setFormData(formDataFromApi);
      } else {
        setOriginalData(null);
        setFormData(growthAssumptionsApiService.getEmptyFormData());
      }
    } catch (error) {
      console.error('Error loading growth assumptions data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load data');
      toast({
        title: 'Error',
        description: 'Failed to load growth assumptions data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  // Set field value
  const setFieldValue = useCallback((field: keyof GrowthAssumptionsFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Save a single field
  const saveField = useCallback(async (field: keyof GrowthAssumptionsFormData, value: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await growthAssumptionsApiService.saveField(projectId, field, value);
      
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
      const result = await growthAssumptionsApiService.saveGrowthAssumptionsData(projectId, formData);
      
      setOriginalData(result.data);
      
      if (result.audit.changesDetected) {
        toast({
          title: 'Success',
          description: result.audit.isNewRecord 
            ? 'Growth assumptions data created successfully' 
            : 'Growth assumptions data updated successfully',
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
      console.error('Error saving growth assumptions data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      toast({
        title: 'Error',
        description: 'Failed to save growth assumptions data',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, formData, toast]);

  // Reset form to original data
  const resetForm = useCallback(() => {
    if (originalData) {
      const formDataFromOriginal = growthAssumptionsApiService.getEmptyFormData();
      Object.entries(originalData).forEach(([key, value]) => {
        if (key in formDataFromOriginal && value !== null && value !== undefined) {
          formDataFromOriginal[key as keyof GrowthAssumptionsFormData] = value.toString();
        }
      });
      setFormData(formDataFromOriginal);
    } else {
      setFormData(growthAssumptionsApiService.getEmptyFormData());
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
      const originalValue = originalData[key as keyof GrowthAssumptionsDetails];
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
  const validateForm = useCallback((): GrowthAssumptionsValidationErrors => {
    const errors: GrowthAssumptionsValidationErrors = {};
    
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