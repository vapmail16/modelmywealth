import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowUpDown } from "lucide-react";

interface CashFlowData {
  operating_cash_flow: string;
  capital_expenditures: string;
  free_cash_flow: string;
  debt_service: string;
}

interface CashFlowFormProps {
  data: CashFlowData;
  onChange: (data: Partial<CashFlowData>) => void;
}

export default function CashFlowForm({ data, onChange }: CashFlowFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5" />
          Cash Flow Data
        </CardTitle>
        <CardDescription>
          Cash flow statement information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="operating_cash_flow">Operating Cash Flow *</Label>
            <Input
              id="operating_cash_flow"
              type="number"
              step="0.01"
              min="0"
              required
              value={data.operating_cash_flow}
              onChange={(e) => onChange({ operating_cash_flow: e.target.value })}
              placeholder="Operating cash flow in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capital_expenditures">Capital Expenditures *</Label>
            <Input
              id="capital_expenditures"
              type="number"
              step="0.01"
              min="0"
              required
              value={data.capital_expenditures}
              onChange={(e) => onChange({ capital_expenditures: e.target.value })}
              placeholder="Capital expenditures in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="free_cash_flow">Free Cash Flow</Label>
            <Input
              id="free_cash_flow"
              type="number"
              step="0.01"
              value={data.free_cash_flow}
              onChange={(e) => onChange({ free_cash_flow: e.target.value })}
              placeholder="Auto-calculated: Operating CF - Capex"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="debt_service">Debt Service</Label>
            <Input
              id="debt_service"
              type="number"
              step="0.01"
              min="0"
              value={data.debt_service}
              onChange={(e) => onChange({ debt_service: e.target.value })}
              placeholder="Debt service in millions"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}