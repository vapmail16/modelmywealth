import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  FileText, 
  Video, 
  Mail,
  Search,
  ExternalLink,
  Phone,
  Calendar
} from "lucide-react";

export default function Help() {
  const helpTopics = [
    {
      title: "Getting Started",
      icon: Book,
      items: [
        "Creating your first financial model",
        "Importing data from Excel/CSV",
        "Understanding the dashboard",
        "Setting up project templates"
      ]
    },
    {
      title: "Financial Analysis",
      icon: FileText,
      items: [
        "Debt analysis and ratios",
        "Cash flow projections",
        "KPI calculations",
        "Working capital analysis"
      ]
    },
    {
      title: "Charts & Reports",
      icon: Video,
      items: [
        "Creating custom charts",
        "Exporting reports to PDF",
        "Sharing dashboards",
        "Scheduling automated reports"
      ]
    },
    {
      title: "Troubleshooting",
      icon: HelpCircle,
      items: [
        "Common error messages",
        "Data validation issues",
        "Performance optimization",
        "Browser compatibility"
      ]
    }
  ];

  const quickLinks = [
    { title: "User Guide", description: "Complete documentation", link: "#" },
    { title: "Video Tutorials", description: "Step-by-step guides", link: "#" },
    { title: "API Documentation", description: "Developer resources", link: "#" },
    { title: "Release Notes", description: "Latest updates", link: "#" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and get support
          </p>
        </div>
        <Button className="gap-2">
          <MessageCircle className="h-4 w-4" />
          Contact Support
        </Button>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search help articles..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, index) => (
          <Card key={index} className="shadow-card hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                {link.title}
                <ExternalLink className="h-4 w-4" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {helpTopics.map((topic, index) => {
          const IconComponent = topic.icon;
          return (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-primary" />
                  {topic.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <button className="text-sm text-left hover:text-primary transition-colors w-full">
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Email Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get help via email within 24 hours
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with our support team
            </p>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Online</span>
            </div>
            <Button className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Call
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Book a call with our experts
            </p>
            <Button variant="outline" className="w-full">
              Book Meeting
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">How do I import financial data?</h4>
              <p className="text-sm text-muted-foreground">
                You can import data using Excel/CSV files through the Data Entry page. Supported formats include...
              </p>
            </div>
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">What KPIs are calculated automatically?</h4>
              <p className="text-sm text-muted-foreground">
                The system calculates 12+ key metrics including Debt/EBITDA, DSCR, Interest Coverage, Current Ratio...
              </p>
            </div>
            <div className="border-b pb-4">
              <h4 className="font-medium mb-2">Can I export charts and reports?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can export individual charts or comprehensive reports in PDF, Excel, or PowerPoint formats...
              </p>
            </div>
            <div className="pb-4">
              <h4 className="font-medium mb-2">Is my financial data secure?</h4>
              <p className="text-sm text-muted-foreground">
                All data is encrypted in transit and at rest. We use enterprise-grade security measures including...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Services</span>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Processing</span>
              <Badge variant="default">Operational</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Report Generation</span>
              <Badge variant="default">Operational</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}