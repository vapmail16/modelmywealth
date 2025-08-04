import { useState, useEffect } from 'react';
import { subscriptionService } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
}

export const useSubscription = () => {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    loading: true
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const status = await subscriptionService.checkSubscription();
      setStatus(status);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { url } = await subscriptionService.openCustomerPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSubscription();

    // Listen for auth changes
    const handleAuthChange = () => {
      setTimeout(checkSubscription, 1000);
    };

    // Set up auth state listener
    window.addEventListener('auth-state-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
    };
  }, []);

  return {
    ...status,
    checkSubscription,
    openCustomerPortal,
    hasAccess: (requiredTier?: string) => {
      if (!status.subscribed) return false;
      if (!requiredTier) return true;
      
      const tierLevels = { Basic: 1, Professional: 2, Enterprise: 3 };
      const userLevel = tierLevels[status.subscription_tier as keyof typeof tierLevels] || 0;
      const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0;
      
      return userLevel >= requiredLevel;
    }
  };
};