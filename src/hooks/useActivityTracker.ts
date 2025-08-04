import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export function useActivityTracker() {
  const { updateActivity, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Track user activity events
    const activityEvents = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      // Debounce activity updates to avoid excessive calls
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateActivity();
      }, 1000); // Update activity every 1 second at most
    };

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial activity update
    updateActivity();

    // Cleanup
    return () => {
      clearTimeout(activityTimeout);
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, updateActivity]);
}