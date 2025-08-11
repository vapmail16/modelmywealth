import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { 
  Shield, Users, BarChart3, FileText, Settings, Database, 
  ArrowRight, CheckCircle, Zap, Star, Globe, Mail, Phone, MapPin,
  Github, Twitter, Linkedin, Heart
} from "lucide-react";
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

  const benefits = [
    "Real-time financial analytics",
    "Enterprise-grade security",
    "Team collaboration tools", 
    "Automated report generation",
    "Custom dashboard creation",
    "24/7 customer support"
  ];

  const stats = [
    { label: "Active Users", value: "10,000+" },
    { label: "Reports Generated", value: "50,000+" },
    { label: "Data Points Analyzed", value: "1M+" },
    { label: "Countries Served", value: "25+" }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                FinAnalytics
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto relative">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="text-center lg:text-left">
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-fade-in bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <Star className="w-4 h-4 mr-2 text-blue-600" />
                  Trusted by 10,000+ teams worldwide
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent animate-fade-in leading-tight">
                  Financial Analytics
                  <br />
                  <span className="text-4xl md:text-6xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in">
                  Transform your financial data into actionable insights with our comprehensive 
                  analytics platform. <span className="text-blue-600 font-semibold">Built for teams</span>, 
                  <span className="text-emerald-600 font-semibold"> secured for enterprises</span>.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12 animate-fade-in">
                  <Button 
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate('/pricing')}
                    className="text-lg px-8 py-6 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                  >
                    View Pricing
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0 animate-fade-in">
                  {stats.slice(0, 2).map((stat, index) => (
                    <div key={index} className="text-center lg:text-left">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Hero Image */}
              <div className="relative animate-fade-in">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-blue-500/20 rounded-full blur-2xl"></div>
                
                {/* Main image container */}
                <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop&crop=center"
                    alt="Financial Analytics Dashboard on MacBook"
                    className="w-full h-80 object-cover"
                  />
                  {/* Overlay with analytics visualization */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800">Live Analytics</h3>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Real-time
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Revenue Growth</span>
                          <span className="text-sm font-semibold text-emerald-600">+23.4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Data Points</span>
                          <span className="text-sm font-semibold text-blue-600">1.2M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -top-8 -left-8 bg-white rounded-lg shadow-lg p-3 border border-blue-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">98% Uptime</span>
                  </div>
                </div>
                
                <div className="absolute -bottom-8 -right-8 bg-white rounded-lg shadow-lg p-3 border border-emerald-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-medium text-gray-700">Bank-grade Security</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 animate-fade-in">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 bg-white/50 backdrop-blur rounded-lg border border-white/20 shadow-sm">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-emerald-50/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                From data collection to insights generation, our platform provides all the tools 
                your team needs for successful financial analysis
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-border/50 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/80 backdrop-blur group"
                >
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 rounded-lg flex items-center justify-center mb-4 transition-all duration-300">
                      <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200 text-emerald-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Why Choose Us
                </Badge>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Built for Modern Finance Teams
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our platform combines powerful analytics with intuitive design, 
                  making complex financial data accessible to everyone on your team.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-emerald-400/20 rounded-2xl blur-3xl"></div>
                <Card className="relative bg-white/90 backdrop-blur border-blue-200 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span>Analytics Dashboard</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gradient-to-r from-blue-400/50 to-blue-300/30 rounded animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-emerald-400/50 to-emerald-300/30 rounded w-3/4 animate-pulse delay-300"></div>
                      <div className="h-4 bg-gradient-to-r from-purple-400/50 to-purple-300/30 rounded w-1/2 animate-pulse delay-700"></div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="h-16 bg-gradient-to-t from-blue-400/30 to-blue-200/10 rounded animate-pulse"></div>
                        <div className="h-20 bg-gradient-to-t from-emerald-400/30 to-emerald-200/10 rounded animate-pulse delay-300"></div>
                        <div className="h-12 bg-gradient-to-t from-purple-400/30 to-purple-200/10 rounded animate-pulse delay-700"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent">
              Ready to Transform Your Analytics?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Join thousands of teams already using our platform to make better financial decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/pricing')}
                className="text-lg px-8 py-6 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
              >
                View Pricing Plans
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">F</span>
                  </div>
                  <span className="font-bold text-lg">FinAnalytics</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Empowering finance teams with intelligent analytics and secure collaboration tools. 
                  Transform your data into actionable insights.
                </p>
                <div className="flex space-x-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Github className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Product */}
              <div className="space-y-4">
                <h4 className="font-semibold">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Features</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground" onClick={() => navigate('/pricing')}>Pricing</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Security</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Integrations</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">API</Button></li>
                </ul>
              </div>

              {/* Company */}
              <div className="space-y-4">
                <h4 className="font-semibold">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">About Us</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Careers</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Blog</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Press Kit</Button></li>
                  <li><Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">Partners</Button></li>
                </ul>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold">Contact</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span>support@finanalytics.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Available Worldwide</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                © 2024 FinAnalytics. All rights reserved.
              </div>
              <div className="flex items-center space-x-6 text-sm">
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Button>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Button>
                <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Button>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>for finance teams</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  return <Navigate to="/dashboard" replace />;
}