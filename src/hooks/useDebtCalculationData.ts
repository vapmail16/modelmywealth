import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { debtCalculationApiService } from '../services/api/debtCalculationApiService';
import {
  DebtCalculationDetails,
  DebtCalculationFormData,
  DebtCalculationValidationResult,
  CalculationRunDetails,
  DebtCalculationSummary
} from '../types/debtCalculation';

interface UseDebtCalculationDataProps {
  projectId: string;
}

interface UseDebtCalculationDataReturn {
  // Data states
  calculations: DebtCalculationDetails[];
  calculationHistory: CalculationRunDetails[];
  validationResult: DebtCalculationValidationResult | null;
  
  // Loading states
  isLoading: boolean;
  isCalculating: boolean;
  isLoadingHistory: boolean;
  
  // Error states
  calculationError: string | null;
  loadError: string | null;
  
  // Actions
  performCalculation: (changeReason?: string) => Promise<void>;
  loadCalculations: (runId?: string) => Promise<void>;
  loadCalculationHistory: () => Promise<void>;
  validateData: () => Promise<void>;
  exportToExcel: () => Promise<void>;
  
  // Summary data
  calculationSummary: DebtCalculationSummary | null;
}

export const useDebtCalculationData = ({ projectId }: UseDebtCalculationDataProps): UseDebtCalculationDataReturn => {
  const { toast } = useToast();
  
  // Data states
  const [calculations, setCalculations] = useState<DebtCalculationDetails[]>([]);
  const [calculationHistory, setCalculationHistory] = useState<CalculationRunDetails[]>([]);
  const [validationResult, setValidationResult] = useState<DebtCalculationValidationResult | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Error states
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Summary data
  const [calculationSummary, setCalculationSummary] = useState<DebtCalculationSummary | null>(null);

  /**
   * Validate required data before calculation
   */
  const validateData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      
      const result = await debtCalculationApiService.validateCalculationData(projectId);
      setValidationResult(result);
      
      if (!result.isValid) {
        toast({
          title: "Validation Failed",
          description: result.missingFields || "Required data is missing",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setLoadError(errorMessage);
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  /**
   * Perform debt calculation
   */
  const performCalculation = useCallback(async (changeReason?: string) => {
    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      // First validate data
      const validation = await debtCalculationApiService.validateCalculationData(projectId);
      if (!validation.isValid) {
        throw new Error(validation.missingFields || 'Required data is missing');
      }
      
      // Perform calculation
      const result = await debtCalculationApiService.performDebtCalculation(projectId, changeReason);
      
      // Update state with results
      setCalculations(result.results);
      setCalculationSummary({
        total_months: result.summary.total_months,
        total_principal: result.summary.total_principal,
        total_interest: result.summary.total_interest,
        final_balance: result.summary.final_balance,
        execution_time_ms: result.summary.execution_time_ms,
        calculation_run_id: result.calculationRun.id
      });
      
      // Update history
      await loadCalculationHistory();
      
      toast({
        title: "Calculation Complete",
        description: `Successfully calculated ${result.results.length} months of debt schedule`,
        variant: "default"
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed';
      setCalculationError(errorMessage);
      toast({
        title: "Calculation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  }, [projectId, toast]);

  /**
   * Load existing calculations
   */
  const loadCalculations = useCallback(async (runId?: string) => {
    try {
      console.log('loadCalculations called with runId:', runId);
      setIsLoading(true);
      setLoadError(null);
      
      let data;
      if (runId && runId.trim() !== '') {
        // Restore from specific calculation run
        console.log('Restoring calculation run:', runId);
        data = await debtCalculationApiService.restoreCalculationRun(runId, projectId);
        toast({
          title: "Calculation Restored",
          description: `Successfully restored calculation from ${data.length} months`,
          variant: "default"
        });
      } else {
        // Load current calculations
        console.log('Loading current calculations');
        data = await debtCalculationApiService.getDebtCalculations(projectId);
      }
      
      setCalculations(data);
      
      // Calculate summary if we have data
      if (data.length > 0) {
        const firstMonth = data[0];
        const lastMonth = data[data.length - 1];
        
        setCalculationSummary({
          total_months: data.length,
          total_principal: firstMonth.opening_balance,
          total_interest: lastMonth.cumulative_interest,
          final_balance: lastMonth.closing_balance,
          execution_time_ms: 0, // Not available for loaded data
          calculation_run_id: '' // Not available for loaded data
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load calculations';
      setLoadError(errorMessage);
      toast({
        title: "Load Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [projectId, toast]);

  /**
   * Load calculation history
   */
  const loadCalculationHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      
      const history = await debtCalculationApiService.getCalculationHistory(projectId);
      setCalculationHistory(history);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load calculation history';
      toast({
        title: "History Load Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId, toast]);

  /**
   * Export calculations to Excel
   */
  const exportToExcel = useCallback(async () => {
    try {
      const blob = await debtCalculationApiService.exportToExcel(projectId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debt_calculations_${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Debt calculations exported to Excel successfully",
        variant: "default"
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast({
        title: "Export Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [projectId, toast]);

  // Load data on mount
  useEffect(() => {
    if (projectId) {
      // Force load current calculations without any runId
      loadCalculations(undefined);
      loadCalculationHistory();
      validateData();
    }
  }, [projectId, loadCalculations, loadCalculationHistory, validateData]);

  return {
    // Data states
    calculations,
    calculationHistory,
    validationResult,
    
    // Loading states
    isLoading,
    isCalculating,
    isLoadingHistory,
    
    // Error states
    calculationError,
    loadError,
    
    // Actions
    performCalculation,
    loadCalculations,
    loadCalculationHistory,
    validateData,
    exportToExcel,
    
    // Summary data
    calculationSummary
  };
}; 