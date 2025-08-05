import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Target, Percent } from "lucide-react";

interface GrowthProjectionsData {
  // Projection Settings
  projectionYears: string;
  capexAsPercentOfRevenue: string;
  depreciationYears: string;
  
  // Working Capital
  workingCapitalDays: string;
  workingCapitalAccountsReceivable: string;
  workingCapitalInventory: string;
  workingCapitalAccountsPayable: string;
  
  // Revenue Growth Rates
  revenueGrowthYear1: string;
  revenueGrowthYear2: string;
  revenueGrowthYear3: string;
  revenueGrowthYear4: string;
  revenueGrowthYear5: string;
  
  // EBITDA Margins
  ebitdaMarginYear1: string;
  ebitdaMarginYear2: string;
  ebitdaMarginYear3: string;
  ebitdaMarginYear4: string;
  ebitdaMarginYear5: string;
  
  // Growth Scenarios
  baseScenarioName: string;
  baseScenarioDescription: string;
  baseScenarioProbability: string;
  optimisticScenarioName: string;
  optimisticScenarioDescription: string;
  optimisticScenarioProbability: string;
  pessimisticScenarioName: string;
  pessimisticScenarioDescription: string;
  pessimisticScenarioProbability: string;
}

interface GrowthProjectionsFormProps {
  data: GrowthProjectionsData;
  onChange: (data: Partial<GrowthProjectionsData>) => void;
}

export default function GrowthProjectionsForm({ data, onChange }: GrowthProjectionsFormProps) {
  const renderInput = (key: keyof GrowthProjectionsData, label: string, placeholder: string, type: string = "number") => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        value={data[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  const renderTextarea = (key: keyof GrowthProjectionsData, label: string, placeholder: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Textarea
        id={key}
        value={data[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
        rows={2}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Growth Projections & Assumptions
        </CardTitle>
        <CardDescription>
          Define growth assumptions and projection parameters for financial modeling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="projections" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="growth-rates">Growth Rates</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="projections" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Projection Parameters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('projectionYears', 'Projection Years', 'Number of years to project (e.g., 5)')}
                {renderInput('depreciationYears', 'Depreciation Years', 'Asset depreciation period in years')}
                {renderInput('capexAsPercentOfRevenue', 'Capex as % of Revenue', 'Capital expenditure as percentage of revenue')}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Working Capital Assumptions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('workingCapitalDays', 'Working Capital Days', 'Total working capital days')}
                {renderInput('workingCapitalAccountsReceivable', 'Accounts Receivable Days', 'Days sales outstanding')}
                {renderInput('workingCapitalInventory', 'Inventory Days', 'Days inventory outstanding')}
                {renderInput('workingCapitalAccountsPayable', 'Accounts Payable Days', 'Days payable outstanding')}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="growth-rates" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Revenue Growth Rates by Year (%)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('revenueGrowthYear1', 'Year 1 Growth', 'Revenue growth % for year 1')}
                {renderInput('revenueGrowthYear2', 'Year 2 Growth', 'Revenue growth % for year 2')}
                {renderInput('revenueGrowthYear3', 'Year 3 Growth', 'Revenue growth % for year 3')}
                {renderInput('revenueGrowthYear4', 'Year 4 Growth', 'Revenue growth % for year 4')}
                {renderInput('revenueGrowthYear5', 'Year 5 Growth', 'Revenue growth % for year 5')}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">EBITDA Margins by Year (%)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInput('ebitdaMarginYear1', 'Year 1 EBITDA Margin', 'EBITDA margin % for year 1')}
                {renderInput('ebitdaMarginYear2', 'Year 2 EBITDA Margin', 'EBITDA margin % for year 2')}
                {renderInput('ebitdaMarginYear3', 'Year 3 EBITDA Margin', 'EBITDA margin % for year 3')}
                {renderInput('ebitdaMarginYear4', 'Year 4 EBITDA Margin', 'EBITDA margin % for year 4')}
                {renderInput('ebitdaMarginYear5', 'Year 5 EBITDA Margin', 'EBITDA margin % for year 5')}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="scenarios" className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Base Case Scenario</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('baseScenarioName', 'Scenario Name', 'Base Case', 'text')}
                {renderInput('baseScenarioProbability', 'Probability (%)', 'Probability of scenario')}
                {renderTextarea('baseScenarioDescription', 'Description', 'Describe the base case assumptions and rationale')}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Optimistic Scenario</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('optimisticScenarioName', 'Scenario Name', 'Optimistic Case', 'text')}
                {renderInput('optimisticScenarioProbability', 'Probability (%)', 'Probability of scenario')}
                {renderTextarea('optimisticScenarioDescription', 'Description', 'Describe the optimistic case assumptions and drivers')}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Pessimistic Scenario</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('pessimisticScenarioName', 'Scenario Name', 'Pessimistic Case', 'text')}
                {renderInput('pessimisticScenarioProbability', 'Probability (%)', 'Probability of scenario')}
                {renderTextarea('pessimisticScenarioDescription', 'Description', 'Describe the pessimistic case assumptions and risks')}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}