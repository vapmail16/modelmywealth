import { logger } from '@/services/logging/LoggingService';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { AuthErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true, 
  fallback 
}) => {
  const { user, isAuthenticated, isLoading, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        logger.error('Auth initialization failed', { error: error instanceof Error ? error.message : 'Unknown error' }, 'AuthGuard');
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initAuth();
    }
  }, [initialize, isInitialized]);

  // Show loading state during initialization
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Initializing...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle authentication requirements
  if (requireAuth && (!isAuthenticated || !user)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Redirect to auth page
    window.location.href = '/auth';
    return null;
  }

  return (
    <AuthErrorBoundary>
      {children}
    </AuthErrorBoundary>
  );
};

// Helper hook for protected routes
export const useAuthGuard = (requireAuth = true) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isAuthorized: requireAuth ? isAuthenticated && user : true,
  };
};