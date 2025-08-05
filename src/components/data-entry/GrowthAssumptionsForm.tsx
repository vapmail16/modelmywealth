import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface GrowthAssumptionsData {
  gr_revenue_1: string; gr_revenue_2: string; gr_revenue_3: string; gr_revenue_4: string; gr_revenue_5: string;
  gr_revenue_6: string; gr_revenue_7: string; gr_revenue_8: string; gr_revenue_9: string; gr_revenue_10: string;
  gr_revenue_11: string; gr_revenue_12: string;
  gr_cost_1: string; gr_cost_2: string; gr_cost_3: string; gr_cost_4: string; gr_cost_5: string;
  gr_cost_6: string; gr_cost_7: string; gr_cost_8: string; gr_cost_9: string; gr_cost_10: string;
  gr_cost_11: string; gr_cost_12: string;
  gr_cost_oper_1: string; gr_cost_oper_2: string; gr_cost_oper_3: string; gr_cost_oper_4: string; gr_cost_oper_5: string;
  gr_cost_oper_6: string; gr_cost_oper_7: string; gr_cost_oper_8: string; gr_cost_oper_9: string; gr_cost_oper_10: string;
  gr_cost_oper_11: string; gr_cost_oper_12: string;
  gr_capex_1: string; gr_capex_2: string; gr_capex_3: string; gr_capex_4: string; gr_capex_5: string;
  gr_capex_6: string; gr_capex_7: string; gr_capex_8: string; gr_capex_9: string; gr_capex_10: string;
  gr_capex_11: string; gr_capex_12: string;
}

interface GrowthAssumptionsFormProps {
  data: GrowthAssumptionsData;
  onChange: (data: Partial<GrowthAssumptionsData>) => void;
}

export default function GrowthAssumptionsForm({ data, onChange }: GrowthAssumptionsFormProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Growth Projections & Assumptions
        </CardTitle>
        <CardDescription>
          Monthly growth rates for revenue, costs, operating expenses, and capex
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Growth Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Revenue Growth Rates (%)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((month, index) => (
              <div key={`revenue-${index}`} className="space-y-2">
                <Label htmlFor={`gr_revenue_${index + 1}`}>{month}</Label>
                <Input
                  id={`gr_revenue_${index + 1}`}
                  type="number"
                  step="0.01"
                  value={data[`gr_revenue_${index + 1}` as keyof GrowthAssumptionsData]}
                  onChange={(e) => onChange({ [`gr_revenue_${index + 1}`]: e.target.value } as Partial<GrowthAssumptionsData>)}
                  placeholder="%"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cost Growth Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cost Growth Rates (%)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((month, index) => (
              <div key={`cost-${index}`} className="space-y-2">
                <Label htmlFor={`gr_cost_${index + 1}`}>{month}</Label>
                <Input
                  id={`gr_cost_${index + 1}`}
                  type="number"
                  step="0.01"
                  value={data[`gr_cost_${index + 1}` as keyof GrowthAssumptionsData]}
                  onChange={(e) => onChange({ [`gr_cost_${index + 1}`]: e.target.value } as Partial<GrowthAssumptionsData>)}
                  placeholder="%"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Operating Cost Growth Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Operating Cost Growth Rates (%)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((month, index) => (
              <div key={`cost-oper-${index}`} className="space-y-2">
                <Label htmlFor={`gr_cost_oper_${index + 1}`}>{month}</Label>
                <Input
                  id={`gr_cost_oper_${index + 1}`}
                  type="number"
                  step="0.01"
                  value={data[`gr_cost_oper_${index + 1}` as keyof GrowthAssumptionsData]}
                  onChange={(e) => onChange({ [`gr_cost_oper_${index + 1}`]: e.target.value } as Partial<GrowthAssumptionsData>)}
                  placeholder="%"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Capex Growth Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Capex Growth Rates (%)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {months.map((month, index) => (
              <div key={`capex-${index}`} className="space-y-2">
                <Label htmlFor={`gr_capex_${index + 1}`}>{month}</Label>
                <Input
                  id={`gr_capex_${index + 1}`}
                  type="number"
                  step="0.01"
                  value={data[`gr_capex_${index + 1}` as keyof GrowthAssumptionsData]}
                  onChange={(e) => onChange({ [`gr_capex_${index + 1}`]: e.target.value } as Partial<GrowthAssumptionsData>)}
                  placeholder="%"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}