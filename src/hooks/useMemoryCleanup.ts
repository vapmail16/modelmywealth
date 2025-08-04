import { useEffect, useCallback, useRef, useState } from 'react';
import { logger } from '@/services/logging/LoggingService';

interface UseMemoryCleanupOptions {
  timers?: NodeJS.Timeout[];
  intervals?: NodeJS.Timeout[];
  eventListeners?: Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }>;
  subscriptions?: Array<{
    unsubscribe: () => void;
  }>;
}

export function useMemoryCleanup(options: UseMemoryCleanupOptions = {}) {
  const timerRefs = useRef<NodeJS.Timeout[]>(options.timers || []);
  const intervalRefs = useRef<NodeJS.Timeout[]>(options.intervals || []);
  const listenerRefs = useRef<Array<{
    element: EventTarget;
    event: string;
    handler: EventListener;
  }>>(options.eventListeners || []);
  const subscriptionRefs = useRef<Array<{
    unsubscribe: () => void;
  }>>(options.subscriptions || []);

  const addTimer = useCallback((timer: NodeJS.Timeout) => {
    timerRefs.current.push(timer);
    return timer;
  }, []);

  const addInterval = useCallback((interval: NodeJS.Timeout) => {
    intervalRefs.current.push(interval);
    return interval;
  }, []);

  const addEventListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    listenerRefs.current.push({ element, event, handler });
  }, []);

  const addSubscription = useCallback((subscription: { unsubscribe: () => void }) => {
    subscriptionRefs.current.push(subscription);
    return subscription;
  }, []);

  const cleanup = useCallback(() => {
    // Clear timers
    timerRefs.current.forEach(timer => {
      clearTimeout(timer);
    });
    timerRefs.current = [];

    // Clear intervals
    intervalRefs.current.forEach(interval => {
      clearInterval(interval);
    });
    intervalRefs.current = [];

    // Remove event listeners
    listenerRefs.current.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        logger.warn('Failed to remove event listener', { error }, 'useMemoryCleanup');
      }
    });
    listenerRefs.current = [];

    // Unsubscribe from subscriptions
    subscriptionRefs.current.forEach(subscription => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        logger.warn('Failed to unsubscribe', { error }, 'useMemoryCleanup');
      }
    });
    subscriptionRefs.current = [];

    logger.debug('Memory cleanup completed', {}, 'useMemoryCleanup');
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    addTimer,
    addInterval,
    addEventListener,
    addSubscription,
    cleanup,
  };
}

// Enhanced error boundary hook
export function useErrorBoundary() {
  const handleError = useCallback((error: Error, errorInfo?: { componentStack: string }) => {
    logger.error('Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
    }, 'useErrorBoundary');
  }, []);

  return { handleError };
}

// Type-safe form validation hook
interface ValidationRule<T> {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
}

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  rules: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>
) {
  const [fields, setFields] = useState<Record<keyof T, FormField<T[keyof T]>>>(
    Object.keys(initialValues).reduce((acc, key) => {
      const typedKey = key as keyof T;
      acc[typedKey] = {
        value: initialValues[typedKey],
        error: null,
        touched: false,
      };
      return acc;
    }, {} as Record<keyof T, FormField<T[keyof T]>>)
  );

  const validateField = useCallback((key: keyof T, value: T[keyof T]): string | null => {
    const rule = rules[key];
    if (!rule) return null;

    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${String(key)} is required`;
    }

    if (rule.min && typeof value === 'number' && value < rule.min) {
      return `${String(key)} must be at least ${rule.min}`;
    }

    if (rule.max && typeof value === 'number' && value > rule.max) {
      return `${String(key)} must be at most ${rule.max}`;
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return `${String(key)} format is invalid`;
    }

    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const updateField = useCallback((key: keyof T, value: T[keyof T]) => {
    setFields(prev => ({
      ...prev,
      [key]: {
        value,
        error: validateField(key, value),
        touched: true,
      },
    }));
  }, [validateField]);

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const updatedFields = { ...fields };

    Object.keys(fields).forEach(key => {
      const typedKey = key as keyof T;
      const error = validateField(typedKey, fields[typedKey].value);
      updatedFields[typedKey] = {
        ...updatedFields[typedKey],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFields(updatedFields);
    return isValid;
  }, [fields, validateField]);

  const getValues = useCallback((): T => {
    return Object.keys(fields).reduce((acc, key) => {
      const typedKey = key as keyof T;
      acc[typedKey] = fields[typedKey].value;
      return acc;
    }, {} as T);
  }, [fields]);

  return {
    fields,
    updateField,
    validateAll,
    getValues,
    isValid: Object.values(fields).every(field => !field.error),
  };
}