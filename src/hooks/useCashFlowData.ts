import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { cashFlowApiService } from '@/services/api/cashFlowApiService';
import type {
  CashFlowFormData,
  CashFlowDetails,
  CashFlowAuditEntry,
  CashFlowValidationErrors
} from '@/types/cashFlow';

interface UseCashFlowDataProps {
  projectId: string;
}

export const useCashFlowData = ({ projectId }: UseCashFlowDataProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CashFlowFormData>(cashFlowApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<CashFlowDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<CashFlowValidationErrors>({});
  const [auditHistory, setAuditHistory] = useState<CashFlowAuditEntry[]>([]);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!projectId) return;

    try {
      setIsLoading(true);
      const response = await cashFlowApiService.loadCashFlowData(projectId);
      if (response.data) {
        const formattedData = cashFlowApiService.transformApiToFormData(response.data);
        setFormData(formattedData);
        setOriginalData(response.data);
      } else {
        setFormData(cashFlowApiService.getEmptyFormData());
        setOriginalData(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cash flow data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load audit history
  const loadAuditHistory = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await cashFlowApiService.getAuditHistory(projectId);
      setAuditHistory(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit history",
        variant: "destructive"
      });
    }
  }, [projectId, toast]);

  // Set a single field value
  const setFieldValue = (fieldName: keyof CashFlowFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  };

  // Save a single field
  const saveField = async (fieldName: keyof CashFlowFormData, value: string) => {
    if (!projectId) return;
    if (!hasFieldChanged(fieldName)) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await cashFlowApiService.saveField(
        projectId,
        fieldName,
        value,
        `Updated ${fieldName}`
      );

      if (response.data) {
        const formattedData = cashFlowApiService.transformApiToFormData(response.data);
        setFormData(formattedData);
        setOriginalData(response.data);

        if (response.audit?.changesDetected) {
          toast({
            title: "Success",
            description: `${fieldName} updated successfully`,
          });
          await loadAuditHistory();
        }
      }
    } catch (error) {
      setSaveError(`Failed to save ${fieldName}`);
      toast({
        title: "Error",
        description: `Failed to save ${fieldName}`,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Save all changed fields
  const saveAllFields = async () => {
    if (!projectId || !hasChanged) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const response = await cashFlowApiService.saveCashFlowData(
        projectId,
        formData,
        'Updated multiple fields'
      );

      if (response.data) {
        const formattedData = cashFlowApiService.transformApiToFormData(response.data);
        setFormData(formattedData);
        setOriginalData(response.data);

        if (response.audit?.changesDetected) {
          toast({
            title: "Success",
            description: "All changes saved successfully",
          });
          await loadAuditHistory();
        }
      }
    } catch (error) {
      setSaveError('Failed to save changes');
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset form to original data
  const resetForm = () => {
    if (originalData) {
      setFormData(cashFlowApiService.transformApiToFormData(originalData));
    } else {
      setFormData(cashFlowApiService.getEmptyFormData());
    }
    setValidationErrors({});
  };

  // Revert changes
  const revertChanges = () => {
    resetForm();
    toast({
      title: "Success",
      description: "Changes reverted successfully",
    });
  };

  // Check if a specific field has changed
  const hasFieldChanged = (fieldName: keyof CashFlowFormData) => {
    if (!originalData) return false;
    const originalValue = originalData[fieldName as keyof CashFlowDetails];
    const currentValue = formData[fieldName];
    
    // Handle null/undefined/empty string equivalencies
    if (originalValue === null && currentValue === '') return false;
    if (originalValue === null && currentValue !== '') return true;
    if (originalValue !== null && currentValue === '') return true;
    
    // Handle numeric comparisons
    if (originalValue !== null && currentValue !== '') {
      const originalNum = parseFloat(originalValue.toString());
      const currentNum = parseFloat(currentValue);
      
      if (!isNaN(originalNum) && !isNaN(currentNum)) {
        return originalNum !== currentNum;
      } else {
        // Fallback to string comparison for non-numeric values
        return originalValue.toString() !== currentValue;
      }
    }
    
    return false;
  };

  // Check if any field has changed
  const hasChanged = Object.keys(formData).some(
    key => hasFieldChanged(key as keyof CashFlowFormData)
  );

  // Check if there are unsaved changes
  const hasUnsavedChanges = hasChanged;

  // Validate form data
  const validateForm = (): boolean => {
    const errors: CashFlowValidationErrors = {};
    let isValid = true;

    // Add validation rules as needed
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && isNaN(parseFloat(value))) {
        errors[key] = 'Must be a valid number';
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  return {
    formData,
    originalData,
    isLoading,
    isSaving,
    saveError,
    validationErrors,
    auditHistory,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    hasChanged,
    hasUnsavedChanges,
    validateForm,
    hasFieldChanged,
    loadAuditHistory
  };
};