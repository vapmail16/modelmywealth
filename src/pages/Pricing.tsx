import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { subscriptionService } from "@/services";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  FileText,
  Calculator,
  TrendingUp,
  DollarSign,
  Building,
  Crown,
} from "lucide-react";

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

export default function Pricing() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  const checkAuth = async () => {
    // Auth checking will be handled by the auth store
    // For now, just trigger subscription check if needed
    setUser({ id: 'temp' }); // Temporary user object
  };

  const checkSubscriptionStatus = async () => {
    try {
      const data = await subscriptionService.checkSubscription();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscription = async (tier: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(tier);
    try {
      const { url } = await subscriptionService.createCheckout(tier);

      // Open Stripe checkout in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleOneTimePayment = async (productType: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(productType);
    try {
      const { url } = await subscriptionService.createPayment(productType);

      // Open Stripe checkout in a new tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
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

  const subscriptionPlans = [
    {
      id: "basic",
      name: "Basic",
      price: "$29",
      description: "Perfect for small businesses getting started",
      icon: Building,
      features: [
        "Basic financial analysis",
        "Standard KPI calculations",
        "Up to 5 projects",
        "Monthly reports",
        "Email support"
      ],
      color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
    },
    {
      id: "professional",
      name: "Professional",
      price: "$79",
      description: "For growing companies with advanced needs",
      icon: TrendingUp,
      popular: true,
      features: [
        "Advanced analytics dashboard",
        "Debt optimization suggestions",
        "Unlimited projects",
        "Weekly reports",
        "Export functionality",
        "Priority support",
        "Custom scenarios"
      ],
      color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$199",
      description: "For large organizations requiring full suite",
      icon: Crown,
      features: [
        "Everything in Professional",
        "Custom reporting",
        "API access",
        "Dedicated account manager",
        "White-label options",
        "Advanced integrations",
        "24/7 phone support",
        "Custom training"
      ],
      color: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
    }
  ];

  const oneTimeProducts = [
    {
      id: "analysis",
      name: "Single Analysis Report",
      price: "$49",
      description: "Comprehensive financial analysis for one project",
      icon: FileText,
      features: [
        "Complete P&L analysis",
        "Balance sheet review",
        "Key ratio calculations",
        "Risk assessment",
        "PDF report delivery"
      ]
    },
    {
      id: "review",
      name: "Financial Health Review",
      price: "$149",
      description: "Deep dive into your company's financial position",
      icon: BarChart3,
      features: [
        "Everything in Single Analysis",
        "Cash flow projections",
        "Debt structure analysis",
        "Growth recommendations",
        "Executive summary",
        "Video consultation"
      ]
    },
    {
      id: "restructuring",
      name: "Debt Restructuring Analysis",
      price: "$299",
      description: "Custom debt restructuring recommendations",
      icon: Calculator,
      features: [
        "Everything in Financial Review",
        "Custom restructuring plan",
        "Scenario modeling",
        "Lender negotiation strategy",
        "Implementation timeline",
        "Follow-up consultation"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Financial Analysis Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get the insights you need to make informed financial decisions
          </p>
          
          {subscriptionStatus.subscribed && (
            <div className="mt-6 flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm">
                Current Plan: {subscriptionStatus.subscription_tier}
                {subscriptionStatus.subscription_end && (
                  <span className="ml-2">
                    (Renews {new Date(subscriptionStatus.subscription_end).toLocaleDateString()})
                  </span>
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Monthly Subscriptions</h2>
            <p className="text-muted-foreground">Ongoing access to our financial analysis platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {subscriptionPlans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = subscriptionStatus.subscription_tier === plan.name;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative transition-all duration-300 hover:scale-105 ${plan.color} ${
                    plan.popular ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-green-500 dark:ring-green-400' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500 text-white px-3 py-1">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-foreground mb-2">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      {isCurrentPlan ? (
                        <Button 
                          onClick={handleManageSubscription}
                          variant="outline" 
                          className="w-full"
                        >
                          Manage Subscription
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSubscription(plan.id)}
                          disabled={loading === plan.id}
                          className="w-full"
                          variant={plan.popular ? "default" : "outline"}
                        >
                          {loading === plan.id ? "Processing..." : "Subscribe Now"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator className="my-16" />

        {/* One-Time Products */}
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">One-Time Analysis</h2>
            <p className="text-muted-foreground">Professional reports for specific needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {oneTimeProducts.map((product) => {
              const Icon = product.icon;
              
              return (
                <Card 
                  key={product.id} 
                  className="transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-secondary/10"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {product.price}
                      <span className="text-sm font-normal text-muted-foreground"> one-time</span>
                    </div>
                    <CardDescription className="text-sm">{product.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      <Button
                        onClick={() => handleOneTimePayment(product.id)}
                        disabled={loading === product.id}
                        className="w-full"
                        variant="outline"
                      >
                        {loading === product.id ? "Processing..." : "Purchase Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Questions about our pricing? Need a custom solution?
          </p>
          <Button variant="outline" onClick={() => navigate('/help')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}