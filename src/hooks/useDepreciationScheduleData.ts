import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';
import { depreciationScheduleApiService } from '../services/api/depreciationScheduleApiService';
import { 
  DepreciationScheduleDetails, 
  DepreciationScheduleSummary,
  DepreciationScheduleValidationResult 
} from '../types/depreciationSchedule';

interface UseDepreciationScheduleDataProps {
  projectId: string;
}

interface UseDepreciationScheduleDataReturn {
  // Data states
  schedule: DepreciationScheduleDetails[];
  calculationHistory: any[];
  validationResult: DepreciationScheduleValidationResult | null;
  
  // Loading states
  isLoading: boolean;
  isCalculating: boolean;
  isLoadingHistory: boolean;
  
  // Error states
  calculationError: string | null;
  loadError: string | null;
  
  // Actions
  performCalculation: (changeReason?: string) => Promise<void>;
  loadSchedule: (runId?: string) => Promise<void>;
  loadCalculationHistory: () => Promise<void>;
  validateData: () => Promise<void>;
  exportToExcel: () => Promise<void>;
  
  // Summary data
  scheduleSummary: DepreciationScheduleSummary | null;
}

export const useDepreciationScheduleData = ({ projectId }: UseDepreciationScheduleDataProps): UseDepreciationScheduleDataReturn => {
  const { toast } = useToast();
  
  // Data states
  const [schedule, setSchedule] = useState<DepreciationScheduleDetails[]>([]);
  const [calculationHistory, setCalculationHistory] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<DepreciationScheduleValidationResult | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  // Error states
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Summary data
  const [scheduleSummary, setScheduleSummary] = useState<DepreciationScheduleSummary | null>(null);

  /**
   * Validate required data
   */
  const validateData = useCallback(async () => {
    try {
      const result = await depreciationScheduleApiService.validateCalculationData(projectId);
      setValidationResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      setValidationResult({
        isValid: false,
        missingFields: errorMessage
      });
    }
  }, [projectId]);

  /**
   * Perform depreciation calculation
   */
  const performCalculation = useCallback(async (changeReason?: string) => {
    try {
      setIsCalculating(true);
      setCalculationError(null);
      
      const result = await depreciationScheduleApiService.performDepreciationCalculation(projectId, changeReason);
      
      setSchedule(result.results);
      setScheduleSummary({
        total_months: result.summary.total_months,
        total_depreciation: result.summary.total_depreciation,
        final_net_book_value: result.summary.final_net_book_value,
        execution_time_ms: result.summary.execution_time_ms,
        calculation_run_id: result.calculationRun.id
      });
      
      // Reload history after calculation
      await depreciationScheduleApiService.getCalculationHistory(projectId).then(history => {
        setCalculationHistory(history);
      }).catch(error => {
        console.error('Failed to reload history:', error);
      });
      
      toast({
        title: "Calculation Complete",
        description: `Depreciation schedule calculated successfully with ${result.results.length} months`,
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
   * Load depreciation schedule
   */
  const loadSchedule = useCallback(async (runId?: string) => {
    try {
      console.log('loadSchedule called with runId:', runId);
      setIsLoading(true);
      setLoadError(null);
      
      let data;
      if (runId && runId.trim() !== '') {
        // Restore from specific calculation run
        console.log('Restoring calculation run:', runId);
        data = await depreciationScheduleApiService.restoreCalculationRun(runId, projectId);
        toast({
          title: "Schedule Restored",
          description: `Successfully restored schedule from ${data.length} months`,
          variant: "default"
        });
      } else {
        // Load current schedule
        console.log('Loading current schedule');
        data = await depreciationScheduleApiService.getDepreciationSchedule(projectId);
      }
      
      setSchedule(data);
      
      // Calculate summary if we have data
      if (data.length > 0) {
        const totalDepreciation = data.reduce((sum, row) => sum + row.monthly_depreciation, 0);
        const finalNetBookValue = data[data.length - 1].net_book_value;
        
        setScheduleSummary({
          total_months: data.length,
          total_depreciation: totalDepreciation,
          final_net_book_value: finalNetBookValue,
          execution_time_ms: 0, // Not available for loaded data
          calculation_run_id: '' // Not available for loaded data
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load schedule';
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
      
      const history = await depreciationScheduleApiService.getCalculationHistory(projectId);
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
   * Export schedule to Excel
   */
  const exportToExcel = useCallback(async () => {
    try {
      const blob = await depreciationScheduleApiService.exportToExcel(projectId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `depreciation_schedule_${projectId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: "Depreciation schedule exported to Excel successfully",
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
      // Force load current schedule without any runId
      loadSchedule(undefined);
      loadCalculationHistory();
      validateData();
    }
  }, [projectId, loadSchedule, loadCalculationHistory, validateData]);

  return {
    // Data states
    schedule,
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
    loadSchedule,
    loadCalculationHistory,
    validateData,
    exportToExcel,
    
    // Summary data
    scheduleSummary
  };
}; 