import { useState, useEffect, useCallback } from 'react';
import { profitLossApiService } from '@/services/api/profitLossApiService';
import { 
  ProfitLossDetails, 
  ProfitLossFormData, 
  ProfitLossSavePayload 
} from '@/types/profitLoss';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';

export const useProfitLossData = (projectId: string) => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<ProfitLossFormData>(
    profitLossApiService.getInitialFormData()
  );
  const [originalData, setOriginalData] = useState<ProfitLossFormData>(
    profitLossApiService.getInitialFormData()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const data = await profitLossApiService.loadProfitLossData(projectId);
      if (data) {
        const mapped = profitLossApiService.mapApiToForm(data);
        setFormData(mapped);
        setOriginalData(mapped);
        toast({
          title: "P&L Data Loaded",
          description: "Existing profit & loss data loaded successfully.",
        });
      } else {
        // If no data, ensure form is reset to initial empty state
        const initialEmptyState = profitLossApiService.getInitialFormData();
        setFormData(initialEmptyState);
        setOriginalData(initialEmptyState);
        toast({
          title: "No P&L Data",
          description: "No existing profit & loss data found. Starting with a blank form.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Error loading profit & loss data:', error);
      toast({
        title: "Error Loading P&L Data",
        description: error.message || "Failed to load profit & loss data.",
        variant: "destructive"
      });
      // Ensure form is reset to initial empty state on error
      const initialEmptyState = profitLossApiService.getInitialFormData();
      setFormData(initialEmptyState);
      setOriginalData(initialEmptyState);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveField = useCallback(async (
    fieldName: keyof ProfitLossFormData, 
    value: string, 
    changeReason?: string
  ): Promise<boolean> => {
    if (!projectId || !user?.id) {
      toast({
        title: "Save Error",
        description: "Project ID or User ID is missing. Cannot save.",
        variant: "destructive"
      });
      return false;
    }

    // Only save if the value has actually changed from the original loaded data
    if (value === originalData[fieldName]) {
      return true; // No actual change, skip save but return success
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload: ProfitLossSavePayload = {
        ...profitLossApiService.mapFormToSavePayload({ [fieldName]: value }),
        change_reason: changeReason || `Updated ${fieldName}`
      };

      const savedData = await profitLossApiService.saveProfitLossData(projectId, payload);
      const mappedSavedData = profitLossApiService.mapApiToForm(savedData);

      // Update both formData and originalData with the new saved value
      setFormData(prev => ({ ...prev, [fieldName]: mappedSavedData[fieldName] }));
      setOriginalData(prev => ({ ...prev, [fieldName]: mappedSavedData[fieldName] }));

      toast({
        title: "Saved",
        description: `${fieldName.replace('_', ' ')} updated successfully.`,
      });

      return true;
    } catch (error: any) {
      console.error(`Error saving ${fieldName}:`, error);
      setSaveError(error.message || `Failed to save ${fieldName}`);
      toast({
        title: "Save Error",
        description: error.message || `Failed to save ${fieldName}.`,
        variant: "destructive"
      });
      // Revert form data to original on error
      setFormData(prev => ({ ...prev, [fieldName]: originalData[fieldName] }));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user?.id, formData, originalData, toast]);

  const saveAllFields = useCallback(async (changeReason?: string): Promise<boolean> => {
    if (!projectId || !user?.id) {
      toast({
        title: "Save Error",
        description: "Project ID or User ID is missing. Cannot save.",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const payload: ProfitLossSavePayload = {
        ...profitLossApiService.mapFormToSavePayload(formData),
        change_reason: changeReason || 'Updated P&L data'
      };

      const savedData = await profitLossApiService.saveProfitLossData(projectId, payload);
      const mappedSavedData = profitLossApiService.mapApiToForm(savedData);

      setFormData(mappedSavedData);
      setOriginalData(mappedSavedData);

      toast({
        title: "All Changes Saved",
        description: "All profit & loss data saved successfully.",
      });

      return true;
    } catch (error: any) {
      console.error('Error saving all P&L data:', error);
      setSaveError(error.message || 'Failed to save P&L data');
      toast({
        title: "Save Error",
        description: error.message || "Failed to save profit & loss data.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user?.id, formData, toast]);

  const hasChanged = useCallback((fieldName: keyof ProfitLossFormData) => {
    return formData[fieldName] !== originalData[fieldName];
  }, [formData, originalData]);

  const hasUnsavedChanges = useCallback(() => {
    for (const key in formData) {
      if (formData[key as keyof ProfitLossFormData] !== originalData[key as keyof ProfitLossFormData]) {
        return true;
      }
    }
    return false;
  }, [formData, originalData]);

  const updateFormField = useCallback((fieldName: keyof ProfitLossFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [fieldName]: value };
      
      // Auto-calculate derived fields for immediate feedback
      const calculatedFields = profitLossApiService.calculateDerivedValues(updated);
      
      return { ...updated, ...calculatedFields };
    });
  }, []);

  const validateForm = useCallback(() => {
    return profitLossApiService.validateFormData(formData);
  }, [formData]);

  const resetForm = useCallback(() => {
    const initialData = profitLossApiService.getInitialFormData();
    setFormData(initialData);
    setOriginalData(initialData);
    setSaveError(null);
  }, []);

  const revertChanges = useCallback(() => {
    setFormData(originalData);
    setSaveError(null);
    toast({
      title: "Changes Reverted",
      description: "All unsaved changes have been discarded.",
    });
  }, [originalData, toast]);

  return {
    // Data
    formData,
    originalData,
    
    // State
    isLoading,
    isSaving,
    saveError,
    
    // Actions
    setFormData,
    updateFormField,
    saveField,
    saveAllFields,
    loadData,
    resetForm,
    revertChanges,
    
    // Helpers
    hasChanged,
    hasUnsavedChanges,
    validateForm
  };
};