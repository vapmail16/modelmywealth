import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/services/logging/LoggingService';
import { useMemoryCleanup } from './useMemoryCleanup';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  retries?: number;
  retryDelay?: number;
  cacheKey?: string;
  cacheDuration?: number;
}

// Simple in-memory cache
const apiCache = new Map<string, { data: unknown; timestamp: number; expiry: number }>();

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions = {}
) {
  const {
    immediate = true,
    retries = 2,
    retryDelay = 1000,
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: immediate,
  });

  const { addTimer } = useMemoryCleanup();

  const checkCache = useCallback((key: string): T | null => {
    if (!cacheKey) return null;
    
    const cached = apiCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      logger.debug('Cache hit', { cacheKey: key }, 'useApi');
      return cached.data as T;
    }
    
    if (cached) {
      apiCache.delete(key);
    }
    
    return null;
  }, [cacheKey]);

  const setCache = useCallback((key: string, data: T) => {
    if (!cacheKey) return;
    
    apiCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + cacheDuration,
    });
    
    logger.debug('Cache set', { cacheKey: key }, 'useApi');
  }, [cacheKey, cacheDuration]);

  const executeApiCall = useCallback(async (attemptNumber = 0): Promise<void> => {
    // Check cache first
    if (cacheKey) {
      const cachedData = checkCache(cacheKey);
      if (cachedData) {
        setState({ data: cachedData, error: null, loading: false });
        return;
      }
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const data = await apiCall();
      
      // Cache successful response
      if (cacheKey) {
        setCache(cacheKey, data);
      }
      
      setState({ data, error: null, loading: false });
      
      logger.debug('API call successful', { 
        hasData: !!data, 
        attempt: attemptNumber + 1 
      }, 'useApi');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.warn('API call failed', { 
        error: errorMessage, 
        attempt: attemptNumber + 1,
        maxRetries: retries 
      }, 'useApi');
      
      // Retry logic
      if (attemptNumber < retries) {
        const delay = retryDelay * Math.pow(2, attemptNumber); // Exponential backoff
        
        addTimer(setTimeout(() => {
          executeApiCall(attemptNumber + 1);
        }, delay));
        
        logger.info('Retrying API call', { 
          nextAttempt: attemptNumber + 2, 
          delay 
        }, 'useApi');
        
        return;
      }
      
      setState({ data: null, error: errorMessage, loading: false });
      logger.error('API call failed after all retries', { error: errorMessage }, 'useApi');
    }
  }, [apiCall, retries, retryDelay, cacheKey, checkCache, setCache, addTimer]);

  // Manual trigger function
  const refetch = useCallback(() => {
    executeApiCall();
  }, [executeApiCall]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (cacheKey) {
      apiCache.delete(cacheKey);
      logger.debug('Cache cleared', { cacheKey }, 'useApi');
    }
  }, [cacheKey]);

  useEffect(() => {
    if (immediate) {
      executeApiCall();
    }
  }, [immediate, executeApiCall, ...dependencies]);

  return {
    ...state,
    refetch,
    clearCache,
    isLoading: state.loading,
    isError: !!state.error,
    isSuccess: !!state.data && !state.error,
  };
}

// Hook for managing multiple API calls
export function useApiCollection<T extends Record<string, () => Promise<unknown>>>(
  apiCalls: T,
  options: UseApiOptions = {}
) {
  type Results = {
    [K in keyof T]: T[K] extends () => Promise<infer R> ? ApiResponse<R> : never;
  };

  const [results, setResults] = useState<Results>(() => {
    const initial = {} as Results;
    Object.keys(apiCalls).forEach(key => {
      initial[key as keyof T] = {
        data: null,
        error: null,
        loading: options.immediate !== false,
      } as Results[keyof T];
    });
    return initial;
  });

  const executeAll = useCallback(async () => {
    const promises = Object.entries(apiCalls).map(async ([key, apiCall]) => {
      try {
        const data = await (apiCall as () => Promise<unknown>)();
        return { key, data, error: null };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return { key, data: null, error: errorMessage };
      }
    });

    const results = await Promise.allSettled(promises);
    
    setResults(prev => {
      const newResults = { ...prev };
      results.forEach((result, index) => {
        const key = Object.keys(apiCalls)[index] as keyof T;
        if (result.status === 'fulfilled') {
          newResults[key] = {
            data: result.value.data,
            error: result.value.error,
            loading: false,
          } as Results[keyof T];
        } else {
          newResults[key] = {
            data: null,
            error: result.reason?.message || 'Unknown error',
            loading: false,
          } as Results[keyof T];
        }
      });
      return newResults;
    });
  }, [apiCalls]);

  useEffect(() => {
    if (options.immediate !== false) {
      executeAll();
    }
  }, [executeAll, options.immediate]);

  const isLoading = Object.values(results).some(result => result.loading);
  const hasErrors = Object.values(results).some(result => result.error);
  const isSuccess = Object.values(results).every(result => result.data && !result.error);

  return {
    results,
    executeAll,
    isLoading,
    hasErrors,
    isSuccess,
  };
}