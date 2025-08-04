import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  Settings,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Share,
} from "lucide-react";

export default function Reports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const reportTemplates = [
    {
      id: "executive-summary",
      name: "Executive Summary",
      description: "High-level overview for senior management",
      estimatedTime: "2-3 minutes",
      sections: ["Key Metrics", "Financial Highlights", "Risk Assessment", "Recommendations"]
    },
    {
      id: "detailed-analysis",
      name: "Detailed Financial Analysis",
      description: "Comprehensive debt restructuring analysis",
      estimatedTime: "5-7 minutes",
      sections: ["P&L Analysis", "Balance Sheet Review", "Cash Flow", "Debt Structure", "Projections"]
    },
    {
      id: "lender-package",
      name: "Lender Package",
      description: "Professional package for debt negotiations",
      estimatedTime: "8-10 minutes",
      sections: ["Company Overview", "Financial Performance", "Debt Analysis", "Covenant Compliance", "Projections"]
    },
    {
      id: "board-presentation",
      name: "Board Presentation",
      description: "PowerPoint-ready slides for board meetings",
      estimatedTime: "4-6 minutes",
      sections: ["Executive Summary", "Key Charts", "Strategic Options", "Next Steps"]
    }
  ];

  const recentReports = [
    {
      id: "1",
      name: "Q3 2024 Debt Analysis",
      template: "Detailed Analysis",
      created: "2 hours ago",
      status: "completed",
      pages: 15
    },
    {
      id: "2",
      name: "Refinancing Proposal",
      template: "Lender Package",
      created: "1 day ago",
      status: "completed",
      pages: 23
    },
    {
      id: "3",
      name: "Board Update",
      template: "Executive Summary",
      created: "3 days ago",
      status: "completed",
      pages: 8
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate report generation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-franklin">AI Report Generation</h1>
          <p className="text-muted-foreground mt-1">
            Generate professional financial reports with AI-powered insights
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            AI Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Report Configuration */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    Report Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your AI-generated financial report
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  <div className="space-y-3">
                    <Label>Report Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Template Details */}
                  {selectedTemplate && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      {(() => {
                        const template = reportTemplates.find(t => t.id === selectedTemplate);
                        return template ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-primary">{template.name}</h4>
                              <Badge variant="secondary" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {template.estimatedTime}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Included Sections:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {template.sections.map((section, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="h-3 w-3 text-success" />
                                    {section}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Report Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input
                        id="report-title"
                        placeholder="Q4 2024 Debt Restructuring Analysis"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        placeholder="Your Company Inc."
                      />
                    </div>
                  </div>

                  {/* Business Context */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Case / Investment Thesis</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business case type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new-project-financing">New Project Financing</SelectItem>
                          <SelectItem value="existing-debt-refinancing">Existing Debt Refinancing</SelectItem>
                          <SelectItem value="debt-business-restructuring">Debt and Business Restructuring</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Industry Sector</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="financial-services">Financial Services</SelectItem>
                          <SelectItem value="energy">Energy</SelectItem>
                          <SelectItem value="real-estate">Real Estate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Report Audience */}
                  <div className="space-y-2">
                    <Label>Report Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="board-directors">Board of Directors</SelectItem>
                        <SelectItem value="senior-management">Senior Management</SelectItem>
                        <SelectItem value="lenders-banks">Lenders / Banks</SelectItem>
                        <SelectItem value="investors">Investors</SelectItem>
                        <SelectItem value="advisors">Financial Advisors</SelectItem>
                        <SelectItem value="regulatory">Regulatory Bodies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Advanced Options</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="include-charts" defaultChecked />
                        <Label htmlFor="include-charts">Include interactive charts</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="executive-summary" defaultChecked />
                        <Label htmlFor="executive-summary">Generate executive summary</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="recommendations" defaultChecked />
                        <Label htmlFor="recommendations">Include AI recommendations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="appendix" />
                        <Label htmlFor="appendix">Add detailed appendix</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generation Progress */}
              {isGenerating && (
                <Card className="shadow-card border-primary">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                        <span className="font-medium">Generating your report...</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        AI is analyzing your financial data and creating insights. This may take a few minutes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* API Status */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">AI Service Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium">OpenAI GPT-4</p>
                      <p className="text-xs text-success">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <div>
                      <p className="text-sm font-medium">Claude API</p>
                      <p className="text-xs text-warning">API Key Required</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure API Keys
                  </Button>
                </CardContent>
              </Card>

              {/* Generation Button */}
              <Button 
                className="w-full h-12 gap-2 shadow-glow" 
                disabled={!selectedTemplate || isGenerating}
                onClick={handleGenerateReport}
              >
                <Sparkles className="h-5 w-5" />
                {isGenerating ? "Generating..." : "Generate Report"}
              </Button>

              {/* Tips */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Tips for Better Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <p className="text-sm font-medium text-accent">💡 Data Quality</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ensure your financial data is complete for accurate analysis
                    </p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">🎯 Specific Instructions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Add custom instructions for focused insights
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>Your previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="h-10 w-10 text-primary bg-primary/10 p-2 rounded-lg" />
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{report.template}</span>
                          <span>•</span>
                          <span>{report.pages} pages</span>
                          <span>•</span>
                          <span>{report.created}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-success text-success-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((template) => (
              <Card key={template.id} className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {template.name}
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {template.estimatedTime}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Included Sections:</p>
                    <div className="space-y-1">
                      {template.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-success" />
                          {section}
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}