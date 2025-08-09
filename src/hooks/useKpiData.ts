import { useState, useEffect, useCallback } from 'react';
import { kpiApiService } from '../services/api/kpiApiService';
import { useToast } from './use-toast';
import {
  MonthlyKpi,
  QuarterlyKpi,
  YearlyKpi,
  KpiCalculationRun,
  KpiValidationResponse,
  KpiCalculationResponse,
  KpiDataResponse,
  KpiHistoryResponse,
  KpiRestoreResponse
} from '../types/kpi';

interface UseKpiDataProps {
  projectId: string;
}

export const useKpiData = ({ projectId }: UseKpiDataProps) => {
  const { toast } = useToast();
  
  // State for data
  const [monthlyKpis, setMonthlyKpis] = useState<MonthlyKpi[]>([]);
  const [quarterlyKpis, setQuarterlyKpis] = useState<QuarterlyKpi[]>([]);
  const [yearlyKpis, setYearlyKpis] = useState<YearlyKpi[]>([]);
  
  // State for validation
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  
  // State for calculation history
  const [monthlyHistory, setMonthlyHistory] = useState<KpiCalculationRun[]>([]);
  const [quarterlyHistory, setQuarterlyHistory] = useState<KpiCalculationRun[]>([]);
  const [yearlyHistory, setYearlyHistory] = useState<KpiCalculationRun[]>([]);
  
  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  
  // State for selected calculation run
  const [selectedCalculationRun, setSelectedCalculationRun] = useState<string | null>(null);

  // Load validation status
  const loadValidation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await kpiApiService.validateData(projectId);
      
      if (response.success) {
        setValidationStatus({
          valid: response.success,
          message: response.message
        });
      } else {
        setValidationStatus({
          valid: false,
          message: response.message
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to validate data';
      setError(errorMessage);
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Load calculation history
  const loadCalculationHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [monthlyResponse, quarterlyResponse, yearlyResponse] = await Promise.all([
        kpiApiService.getMonthlyKpiCalculationHistory(projectId),
        kpiApiService.getQuarterlyKpiCalculationHistory(projectId),
        kpiApiService.getYearlyKpiCalculationHistory(projectId)
      ]);
      
      if (monthlyResponse.success) {
        setMonthlyHistory(monthlyResponse.data);
      }
      
      if (quarterlyResponse.success) {
        setQuarterlyHistory(quarterlyResponse.data);
      }
      
      if (yearlyResponse.success) {
        setYearlyHistory(yearlyResponse.data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load calculation history';
      setError(errorMessage);
      toast({
        title: "History Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Load KPI data
  const loadKpiData = useCallback(async (calculationRunId?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [monthlyResponse, quarterlyResponse, yearlyResponse] = await Promise.all([
        kpiApiService.getMonthlyKpis(projectId, calculationRunId),
        kpiApiService.getQuarterlyKpis(projectId, calculationRunId),
        kpiApiService.getYearlyKpis(projectId, calculationRunId)
      ]);
      
      if (monthlyResponse.success) {
        setMonthlyKpis(monthlyResponse.data as MonthlyKpi[]);
      }
      
      if (quarterlyResponse.success) {
        setQuarterlyKpis(quarterlyResponse.data as QuarterlyKpi[]);
      }
      
      if (yearlyResponse.success) {
        setYearlyKpis(yearlyResponse.data as YearlyKpi[]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load KPI data';
      setError(errorMessage);
      toast({
        title: "Data Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Perform KPI calculation
  const performCalculation = useCallback(async () => {
    try {
      setCalculating(true);
      setError(null);
      
      const response = await kpiApiService.performCalculation(projectId);
      
      if (response.success) {
        toast({
          title: "Calculation Successful",
          description: response.message,
          variant: "default"
        });
        
        // Reload data and history
        await Promise.all([
          loadKpiData(),
          loadCalculationHistory()
        ]);
        
        setSelectedCalculationRun(response.calculationRunId || null);
      } else {
        throw new Error(response.error || 'Calculation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Calculation failed';
      setError(errorMessage);
      toast({
        title: "Calculation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  }, [projectId, loadKpiData, loadCalculationHistory, toast]);

  // Restore calculation run
  const restoreCalculationRun = useCallback(async (runId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await kpiApiService.restoreCalculationRun(projectId, runId);
      
      if (response.success) {
        setMonthlyKpis(response.data.monthlyKpis);
        setQuarterlyKpis(response.data.quarterlyKpis);
        setYearlyKpis(response.data.yearlyKpis);
        setSelectedCalculationRun(runId);
        
        toast({
          title: "Restore Successful",
          description: "Calculation run restored successfully",
          variant: "default"
        });
      } else {
        throw new Error(response.error || 'Restore failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Restore failed';
      setError(errorMessage);
      toast({
        title: "Restore Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  // Export data
  const exportData = useCallback(async (type: 'monthly' | 'quarterly' | 'yearly') => {
    try {
      let data: MonthlyKpi[] | QuarterlyKpi[] | YearlyKpi[];
      
      switch (type) {
        case 'monthly':
          data = monthlyKpis;
          break;
        case 'quarterly':
          data = quarterlyKpis;
          break;
        case 'yearly':
          data = yearlyKpis;
          break;
        default:
          throw new Error('Invalid data type');
      }
      
      if (data.length === 0) {
        toast({
          title: "Export Error",
          description: "No data available to export",
          variant: "destructive"
        });
        return;
      }
      
      await kpiApiService.exportToExcel(projectId, data, type);
      
      toast({
        title: "Export Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} KPIs exported successfully`,
        variant: "default"
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      toast({
        title: "Export Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [projectId, monthlyKpis, quarterlyKpis, yearlyKpis, toast]);

  // Load initial data
  useEffect(() => {
    if (projectId) {
      loadValidation();
      loadCalculationHistory();
      loadKpiData();
    }
  }, [projectId, loadValidation, loadCalculationHistory, loadKpiData]);

  return {
    // Data
    monthlyKpis,
    quarterlyKpis,
    yearlyKpis,
    
    // Validation
    validationStatus,
    
    // History
    monthlyHistory,
    quarterlyHistory,
    yearlyHistory,
    
    // Loading states
    loading,
    calculating,
    error,
    
    // Selected run
    selectedCalculationRun,
    setSelectedCalculationRun,
    
    // Actions
    loadValidation,
    loadCalculationHistory,
    loadKpiData,
    performCalculation,
    restoreCalculationRun,
    exportData
  };
}; 