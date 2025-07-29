import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Building,
  TrendingUp,
  DollarSign,
  Save,
  Download,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DataEntry() {
  const [currentStep, setCurrentStep] = useState("profit-loss");
  const [formData, setFormData] = useState({
    revenue: "",
    cogs: "",
    opex: "",
    ebitda: "",
    interest: "",
    debt: "",
    equity: "",
    growth: "",
  });

  const steps = [
    { id: "profit-loss", title: "P&L Data", icon: Calculator, completed: false },
    { id: "balance-sheet", title: "Balance Sheet", icon: Building, completed: false },
    { id: "debt-structure", title: "Debt Structure", icon: DollarSign, completed: false },
    { id: "projections", title: "Projections", icon: TrendingUp, completed: false },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEBITDA = () => {
    const revenue = parseFloat(formData.revenue) || 0;
    const cogs = parseFloat(formData.cogs) || 0;
    const opex = parseFloat(formData.opex) || 0;
    return revenue - cogs - opex;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground font-franklin">Financial Data Entry</h1>
          <p className="text-muted-foreground mt-1">
            Enter your financial data for comprehensive debt restructuring analysis
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Data Entry Progress</CardTitle>
          <CardDescription>Complete all sections for accurate analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={25} className="h-2" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    currentStep === step.id
                      ? "bg-primary/10 border-primary"
                      : step.completed
                      ? "bg-success/10 border-success"
                      : "bg-secondary/50 border-border hover:bg-secondary"
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`p-2 rounded-md ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : step.completed
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.completed ? "Complete" : "Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            {/* Profit & Loss */}
            <TabsContent value="profit-loss">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Profit & Loss Statement
                  </CardTitle>
                  <CardDescription>
                    Enter your annual P&L data for the most recent fiscal year
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Annual Revenue ($M)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        placeholder="125.5"
                        value={formData.revenue}
                        onChange={(e) => handleInputChange("revenue", e.target.value)}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cogs">Cost of Goods Sold ($M)</Label>
                      <Input
                        id="cogs"
                        type="number"
                        placeholder="75.2"
                        value={formData.cogs}
                        onChange={(e) => handleInputChange("cogs", e.target.value)}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opex">Operating Expenses ($M)</Label>
                      <Input
                        id="opex"
                        type="number"
                        placeholder="25.8"
                        value={formData.opex}
                        onChange={(e) => handleInputChange("opex", e.target.value)}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interest">Interest Expense ($M)</Label>
                      <Input
                        id="interest"
                        type="number"
                        placeholder="4.2"
                        value={formData.interest}
                        onChange={(e) => handleInputChange("interest", e.target.value)}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Calculated EBITDA:</span>
                      <span className="text-lg font-bold text-accent">
                        ${calculateEBITDA().toFixed(1)}M
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically calculated from your inputs
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any important context about your P&L data..."
                      className="min-h-[100px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Balance Sheet */}
            <TabsContent value="balance-sheet">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Balance Sheet Data
                  </CardTitle>
                  <CardDescription>
                    Key balance sheet items for debt analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Assets</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Cash & Equivalents ($M)</Label>
                          <Input type="number" placeholder="8.7" className="text-right" />
                        </div>
                        <div>
                          <Label>Accounts Receivable ($M)</Label>
                          <Input type="number" placeholder="15.2" className="text-right" />
                        </div>
                        <div>
                          <Label>Inventory ($M)</Label>
                          <Input type="number" placeholder="22.5" className="text-right" />
                        </div>
                        <div>
                          <Label>PP&E, Net ($M)</Label>
                          <Input type="number" placeholder="85.3" className="text-right" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-primary">Liabilities & Equity</h4>
                      <div className="space-y-3">
                        <div>
                          <Label>Accounts Payable ($M)</Label>
                          <Input type="number" placeholder="12.1" className="text-right" />
                        </div>
                        <div>
                          <Label>Short-term Debt ($M)</Label>
                          <Input type="number" placeholder="5.5" className="text-right" />
                        </div>
                        <div>
                          <Label>Long-term Debt ($M)</Label>
                          <Input type="number" placeholder="39.7" className="text-right" />
                        </div>
                        <div>
                          <Label>Total Equity ($M)</Label>
                          <Input type="number" placeholder="74.4" className="text-right" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Debt Structure */}
            <TabsContent value="debt-structure">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Debt Structure Details
                  </CardTitle>
                  <CardDescription>
                    Detailed breakdown of your debt instruments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Debt structure configuration coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projections */}
            <TabsContent value="projections">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Growth Projections
                  </CardTitle>
                  <CardDescription>
                    Future growth assumptions and scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Projections interface coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" disabled>
              Previous
            </Button>
            <Button className="gap-2">
              Next Step
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Validation Status */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Validation Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="text-sm font-medium">Data Format</p>
                  <p className="text-xs text-success">Valid</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-sm font-medium">Completeness</p>
                  <p className="text-xs text-warning">25% Complete</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Balance Check</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">💡 Pro Tip</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use trailing twelve months (TTM) data for the most accurate analysis
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg">
                <p className="text-sm font-medium text-accent">⚡ Speed Up</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Import your data directly from Excel or CSV files
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}