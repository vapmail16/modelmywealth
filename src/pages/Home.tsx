import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { Shield, Users, BarChart3, FileText, Settings, Database } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";

export function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Financial Analytics",
      description: "Comprehensive financial data analysis and reporting tools",
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Secure storage and organization of financial information",
    },
    {
      icon: Users,
      title: "Team Collaboration", 
      description: "Multi-user access with role-based permissions",
    },
    {
      icon: FileText,
      title: "Report Generation",
      description: "Automated reporting and export capabilities",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with comprehensive audit trails",
    },
    {
      icon: Settings,
      title: "Flexible Configuration",
      description: "Customizable workflows and business rules",
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-lg">FinAnalytics</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Get Started
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Financial Analytics Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Comprehensive financial analysis and reporting platform with enterprise-grade 
              security and flexible role-based access control for both technical and business teams.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/auth')}>
                Start Your Analysis
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-background/50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for comprehensive financial analysis and team collaboration
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-border/50 hover:border-border transition-colors">
                  <CardHeader>
                    <feature.icon className="w-8 h-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join teams already using our platform for financial analysis
            </p>
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Your Account
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  return <Navigate to="/dashboard" replace />;
}