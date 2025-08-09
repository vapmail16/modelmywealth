import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import debtStructureApiService from '../services/api/debtStructureApiService';
import { 
  DebtStructureFormData, 
  DebtStructureValidationErrors,
  DebtStructureApiResponse 
} from '../types/debtStructure';

export function useDebtStructureData(projectId: string) {
  const [formData, setFormData] = useState<DebtStructureFormData>(debtStructureApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<DebtStructureFormData>(debtStructureApiService.getEmptyFormData());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<DebtStructureValidationErrors>({});
  const { toast } = useToast();

  /**
   * Load data from API
   */
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const data = await debtStructureApiService.loadDebtStructureData(projectId);
      setFormData(data);
      setOriginalData(data);
    } catch (error) {
      console.error('Error loading debt structure data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load data');
      toast({
        title: 'Error',
        description: 'Failed to load debt structure data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  /**
   * Set field value
   */
  const setFieldValue = useCallback((field: keyof DebtStructureFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    setValidationErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  }, []);

  /**
   * Save a single field
   */
  const saveField = useCallback(async (field: keyof DebtStructureFormData, value: string, changeReason?: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const updateData = { [field]: value };
      if (changeReason) {
        updateData.change_reason = changeReason;
      }
      
      const result = await debtStructureApiService.updateDebtStructureFields(projectId, updateData);
      
      if (result.audit?.changesDetected) {
        setLastSaved(new Date());
        setOriginalData(prev => ({ ...prev, [field]: value }));
        toast({
          title: 'Success',
          description: 'Field updated successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Info',
          description: 'No changes detected',
          variant: 'default'
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

  /**
   * Save all form data
   */
  const saveAllFields = useCallback(async (changeReason?: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const dataToSave = changeReason 
        ? { ...formData, change_reason: changeReason }
        : formData;
        
      const result = await debtStructureApiService.saveDebtStructureData(projectId, dataToSave);
      
      if (result.audit?.changesDetected) {
        setLastSaved(new Date());
        setOriginalData(formData);
        toast({
          title: 'Success',
          description: result.audit.isNewRecord 
            ? 'Debt structure data created successfully' 
            : 'Debt structure data updated successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Info',
          description: 'No changes detected',
          variant: 'default'
        });
      }
      
    } catch (error) {
      console.error('Error saving debt structure data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      toast({
        title: 'Error',
        description: 'Failed to save debt structure data',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [projectId, formData, toast]);

  /**
   * Reset form to original data
   */
  const resetForm = useCallback(() => {
    setFormData(originalData);
    setValidationErrors({});
    setSaveError(null);
  }, [originalData]);

  /**
   * Revert changes and reload from server
   */
  const revertChanges = useCallback(async () => {
    await loadData();
    toast({
      title: 'Info',
      description: 'Changes reverted to last saved state',
      variant: 'default'
    });
  }, [loadData, toast]);

  /**
   * Check if form has unsaved changes
   */
  const hasUnsavedChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  }, [formData, originalData]);

  /**
   * Check if specific field has changed
   */
  const hasChanged = useCallback((field: keyof DebtStructureFormData) => {
    return formData[field] !== originalData[field];
  }, [formData, originalData]);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): DebtStructureValidationErrors => {
    const errors: DebtStructureValidationErrors = {};
    
    // Validate numeric fields
    const numericFields: (keyof DebtStructureFormData)[] = [
      'total_debt', 'interest_rate', 'additional_loan_senior_secured', 'bank_base_rate_senior_secured',
      'liquidity_premiums_senior_secured', 'credit_risk_premiums_senior_secured', 'maturity_y_senior_secured',
      'amortization_y_senior_secured', 'additional_loan_short_term', 'bank_base_rate_short_term',
      'liquidity_premiums_short_term', 'credit_risk_premiums_short_term', 'maturity_y_short_term',
      'amortization_y_short_term'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors[field] = 'Must be a valid number';
        } else if (num < 0) {
          errors[field] = 'Must be a positive number';
        }
      }
    });
    
    // Validate interest rate and percentage fields
    const percentageFields: (keyof DebtStructureFormData)[] = [
      'interest_rate', 'bank_base_rate_senior_secured', 'liquidity_premiums_senior_secured',
      'credit_risk_premiums_senior_secured', 'bank_base_rate_short_term', 'liquidity_premiums_short_term',
      'credit_risk_premiums_short_term'
    ];
    
    percentageFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        const num = parseFloat(value);
        if (num < 0 || num > 100) {
          errors[field] = 'Must be between 0 and 100';
        }
      }
    });
    
    // Validate maturity and amortization years
    const yearFields: (keyof DebtStructureFormData)[] = [
      'maturity_y_senior_secured', 'amortization_y_senior_secured', 'maturity_y_short_term', 'amortization_y_short_term'
    ];
    
    yearFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        const num = parseFloat(value);
        if (num < 1) {
          errors[field] = 'Must be at least 1 year';
        }
      }
    });
    
    // Validate date field
    if (formData.maturity_date && formData.maturity_date.trim() !== '') {
      const date = new Date(formData.maturity_date);
      if (isNaN(date.getTime())) {
        errors.maturity_date = 'Must be a valid date';
      }
    }
    
    setValidationErrors(errors);
    return errors;
  }, [formData]);

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      loadData();
    }
  }, [projectId, loadData]);

  return {
    // State
    formData,
    originalData,
    isLoading,
    isSaving,
    saveError,
    lastSaved,
    validationErrors,
    
    // Actions
    loadData,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    hasChanged,
    hasUnsavedChanges,
    validateForm
  };
} 