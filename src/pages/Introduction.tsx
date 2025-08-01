import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Building, Target, CheckCircle, TrendingUp, DollarSign, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Introduction() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const handleEmailSubmit = () => {
    if (email && companyName) {
      toast({
        title: "Welcome to TTF-Refinancing Dashboard",
        description: "Your onboarding process has started. Check your email for next steps.",
      });
      setCurrentStep(2);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Make Faster Decisions with Debt",
      description: "Streamlined debt analysis and decision-making tools to accelerate your refinancing process",
      highlight: true
    },
    {
      icon: DollarSign,
      title: "Refinance/Restructure Faster",
      description: "Optimize your refinancing workflow with automated calculations and scenario modeling",
      highlight: true
    },
    {
      icon: Shield,
      title: "Governance & Compliance",
      description: "Built-in covenant monitoring and governance framework to ensure regulatory compliance",
      highlight: false
    },
    {
      icon: Building,
      title: "Model My Wealth",
      description: "Advanced financial modeling to optimize your wealth and business structure",
      highlight: false
    }
  ];

  const benefits = [
    "Reduce refinancing timeline by 60%",
    "Automated covenant monitoring & alerts",
    "Real-time scenario analysis & stress testing", 
    "Industry benchmarking & peer comparison",
    "Collaborative workspace for internal & external stakeholders",
    "Custom KPI tracking & reporting"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            TTF-Refinancing Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Model My Wealth - Transform your debt restructuring process with intelligent analytics, 
            faster decision-making, and comprehensive governance tools.
          </p>
          
          {currentStep === 1 && (
            <Card className="max-w-md mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Get Started Today
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button 
                  onClick={handleEmailSubmit}
                  className="w-full gap-2"
                  disabled={!email || !companyName}
                >
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="max-w-md mx-auto shadow-lg border-green-200">
              <CardContent className="pt-6 text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold">Welcome to TTF Dashboard!</h3>
                <p className="text-sm text-muted-foreground">
                  Check your email for onboarding instructions and your personalized dashboard access.
                </p>
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Start Another Company
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Key Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Core Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className={`shadow-lg ${feature.highlight ? 'border-primary/50 bg-primary/5' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className={`h-6 w-6 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                      {feature.title}
                      {feature.highlight && <Badge variant="default" className="ml-auto">Core</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose TTF Dashboard?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sub Story Section */}
        <Card className="shadow-lg mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-6 w-6" />
              Your Success Story Starts Here
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Input Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your financial statements and business context with our guided data entry system.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Analyze & Model</h3>
                <p className="text-sm text-muted-foreground">
                  Run scenario analysis, stress tests, and compare against industry benchmarks automatically.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Execute with Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Make informed refinancing decisions backed by comprehensive analytics and compliance monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Refinancing Process?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading companies who have accelerated their debt restructuring with TTF Dashboard's 
            intelligent analytics and governance tools.
          </p>
          {currentStep === 1 ? (
            <Button size="lg" className="gap-2" onClick={() => {
              const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
              emailInput?.focus();
            }}>
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" variant="outline" onClick={() => setCurrentStep(1)}>
              Register Another Company
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}