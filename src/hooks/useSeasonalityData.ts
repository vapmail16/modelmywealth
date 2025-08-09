import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import seasonalityApiService from '../services/api/seasonalityApiService';
import {
  SeasonalityFormData,
  SeasonalityDetails,
  SeasonalityValidationErrors
} from '../types/seasonality';

interface UseSeasonalityDataProps {
  projectId: string;
}

interface UseSeasonalityDataReturn {
  // Data state
  formData: SeasonalityFormData;
  originalData: SeasonalityDetails | null;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  
  // Actions
  loadData: () => Promise<void>;
  setFieldValue: (field: keyof SeasonalityFormData, value: string) => void;
  saveField: (field: keyof SeasonalityFormData, value: string) => Promise<void>;
  saveAllFields: () => Promise<void>;
  resetForm: () => void;
  revertChanges: () => void;
  
  // Computed states
  hasChanged: boolean;
  hasUnsavedChanges: boolean;
  validateForm: () => SeasonalityValidationErrors;
}

export const useSeasonalityData = ({ projectId }: UseSeasonalityDataProps): UseSeasonalityDataReturn => {
  const { toast } = useToast();
  
  // Data state
  const [formData, setFormData] = useState<SeasonalityFormData>(seasonalityApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<SeasonalityDetails | null>(null);
  
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
      const data = await seasonalityApiService.loadSeasonalityData(projectId);
      
      if (data) {
        setOriginalData(data);
        // Transform API data to form data
        const formDataFromApi = seasonalityApiService.getEmptyFormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key in formDataFromApi && value !== null && value !== undefined) {
            formDataFromApi[key as keyof SeasonalityFormData] = value.toString();
          }
        });
        setFormData(formDataFromApi);
      } else {
        setOriginalData(null);
        setFormData(seasonalityApiService.getEmptyFormData());
      }
    } catch (error) {
      console.error('Error loading seasonality data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load data');
      toast({
        title: 'Error',
        description: 'Failed to load seasonality data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  // Set field value
  const setFieldValue = useCallback((field: keyof SeasonalityFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Save a single field
  const saveField = useCallback(async (field: keyof SeasonalityFormData, value: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await seasonalityApiService.saveField(projectId, field, value);
      
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
      const result = await seasonalityApiService.saveSeasonalityData(projectId, formData);
      
      setOriginalData(result.data);
      
      if (result.audit.changesDetected) {
        toast({
          title: 'Success',
          description: result.audit.isNewRecord 
            ? 'Seasonality data created successfully' 
            : 'Seasonality data updated successfully',
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
      console.error('Error saving seasonality data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      toast({
        title: 'Error',
        description: 'Failed to save seasonality data',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, formData, toast]);

  // Reset form to original data
  const resetForm = useCallback(() => {
    if (originalData) {
      const formDataFromOriginal = seasonalityApiService.getEmptyFormData();
      Object.entries(originalData).forEach(([key, value]) => {
        if (key in formDataFromOriginal && value !== null && value !== undefined) {
          formDataFromOriginal[key as keyof SeasonalityFormData] = value.toString();
        }
      });
      setFormData(formDataFromOriginal);
    } else {
      setFormData(seasonalityApiService.getEmptyFormData());
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
      const originalValue = originalData[key as keyof SeasonalityDetails];
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
  const validateForm = useCallback((): SeasonalityValidationErrors => {
    const errors: SeasonalityValidationErrors = {};
    
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