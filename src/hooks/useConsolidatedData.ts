import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { consolidatedApiService } from '../services/api/consolidatedApiService';
import {
    MonthlyConsolidatedData,
    QuarterlyConsolidatedData,
    YearlyConsolidatedData,
    ConsolidatedValidationResult,
    ConsolidatedCalculationResult,
    CalculationRun,
    ConsolidatedTabType
} from '../types/consolidated';
import { useAuthStore } from '../stores/authStore';

interface UseConsolidatedDataProps {
    projectId: string;
    tabType: ConsolidatedTabType;
}

export const useConsolidatedData = ({ projectId, tabType }: UseConsolidatedDataProps) => {
    const { toast } = useToast();
    const { user } = useAuthStore();

    // State for data
    const [monthlyData, setMonthlyData] = useState<MonthlyConsolidatedData[]>([]);
    const [quarterlyData, setQuarterlyData] = useState<QuarterlyConsolidatedData[]>([]);
    const [yearlyData, setYearlyData] = useState<YearlyConsolidatedData[]>([]);

    // State for validation
    const [validation, setValidation] = useState<ConsolidatedValidationResult | null>(null);

    // State for calculation history
    const [monthlyHistory, setMonthlyHistory] = useState<CalculationRun[]>([]);
    const [quarterlyHistory, setQuarterlyHistory] = useState<CalculationRun[]>([]);
    const [yearlyHistory, setYearlyHistory] = useState<CalculationRun[]>([]);

    // State for loading and errors
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for selected calculation run
    const [selectedCalculationRunId, setSelectedCalculationRunId] = useState<string | null>(null);

    // Load validation status
    const loadValidation = useCallback(async () => {
        if (!projectId) return;

        setValidating(true);
        setError(null);

        try {
            let validationResult: ConsolidatedValidationResult;

            switch (tabType) {
                case 'monthly':
                    validationResult = await consolidatedApiService.validateMonthlyData(projectId);
                    break;
                case 'quarterly':
                    validationResult = await consolidatedApiService.validateQuarterlyData(projectId);
                    break;
                case 'yearly':
                    validationResult = await consolidatedApiService.validateYearlyData(projectId);
                    break;
                default:
                    throw new Error('Invalid tab type');
            }

            setValidation(validationResult);

            if (!validationResult.success) {
                toast({
                    title: "Validation Failed",
                    description: validationResult.error || "Data validation failed",
                    variant: "destructive"
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Validation failed';
            setError(errorMessage);
            toast({
                title: "Validation Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setValidating(false);
        }
    }, [projectId, tabType, toast]);

    // Load calculation history
    const loadCalculationHistory = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        setError(null);

        try {
            let history: CalculationRun[];

            switch (tabType) {
                case 'monthly':
                    const monthlyHistoryResult = await consolidatedApiService.getMonthlyCalculationHistory(projectId);
                    history = monthlyHistoryResult.history;
                    setMonthlyHistory(history);
                    break;
                case 'quarterly':
                    const quarterlyHistoryResult = await consolidatedApiService.getQuarterlyCalculationHistory(projectId);
                    history = quarterlyHistoryResult.history;
                    setQuarterlyHistory(history);
                    break;
                case 'yearly':
                    const yearlyHistoryResult = await consolidatedApiService.getYearlyCalculationHistory(projectId);
                    history = yearlyHistoryResult.history;
                    setYearlyHistory(history);
                    break;
                default:
                    throw new Error('Invalid tab type');
            }

            // Set the latest calculation run as selected if available
            if (history.length > 0) {
                setSelectedCalculationRunId(history[0].id);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load calculation history';
            setError(errorMessage);
            toast({
                title: "History Load Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, tabType, toast]);

    // Load consolidated data
    const loadConsolidatedData = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        setError(null);

        try {
            switch (tabType) {
                case 'monthly':
                    const monthlyResult = await consolidatedApiService.getMonthlyConsolidated(
                        projectId, 
                        selectedCalculationRunId || undefined
                    );
                    setMonthlyData(monthlyResult.data as MonthlyConsolidatedData[]);
                    break;
                case 'quarterly':
                    const quarterlyResult = await consolidatedApiService.getQuarterlyConsolidated(
                        projectId, 
                        selectedCalculationRunId || undefined
                    );
                    setQuarterlyData(quarterlyResult.data as QuarterlyConsolidatedData[]);
                    break;
                case 'yearly':
                    const yearlyResult = await consolidatedApiService.getYearlyConsolidated(
                        projectId, 
                        selectedCalculationRunId || undefined
                    );
                    setYearlyData(yearlyResult.data as YearlyConsolidatedData[]);
                    break;
                default:
                    throw new Error('Invalid tab type');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load consolidated data';
            setError(errorMessage);
            toast({
                title: "Data Load Error",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [projectId, tabType, selectedCalculationRunId, toast]);

    // Perform calculation
    const performCalculation = useCallback(async () => {
        if (!projectId) return;

        setCalculating(true);
        setError(null);

        try {
            let result: ConsolidatedCalculationResult;

            switch (tabType) {
                case 'monthly':
                    result = await consolidatedApiService.performMonthlyCalculation(projectId);
                    break;
                case 'quarterly':
                    result = await consolidatedApiService.performQuarterlyCalculation(projectId);
                    break;
                case 'yearly':
                    result = await consolidatedApiService.performYearlyCalculation(projectId);
                    break;
                default:
                    throw new Error('Invalid tab type');
            }

            if (result.success) {
                toast({
                    title: "Calculation Successful",
                    description: result.message || "Calculation completed successfully",
                    variant: "default"
                });

                // Reload data and history
                await Promise.all([
                    loadCalculationHistory(),
                    loadConsolidatedData()
                ]);
            } else {
                throw new Error(result.error || 'Calculation failed');
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
    }, [projectId, tabType, loadCalculationHistory, loadConsolidatedData, toast]);

    // Restore calculation run
    const restoreCalculationRun = useCallback(async (runId: string) => {
        if (!projectId) return;

        try {
            const result = await consolidatedApiService.restoreCalculationRun(projectId, runId, tabType);
            
            if (result.success) {
                setSelectedCalculationRunId(runId);
                await loadConsolidatedData();
                
                toast({
                    title: "Calculation Restored",
                    description: "Calculation run restored successfully",
                    variant: "default"
                });
            } else {
                throw new Error(result.error || 'Failed to restore calculation run');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to restore calculation run';
            setError(errorMessage);
            toast({
                title: "Restore Error",
                description: errorMessage,
                variant: "destructive"
            });
        }
    }, [projectId, tabType, loadConsolidatedData, toast]);

    // Export data
    const exportData = useCallback(async () => {
        if (!projectId) return;

        try {
            const blob = await consolidatedApiService.exportToExcel(
                projectId, 
                tabType, 
                selectedCalculationRunId || undefined
            );
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${tabType}_consolidated_data.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Export Successful",
                description: "Data exported successfully",
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
    }, [projectId, tabType, selectedCalculationRunId, toast]);

    // Load data on mount and when dependencies change
    useEffect(() => {
        if (projectId && user) {
            loadValidation();
            loadCalculationHistory();
        }
    }, [projectId, user, loadValidation, loadCalculationHistory]);

    // Load consolidated data when selected calculation run changes
    useEffect(() => {
        if (projectId && selectedCalculationRunId) {
            loadConsolidatedData();
        }
    }, [projectId, selectedCalculationRunId, loadConsolidatedData]);

    // Get current data based on tab type
    const getCurrentData = () => {
        switch (tabType) {
            case 'monthly':
                return monthlyData;
            case 'quarterly':
                return quarterlyData;
            case 'yearly':
                return yearlyData;
            default:
                return [];
        }
    };

    // Get current history based on tab type
    const getCurrentHistory = () => {
        switch (tabType) {
            case 'monthly':
                return monthlyHistory;
            case 'quarterly':
                return quarterlyHistory;
            case 'yearly':
                return yearlyHistory;
            default:
                return [];
        }
    };

    return {
        // Data
        monthlyData,
        quarterlyData,
        yearlyData,
        currentData: getCurrentData(),
        currentHistory: getCurrentHistory(),
        
        // State
        validation,
        loading,
        validating,
        calculating,
        error,
        selectedCalculationRunId,
        
        // Actions
        performCalculation,
        restoreCalculationRun,
        exportData,
        setSelectedCalculationRunId,
        loadValidation,
        loadCalculationHistory,
        loadConsolidatedData
    };
}; 