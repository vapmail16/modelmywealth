import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { balanceSheetApiService } from '@/services/api/balanceSheetApiService';
import {
  BalanceSheetFormData,
  BalanceSheetValidationErrors,
  BalanceSheetSaveState
} from '@/types/balanceSheet';

/**
 * React Hook for managing balance sheet data state and interactions
 * 
 * Provides:
 * - Form data state management
 * - Loading and saving states
 * - Field-level updates
 * - Validation
 * - Audit trail access
 * - Change detection
 */
export function useBalanceSheetData(projectId: string) {
  // Form data state
  const [formData, setFormData] = useState<BalanceSheetFormData>(balanceSheetApiService.getEmptyFormData());
  const [originalData, setOriginalData] = useState<BalanceSheetFormData>(balanceSheetApiService.getEmptyFormData());
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<BalanceSheetValidationErrors>({});
  
  const { toast } = useToast();

  /**
   * Load balance sheet data for the project
   */
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setSaveError(null);
    
    try {
      const data = await balanceSheetApiService.loadBalanceSheetData(projectId);
      setFormData(data);
      setOriginalData(data);
      setValidationErrors({});
    } catch (error) {
      console.error('Error loading balance sheet data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to load data');
      toast({
        title: 'Error',
        description: 'Failed to load balance sheet data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  /**
   * Set a field value in the form
   */
  const setFieldValue = useCallback((field: keyof BalanceSheetFormData, value: string) => {
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
  const saveField = useCallback(async (field: keyof BalanceSheetFormData, value: string) => {
    if (!projectId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await balanceSheetApiService.saveField(projectId, field, value);
      
      if (result.audit?.changesDetected) {
        setLastSaved(new Date());
        toast({
          title: 'Success',
          description: `${field.replace(/_/g, ' ')} updated successfully`,
          variant: 'default'
        });
      }
      
      // Update original data to reflect the saved state
      setOriginalData(prev => ({
        ...prev,
        [field]: value
      }));
      
    } catch (error) {
      console.error('Error saving field:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save field');
      toast({
        title: 'Error',
        description: `Failed to save ${field.replace(/_/g, ' ')}`,
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
        
      const result = await balanceSheetApiService.saveBalanceSheetData(projectId, dataToSave);
      
      if (result.audit?.changesDetected) {
        setLastSaved(new Date());
        setOriginalData(formData);
        toast({
          title: 'Success',
          description: result.audit.isNewRecord 
            ? 'Balance sheet data created successfully' 
            : 'Balance sheet data updated successfully',
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
      console.error('Error saving balance sheet data:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save data');
      toast({
        title: 'Error',
        description: 'Failed to save balance sheet data',
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
  const hasChanged = useCallback((field: keyof BalanceSheetFormData) => {
    return formData[field] !== originalData[field];
  }, [formData, originalData]);

  /**
   * Validate form data
   */
  const validateForm = useCallback((): BalanceSheetValidationErrors => {
    const errors: BalanceSheetValidationErrors = {};
    
    // Validate numeric fields
    const numericFields: (keyof BalanceSheetFormData)[] = [
      'cash', 'accounts_receivable', 'inventory', 'prepaid_expenses', 'other_current_assets',
      'total_current_assets', 'ppe', 'intangible_assets', 'goodwill', 'other_assets',
      'total_assets', 'accounts_payable', 'accrued_expenses', 'short_term_debt',
      'other_current_liabilities', 'total_current_liabilities', 'long_term_debt',
      'other_liabilities', 'total_liabilities', 'common_stock', 'retained_earnings',
      'other_equity', 'total_equity', 'total_liabilities_equity',
      'capital_expenditure_additions', 'asset_depreciated_over_years'
    ];
    
    numericFields.forEach(field => {
      const value = formData[field];
      if (value && value.trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          errors[field] = 'Must be a valid number';
        } else if (field !== 'retained_earnings' && num < 0) {
          errors[field] = 'Must be a positive number';
        }
      }
    });
    
    // Special validation for asset_depreciated_over_years
    if (formData.asset_depreciated_over_years && formData.asset_depreciated_over_years.trim() !== '') {
      const num = parseFloat(formData.asset_depreciated_over_years);
      if (isNaN(num) || num < 1 || num > 50) {
        errors.asset_depreciated_over_years = 'Must be between 1 and 50 years';
      }
    }
    
    setValidationErrors(errors);
    return errors;
  }, [formData]);

  /**
   * Get changed fields
   */
  const getChangedFields = useCallback(() => {
    const changed: Partial<BalanceSheetFormData> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof BalanceSheetFormData;
      if (formData[field] !== originalData[field]) {
        changed[field] = formData[field];
      }
    });
    return changed;
  }, [formData, originalData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save state object for UI components
  const saveState: BalanceSheetSaveState = {
    isSaving,
    isLoading,
    lastSaved,
    hasUnsavedChanges: hasUnsavedChanges(),
    saveError,
    validationErrors
  };

  return {
    // State
    formData,
    originalData,
    saveState,
    
    // Actions
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    loadData,
    
    // Utilities
    hasChanged,
    hasUnsavedChanges,
    validateForm,
    getChangedFields
  };
} 