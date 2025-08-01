import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle, Clock, FileText, Users, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockDataService } from '@/services';

export default function Governance() {
  const { toast } = useToast();
  const [selectedCovenant, setSelectedCovenant] = useState<string | null>(null);

  // Use centralized mock data service
  const covenants = mockDataService.getMockCovenantData();
  const governanceItems = mockDataService.getMockGovernanceItems();

  const handleCovenantClick = (covenantId: string) => {
    setSelectedCovenant(covenantId);
    toast({
      title: "Covenant Details",
      description: `Viewing details for ${covenants.find(c => c.id === covenantId)?.name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Governance & Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Covenant monitoring, governance requirements, and compliance tracking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Covenant Compliance Overview */}
      <Card className="shadow-card border-green-200">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Covenant Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Compliance</span>
              <span className="text-sm text-green-600">5/5 Compliant</span>
            </div>
            <Progress value={100} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {covenants.map((covenant) => (
              <Card 
                key={covenant.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCovenant === covenant.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCovenantClick(covenant.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{covenant.name}</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Threshold:</span>
                      <span className="font-medium">{covenant.threshold}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current:</span>
                      <span className="font-bold text-green-600">{covenant.current}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Buffer:</span>
                      <span className="font-medium">{covenant.buffer.toFixed(1)}%</span>
                    </div>
                    <Badge variant="default" className="w-full justify-center text-xs">
                      Next Test: {covenant.nextTest}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Governance Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {governanceItems.map((section, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                {section.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">Due: {item.dueDate}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "current" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {item.status === "scheduled" && <Clock className="h-4 w-4 text-blue-500" />}
                    {item.status === "pending" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <Badge 
                      variant={item.status === "current" ? "default" : item.status === "scheduled" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Covenant Detail View */}
      {selectedCovenant && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">
              Covenant Details: {covenants.find(c => c.id === selectedCovenant)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {covenants.find(c => c.id === selectedCovenant)?.current}
                </div>
                <div className="text-sm font-medium mt-1">Current Value</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">
                  {covenants.find(c => c.id === selectedCovenant)?.threshold}
                </div>
                <div className="text-sm font-medium mt-1">Required Threshold</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {covenants.find(c => c.id === selectedCovenant)?.buffer.toFixed(1)}%
                </div>
                <div className="text-sm font-medium mt-1">Safety Buffer</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {covenants.find(c => c.id === selectedCovenant)?.nextTest}
                </div>
                <div className="text-sm font-medium mt-1">Next Test Date</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Monitoring */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Monitoring & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-green-600">Low Risk</div>
              <div className="text-sm text-muted-foreground mt-1">All covenants compliant</div>
              <div className="text-xs mt-2">Minimum buffer: 45.6%</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-blue-600">Early Warning</div>
              <div className="text-sm text-muted-foreground mt-1">Buffer threshold: 25%</div>
              <div className="text-xs mt-2">No covenants at risk</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-yellow-600">Monitoring</div>
              <div className="text-sm text-muted-foreground mt-1">Quarterly review cycle</div>
              <div className="text-xs mt-2">Next review: Q2 2024</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}