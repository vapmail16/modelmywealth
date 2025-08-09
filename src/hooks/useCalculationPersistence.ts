import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { configService } from '@/services/config/ConfigService';

interface CalculationRun {
  id: string;
  runName: string;
  calculationType: string;
  status: 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  executionTimeMs?: number;
  errorMessage?: string;
  userEmail: string;
  iterationCount: number;
}

interface CalculationPersistenceOptions {
  onRunCreated?: (runId: string) => void;
  onRunCompleted?: (runId: string) => void;
  onRunFailed?: (runId: string, error: string) => void;
}

export const useCalculationPersistence = (
  projectId: string,
  options: CalculationPersistenceOptions = {}
) => {
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [runs, setRuns] = useState<CalculationRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const { user } = useAuthStore();

  // Create a new calculation run
  const createCalculationRun = useCallback(async (
    calculationType: string,
    inputData: any,
    runName?: string
  ) => {
    if (!projectId || !user) {
      throw new Error('Project ID or user not available');
    }

    setIsRunning(true);
    setError(null);

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/calculations/runs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            calculationType,
            inputData,
            runName: runName || `${calculationType}_run_${new Date().toISOString()}`
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create calculation run: ${response.statusText}`);
      }

      const result = await response.json();
      const runId = result.data.runId;

      setCurrentRunId(runId);
      options.onRunCreated?.(runId);

      toast({
        title: "Calculation started",
        description: `Started ${calculationType} calculation`,
        variant: "default"
      });

      return runId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create calculation run';
      setError(errorMessage);
      
      toast({
        title: "Calculation failed",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    } finally {
      setIsRunning(false);
    }
  }, [projectId, user, options, toast]);

  // Complete a calculation run
  const completeCalculationRun = useCallback(async (
    runId: string,
    outputData: any,
    executionTime?: number
  ) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            outputData,
            executionTime
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to complete calculation run: ${response.statusText}`);
      }

      const result = await response.json();
      
      setCurrentRunId(null);
      options.onRunCompleted?.(runId);

      toast({
        title: "Calculation completed",
        description: `Calculation completed in ${result.data.executionTime}ms`,
        variant: "default"
      });

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete calculation run';
      setError(errorMessage);
      
      toast({
        title: "Calculation failed",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  }, [options, toast]);

  // Fail a calculation run
  const failCalculationRun = useCallback(async (
    runId: string,
    errorMessage: string
  ) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId}/fail`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ errorMessage })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark calculation run as failed: ${response.statusText}`);
      }

      setCurrentRunId(null);
      options.onRunFailed?.(runId, errorMessage);

      toast({
        title: "Calculation failed",
        description: errorMessage,
        variant: "destructive"
      });

      return response.json();
    } catch (error) {
      console.error('Failed to mark calculation run as failed:', error);
      throw error;
    }
  }, [options, toast]);

  // Save calculation iteration
  const saveIteration = useCallback(async (
    runId: string,
    iterationNumber: number,
    inputChanges: any,
    outputChanges: any
  ) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId}/iterations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({
            iterationNumber,
            inputChanges,
            outputChanges
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save iteration: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to save iteration:', error);
      throw error;
    }
  }, []);

  // Save calculation schedules
  const saveSchedules = useCallback(async (
    runId: string,
    schedules: Array<{
      type: string;
      month?: number;
      year?: number;
      data: any;
    }>
  ) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId}/schedules`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ schedules })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save schedules: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to save schedules:', error);
      throw error;
    }
  }, []);

  // Get calculation history
  const getCalculationHistory = useCallback(async (limit = 10) => {
    if (!projectId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/calculations/history?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get calculation history: ${response.statusText}`);
      }

      const result = await response.json();
      setRuns(result.data.history);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get calculation history';
      setError(errorMessage);
      
      toast({
        title: "Failed to load history",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, user, toast]);

  // Get calculation run details
  const getCalculationRun = useCallback(async (runId: string) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get calculation run: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get calculation run:', error);
      throw error;
    }
  }, []);

  // Compare two calculation runs
  const compareCalculationRuns = useCallback(async (runId1: string, runId2: string) => {
    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/calculations/runs/${runId1}/compare/${runId2}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to compare calculation runs: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to compare calculation runs:', error);
      throw error;
    }
  }, []);

  // Get calculation statistics
  const getCalculationStats = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/calculations/stats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get calculation stats: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get calculation stats:', error);
      throw error;
    }
  }, [projectId, user]);

  return {
    // State
    currentRunId,
    isRunning,
    runs,
    loading,
    error,

    // Actions
    createCalculationRun,
    completeCalculationRun,
    failCalculationRun,
    saveIteration,
    saveSchedules,
    getCalculationHistory,
    getCalculationRun,
    compareCalculationRuns,
    getCalculationStats
  };
}; 