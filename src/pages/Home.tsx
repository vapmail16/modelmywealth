import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/stores/authStore";
import { 
  Shield, Users, BarChart3, FileText, Settings, Database, 
  ArrowRight, CheckCircle, Zap, Star, Globe, Mail, Phone, MapPin,
  Github, Twitter, Linkedin, Heart, Calendar, Download, Play, BookOpen,
  Users2, Building2, GraduationCap, Briefcase, ChevronRight, ExternalLink,
  TrendingUp, Calculator, Menu, X
} from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useState } from "react";

// Header Component
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1e293b]/95 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">ModelMyWealth</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#platform" className="text-white hover:text-[#2563eb] transition-colors">
              Platform
            </a>
            <a href="#solutions" className="text-white hover:text-[#2563eb] transition-colors">
              Solutions
            </a>
            <a href="#resources" className="text-white hover:text-[#2563eb] transition-colors">
              Resources
            </a>
            <a href="#demo" className="text-white hover:text-[#2563eb] transition-colors">
              Demo
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-[#2563eb] hover:bg-white/10" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white" onClick={() => navigate('/auth')}>
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#2563eb] hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t border-border">
              <a
                href="#platform"
                className="block px-3 py-2 text-white hover:text-[#2563eb] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Platform
              </a>
              <a
                href="#solutions"
                className="block px-3 py-2 text-white hover:text-[#2563eb] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </a>
              <a
                href="#resources"
                className="block px-3 py-2 text-white hover:text-[#2563eb] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Demo
              </a>
              <div className="pt-4 space-y-2">
                <Button variant="ghost" className="w-full text-white hover:text-[#2563eb] hover:bg-white/10" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
                <Button className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white" onClick={() => navigate('/auth')}>
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// Hero Component
const Hero = () => {
  return (
    <section className="relative pt-20 pb-16 bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1e293b]/90 to-[#0f172a]/90"></div>
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Advanced Financial Models for 
            <span className="text-[#2563eb]"> Faster Investment Decisions</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
            Use our industry-specific models for investment appraisals, project financing, debt refinancing, restructuring and more
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-[#1e293b] font-semibold shadow-lg bg-white/10 backdrop-blur-sm">
              Watch Demo
            </Button>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <TrendingUp className="h-8 w-8 text-[#2563eb] mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Investment Appraisals</h3>
              <p className="text-sm text-white/80">Comprehensive financial modeling for investment decisions</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <BarChart3 className="h-8 w-8 text-[#2563eb] mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Project Financing</h3>
              <p className="text-sm text-white/80">Advanced models for complex project finance structures</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <Calculator className="h-8 w-8 text-[#2563eb] mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Debt Refinancing</h3>
              <p className="text-sm text-white/80">Analyze refinancing scenarios with different terms</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <Shield className="h-8 w-8 text-[#2563eb] mb-4 mx-auto" />
              <h3 className="font-semibold mb-2">Risk Management</h3>
              <p className="text-sm text-white/80">Built-in covenant testing and risk assessment</p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <p className="text-white/70 mb-4">Trusted by financial professionals worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
              <span className="font-semibold">CFA Charterholders</span>
              <span>•</span>
              <span className="font-semibold">Big4 Experience</span>
              <span>•</span>
              <span className="font-semibold">BigTech Expertise</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Platform Component
const Platform = () => {
  return (
    <section id="platform" className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            Leverage Our Industry-Specific Models
          </h2>
          <p className="text-lg text-muted-foreground">
            Models developed by expert team with CFA Charterholders, Chartered Accountants with Big4 and BigTech experience
          </p>
        </div>

        {/* Expert Team Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <GraduationCap className="h-12 w-12 text-[#2563eb] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">CFA Charterholders</h3>
            <p className="text-muted-foreground">
              Models designed by certified financial analysts with deep market expertise
            </p>
          </Card>

          <Card className="p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <Building2 className="h-12 w-12 text-[#2563eb] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">Big4 Experience</h3>
            <p className="text-muted-foreground">
              Chartered Accountants from leading consulting firms bringing enterprise-grade standards
            </p>
          </Card>

          <Card className="p-8 text-center shadow-sm hover:shadow-md transition-all duration-300">
            <Briefcase className="h-12 w-12 text-[#2563eb] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3">BigTech Expertise</h3>
            <p className="text-muted-foreground">
              Technology experts ensuring scalable, robust, and user-friendly platform architecture
            </p>
          </Card>
        </div>

        {/* Industry Models Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8 text-[#1e293b]">
            Industry-Specific Financial Models
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { industry: "Hotels & Restaurants", description: "Hospitality-focused revenue and cost models" },
              { industry: "Real Estate", description: "Property development and investment analysis" },
              { industry: "Construction", description: "Project-based financial modeling and cash flow" },
              { industry: "Manufacturing", description: "Production cost analysis and capacity planning" },
              { industry: "Logistics", description: "Supply chain and transportation cost modeling" },
              { industry: "Retail", description: "Inventory and seasonal revenue forecasting" }
            ].map((model, index) => (
              <Card key={index} className="p-6 border-l-4 border-l-[#2563eb] hover:shadow-md transition-all duration-300">
                <h4 className="font-semibold text-[#1e293b] mb-2">{model.industry}</h4>
                <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  Learn More
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Solutions Component
const Solutions = () => {
  const solutions = [
    {
      image: "/src/assets/homepage/1.jpg",
      title: "Project Financing",
      description: "Comprehensive models for complex project finance structures, cash flow analysis, and risk assessment.",
      features: ["NPV & IRR Analysis", "Sensitivity Testing", "Risk Scenarios", "Debt Sizing"]
    },
    {
      image: "/src/assets/homepage/2.jpg",
      title: "Debt Refinancing", 
      description: "Analyze refinancing opportunities with different rates, maturity periods, and grace periods.",
      features: ["Rate Comparison", "Maturity Analysis", "Grace Period Impact", "Cost-Benefit Analysis"]
    },
    {
      image: "/src/assets/homepage/3.jpg",
      title: "Debt Restructuring",
      description: "Model various restructuring scenarios to optimize debt terms and improve cash flow.",
      features: ["Term Modifications", "Payment Restructuring", "Covenant Adjustments", "Recovery Analysis"]
    },
    {
      image: "/src/assets/homepage/4.jpg",
      title: "Covenant Testing",
      description: "Automated covenant testing with early warning alerts and compliance tracking.",
      features: ["Real-time Monitoring", "Alert Systems", "Compliance Reports", "Risk Assessment"]
    },
    {
      image: "/src/assets/homepage/5.jpg",
      title: "Industry Benchmarking",
      description: "Compare your performance against industry standards and peer companies.",
      features: ["Peer Analysis", "Industry Standards", "Performance Metrics", "Competitive Insights"]
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            Comprehensive Financial Solutions
          </h2>
          <p className="text-lg text-muted-foreground">
            Demonstrate the use cases of our advanced financial modeling platform
          </p>
        </div>

        {/* Solutions Grid with Images */}
        <div className="space-y-16">
          {solutions.map((solution, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              {/* Image */}
              <div className="flex-1">
                <div className="relative group overflow-hidden rounded-2xl shadow-2xl">
                  <img 
                    src={solution.image} 
                    alt={solution.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#1e293b]">
                    {solution.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {solution.description}
                  </p>
                </div>

                <ul className="space-y-3">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-base">
                      <div className="w-2 h-2 bg-[#2563eb] rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white transition-all duration-300">
                  Explore {solution.title}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] rounded-2xl p-12 text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Transform Your Financial Analysis?
          </h3>
          <p className="text-lg mb-8 text-white/90">
            Get access to all industry-specific models and advanced features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" className="bg-white text-[#2563eb] hover:bg-white/90">
              Start Free Trial
            </Button>
            <Button size="lg" className="bg-white text-[#2563eb] hover:text-white">
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Standards Component
const Standards = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            Built for Global Standards
          </h2>
          <p className="text-lg text-muted-foreground">
            Our financial models are designed to comply with international accounting standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="p-8 text-center hover:shadow-md transition-all duration-300">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4 text-lg px-4 py-2">
                US GAAP
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#1e293b]">
              Generally Accepted Accounting Principles
            </h3>
            <p className="text-muted-foreground">
              Models built specifically for US market requirements and regulatory compliance
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-md transition-all duration-300">
            <div className="mb-6">
              <Badge variant="outline" className="mb-4 text-lg px-4 py-2">
                IFRS
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#1e293b]">
              International Financial Reporting Standards
            </h3>
            <p className="text-muted-foreground">
              Global standard compliance for international markets and cross-border transactions
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

// Sectors Component
const Sectors = () => {
  const sectors = [
    {
      title: "Real Estate",
      description: "Specialized models for property development, REITs, and commercial real estate projects",
      status: "Available"
    },
    {
      title: "Infrastructure", 
      description: "Models for transportation, utilities, and public-private partnerships",
      status: "Coming Soon"
    },
    {
      title: "Energy & Renewables",
      description: "Power generation, renewable energy projects, and oil & gas ventures",
      status: "Coming Soon"
    },
    {
      title: "Healthcare",
      description: "Medical facilities, pharmaceutical projects, and healthcare technology ventures",
      status: "Coming Soon"
    },
    {
      title: "Technology",
      description: "Software companies, tech startups, and digital transformation projects",
      status: "Coming Soon"
    },
    {
      title: "Manufacturing",
      description: "Industrial projects, supply chain optimization, and production facilities",
      status: "Coming Soon"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            Industry-Specific Models
          </h2>
          <p className="text-lg text-muted-foreground">
            Tailored financial models for various sectors with industry-specific requirements and best practices
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map((sector, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#1e293b]">{sector.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  sector.status === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {sector.status}
                </span>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                {sector.description}
              </p>
              {sector.status === 'Available' ? (
                <Button variant="outline" size="sm" className="w-full">
                  Explore Models
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-full" disabled>
                  Notify When Available
                </Button>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Don't see your sector? We're continuously expanding our model library.
          </p>
          <Button variant="outline">
            Request Custom Sector Model
          </Button>
        </div>
      </div>
    </section>
  );
};

// Resources Component
const Resources = () => {
  const resourceCategories = [
    {
      icon: FileText,
      title: "White Papers",
      description: "In-depth analysis and research on financial modeling best practices",
      resources: [
        "Advanced Project Finance Modeling",
        "Debt Restructuring Strategies",
        "Industry Benchmark Analysis"
      ]
    },
    {
      icon: Play,
      title: "Video Tutorials",
      description: "Step-by-step guides to maximize your use of ModelMyWealth",
      resources: [
        "Getting Started Guide", 
        "Advanced Feature Walkthrough",
        "Industry Model Deep Dives"
      ]
    },
    {
      icon: BookOpen,
      title: "Documentation", 
      description: "Comprehensive guides and API documentation",
      resources: [
        "User Manual",
        "API Reference",
        "Integration Guides"
      ]
    },
    {
      icon: Users2,
      title: "Community",
      description: "Connect with financial professionals using our platform",
      resources: [
        "User Forums",
        "Expert Q&A Sessions",
        "Success Stories"
      ]
    }
  ];

  const upcomingEvents = [
    {
      date: "Feb 15",
      title: "Webinar: Advanced Debt Modeling Techniques",
      time: "2:00 PM EST",
      type: "Webinar"
    },
    {
      date: "Feb 22", 
      title: "Workshop: Project Finance Fundamentals",
      time: "11:00 AM EST",
      type: "Workshop"
    },
    {
      date: "Mar 1",
      title: "Industry Panel: Real Estate Finance Trends",
      time: "3:00 PM EST", 
      type: "Panel"
    }
  ];

  return (
    <section id="resources" className="py-20 bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            Resources & Learning Center
          </h2>
          <p className="text-lg text-muted-foreground">
            Access comprehensive resources to enhance your financial modeling expertise
          </p>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {resourceCategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-md transition-all duration-300 group">
                <IconComponent className="h-10 w-10 text-[#2563eb] mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold mb-3 text-[#1e293b]">{category.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{category.description}</p>
                <ul className="space-y-2 mb-4">
                  {category.resources.map((resource, resourceIndex) => (
                    <li key={resourceIndex} className="text-xs text-muted-foreground flex items-center">
                      <div className="w-1.5 h-1.5 bg-[#2563eb] rounded-full mr-2"></div>
                      {resource}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" size="sm" className="w-full">
                  Explore
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Featured Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Downloads */}
          <Card className="p-8">
            <div className="flex items-center mb-6">
              <Download className="h-8 w-8 text-[#2563eb] mr-3" />
              <h3 className="text-xl font-semibold text-[#1e293b]">Popular Downloads</h3>
            </div>
            <div className="space-y-4">
              {[
                "Financial Modeling Best Practices Guide",
                "Industry Ratios Benchmark Report 2024",
                "Debt Covenant Analysis Template"
              ].map((download, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="font-medium">{download}</span>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-8">
            <div className="flex items-center mb-6">
              <Calendar className="h-8 w-8 text-[#2563eb] mr-3" />
              <h3 className="text-xl font-semibold text-[#1e293b]">Upcoming Events</h3>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                  <div className="text-center min-w-[60px]">
                    <div className="text-lg font-bold text-[#2563eb]">{event.date}</div>
                    <div className="text-xs text-muted-foreground">{event.time}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{event.title}</h4>
                    <span className="text-xs bg-[#2563eb] text-white px-2 py-1 rounded">
                      {event.type}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Knowledge Base CTA */}
        <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-[#1e293b]">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-lg text-muted-foreground mb-8">
            Our expert support team is here to help you succeed
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
              Contact Support
            </Button>
            <Button variant="outline" size="lg">
              Browse Knowledge Base
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Demo Component
const Demo = () => {
  const demoFeatures = [
    "Live walkthrough of all major features",
    "Industry-specific model demonstration", 
    "Real-time Q&A with financial experts",
    "Customized use case scenarios",
    "Integration and implementation guidance"
  ];

  const demoOptions = [
    {
      title: "Interactive Demo",
      description: "Explore the platform at your own pace with our guided interactive demo",
      duration: "15 minutes",
      type: "Self-guided",
      action: "Start Demo"
    },
    {
      title: "Live Demo Session",
      description: "Schedule a personalized demo with our financial modeling experts",
      duration: "30 minutes", 
      type: "Expert-led",
      action: "Schedule Now"
    },
    {
      title: "Free Trial",
      description: "Get full access to the platform for 14 days with sample datasets",
      duration: "14 days",
      type: "Full access",
      action: "Start Trial"
    }
  ];

  return (
    <section id="demo" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b]">
            See ModelMyWealth in Action
          </h2>
          <p className="text-lg text-muted-foreground">
            Experience the power of advanced financial modeling with our comprehensive demo options
          </p>
        </div>

        {/* Demo Video/Preview */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="relative bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-video bg-[#1e293b]/20 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-20 w-20 mx-auto mb-4 text-[#2563eb]" />
                <h3 className="text-2xl font-bold mb-2">Watch Product Demo</h3>
                <p className="text-white/80 mb-6">See how leading financial professionals use ModelMyWealth</p>
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                  <Play className="mr-2 h-5 w-5" />
                  Play Demo Video
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {demoOptions.map((option, index) => (
            <Card key={index} className="p-8 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-4 text-[#1e293b]">{option.title}</h3>
                <p className="text-muted-foreground mb-6">{option.description}</p>
                
                <div className="flex justify-between items-center mb-6 text-sm">
                  <span className="bg-muted px-3 py-1 rounded-full">
                    {option.duration}
                  </span>
                  <span className="text-[#2563eb] font-semibold">{option.type}</span>
                </div>

                <Button 
                  variant={index === 1 ? "default" : "outline"} 
                  className={`w-full group-hover:scale-105 transition-transform duration-300 ${
                    index === 1 ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white' : ''
                  }`}
                  size="lg"
                >
                  {option.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-[#2563eb] text-white px-3 py-1 text-xs font-semibold">
                  POPULAR
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* What You'll See Section */}
        <div className="bg-gradient-to-b from-background to-secondary rounded-2xl p-12">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#1e293b]">
              What You'll Experience in Our Demo
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {demoFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <div className="inline-flex items-center space-x-2 bg-[#2563eb]/10 px-4 py-2 rounded-full mb-6">
                <Calendar className="h-4 w-4 text-[#2563eb]" />
                <span className="text-[#2563eb] font-semibold">Next available slot: Today at 3:00 PM</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white">
                  Book Live Demo
                </Button>
                <Button variant="outline" size="lg">
                  Try Interactive Demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">Join thousands of financial professionals already using ModelMyWealth</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Setup in minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const footerSections = [
    {
      title: "Platform",
      links: [
        "Financial Models",
        "Industry Solutions", 
        "API Documentation",
        "Integration Guides",
        "Security & Compliance"
      ]
    },
    {
      title: "Solutions",
      links: [
        "Project Financing",
        "Debt Refinancing", 
        "Debt Restructuring",
        "Investment Appraisal",
        "Risk Management"
      ]
    },
    {
      title: "Resources",
      links: [
        "Knowledge Base",
        "Video Tutorials",
        "White Papers",
        "Webinars",
        "Community Forum"
      ]
    },
    {
      title: "Company",
      links: [
        "About Us",
        "Careers",
        "Press Kit",
        "Partner Program",
        "Contact Support"
      ]
    }
  ];

  return (
    <footer className="bg-[#1e293b] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-4">ModelMyWealth</h3>
              <p className="text-white/80 mb-6 max-w-md">
                Advanced financial modeling platform trusted by professionals worldwide. 
                Built by experts with CFA, Big4, and BigTech experience.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-[#2563eb]" />
                  <span className="text-white/80">contact@modelmywealth.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-[#2563eb]" />
                  <span className="text-white/80">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-[#2563eb]" />
                  <span className="text-white/80">New York, NY</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white hover:text-[#1e293b]">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-white/20 text-white hover:bg-white hover:text-[#1e293b]">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a 
                        href="#" 
                        className="text-white/70 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/20" />

        {/* Bottom Bar */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-white/70">
              <p>&copy; 2024 ModelMyWealth. All rights reserved.</p>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <span>Made with expertise by financial professionals</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Home Component
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <Platform />
          <Solutions />
          <Standards />
          <Sectors />
          <Resources />
          <Demo />
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect authenticated users to dashboard
  return <Navigate to="/dashboard" replace />;
}