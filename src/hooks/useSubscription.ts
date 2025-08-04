import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      setStatus(prev => ({ ...prev, loading: true }));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus({ subscribed: false, loading: false });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      setStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      window.open(data.url, '_blank');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setTimeout(checkSubscription, 1000); // Small delay to allow for session to be fully established
      } else if (event === 'SIGNED_OUT') {
        setStatus({ subscribed: false, loading: false });
      }
    });

    return () => subscription.unsubscribe();
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