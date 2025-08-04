import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { subscriptionService } from "@/services";
import {
  CheckCircle,
  Calendar,
  CreditCard,
  FileText,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Wait a moment for Stripe to process, then check subscription status
      setTimeout(() => {
        checkSubscriptionStatus();
      }, 2000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const checkSubscriptionStatus = async () => {
    try {
      const data = await subscriptionService.checkSubscription();
      
      setSubscriptionStatus(data);
      
      if (data.subscribed) {
        toast({
          title: "Welcome to your subscription!",
          description: `You're now subscribed to the ${data.subscription_tier} plan.`,
        });
      } else {
        toast({
          title: "Payment successful!",
          description: "Your one-time payment has been processed successfully.",
        });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Payment processed",
        description: "Your payment was successful. Subscription status will update shortly.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await subscriptionService.openCustomerPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Success Card */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-green-100 dark:bg-green-900/20 w-fit">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-800 dark:text-green-200">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-green-700 dark:text-green-300">
              Thank you for your payment. Your transaction has been processed successfully.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Subscription Details */}
        {subscriptionStatus?.subscribed && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <Badge variant="outline" className="font-medium">
                  {subscriptionStatus.subscription_tier}
                </Badge>
              </div>
              
              {subscriptionStatus.subscription_end && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next billing date:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {new Date(subscriptionStatus.subscription_end).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleManageSubscription}
                  variant="outline" 
                  className="w-full"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="p-1 rounded-full bg-primary text-primary-foreground text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                  1
                </div>
                <div>
                  <p className="font-medium">Start Your Financial Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Access the data entry section to input your financial information
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="p-1 rounded-full bg-primary text-primary-foreground text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                  2
                </div>
                <div>
                  <p className="font-medium">Review Your KPIs</p>
                  <p className="text-sm text-muted-foreground">
                    Check your dashboard for automated financial calculations and insights
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="p-1 rounded-full bg-primary text-primary-foreground text-xs font-bold min-w-[24px] h-6 flex items-center justify-center">
                  3
                </div>
                <div>
                  <p className="font-medium">Generate Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Export professional reports for your stakeholders
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                onClick={() => navigate('/data-entry')}
                variant="outline"
                className="w-full"
              >
                Start Data Entry
                <FileText className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Info */}
        {sessionId && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>Transaction ID: {sessionId}</p>
                <p className="mt-2">
                  A receipt has been sent to your email address.
                  Need help? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/help')}>Contact Support</Button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}