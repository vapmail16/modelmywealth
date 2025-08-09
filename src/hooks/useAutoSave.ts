import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { configService } from '@/services/config/ConfigService';

interface AutoSaveOptions {
  debounceDelay?: number;
  enabled?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: any) => void;
}

interface AutoSaveState {
  isSaving: boolean;
  hasPendingSave: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export const useAutoSave = (
  projectId: string,
  section: string,
  data: any,
  options: AutoSaveOptions = {}
) => {
  const {
    debounceDelay = 2000,
    enabled = true,
    onSave,
    onError
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    hasPendingSave: false,
    lastSaved: null,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Cancel pending save when component unmounts or data changes
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-save function
  const saveData = useCallback(async (dataToSave: any) => {
    if (!enabled || !projectId || !section || !user) {
      return;
    }

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/sections/${section}/auto-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ data: dataToSave })
        }
      );

      if (!response.ok) {
        throw new Error(`Auto-save failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasPendingSave: false,
        lastSaved: new Date(),
        error: null
      }));

      onSave?.(result.data);
      
      // Show success toast only for force saves, not auto-saves
      if (options.onSave) {
        toast({
          title: "Saved successfully",
          description: "Your changes have been saved.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Auto-save error:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Auto-save failed'
      }));

      onError?.(error);
      
      toast({
        title: "Save failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId, section, user, enabled, onSave, onError, toast]);

  // Debounced auto-save
  const debouncedSave = useCallback((dataToSave: any) => {
    if (!enabled) return;

    setState(prev => ({ ...prev, hasPendingSave: true }));

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveData(dataToSave);
    }, debounceDelay);
  }, [enabled, debounceDelay, saveData]);

  // Force save immediately
  const forceSave = useCallback(async (dataToSave: any = data) => {
    if (!enabled || !projectId || !section || !user) {
      return;
    }

    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setState(prev => ({ ...prev, hasPendingSave: false }));

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/sections/${section}/force-save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ data: dataToSave })
        }
      );

      if (!response.ok) {
        throw new Error(`Force save failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        error: null
      }));

      onSave?.(result.data);
      
      toast({
        title: "Saved successfully",
        description: "Your changes have been saved immediately.",
        variant: "default"
      });

    } catch (error) {
      console.error('Force save error:', error);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Force save failed'
      }));

      onError?.(error);
      
      toast({
        title: "Save failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    }
  }, [projectId, section, user, enabled, data, onSave, onError, toast]);

  // Cancel pending saves
  const cancelPendingSaves = useCallback(async () => {
    if (!projectId || !user) return;

    try {
      await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/cancel-pending-saves`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setState(prev => ({ ...prev, hasPendingSave: false }));

    } catch (error) {
      console.error('Cancel pending saves error:', error);
    }
  }, [projectId, user]);

  // Get save status
  const getSaveStatus = useCallback(async () => {
    if (!projectId || !section || !user) return;

    try {
      const response = await fetch(
        `${configService.get('api').baseURL}/projects/${projectId}/sections/${section}/save-status`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setState(prev => ({
          ...prev,
          hasPendingSave: result.data.hasPendingSave
        }));
      }
    } catch (error) {
      console.error('Get save status error:', error);
    }
  }, [projectId, section, user]);

  // Auto-save when data changes
  useEffect(() => {
    if (enabled && data && Object.keys(data).length > 0) {
      debouncedSave(data);
    }
  }, [data, enabled, debouncedSave]);

  // Get save status on mount
  useEffect(() => {
    getSaveStatus();
  }, [getSaveStatus]);

  return {
    ...state,
    saveData,
    forceSave,
    cancelPendingSaves,
    getSaveStatus
  };
}; 