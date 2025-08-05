import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

interface ProfitLossData {
  revenue: string;
  cogs: string;
  gross_profit: string;
  operating_expenses: string;
  ebitda: string;
  depreciation: string;
  ebit: string;
  interest_expense: string;
  pretax_income: string;
  tax_rates: string;
  taxes: string;
  net_income: string;
}

interface ProfitLossFormProps {
  data: ProfitLossData;
  onChange: (data: Partial<ProfitLossData>) => void;
}

export default function ProfitLossForm({ data, onChange }: ProfitLossFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Profit & Loss Statement (Annual, $M)
        </CardTitle>
        <CardDescription>
          Enter your company's profit and loss data including tax rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="revenue">Revenue *</Label>
            <Input
              id="revenue"
              type="number"
              step="0.01"
              min="0"
              required
              value={data.revenue}
              onChange={(e) => onChange({ revenue: e.target.value })}
              placeholder="Revenue in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cogs">Cost of Goods Sold (COGS) *</Label>
            <Input
              id="cogs"
              type="number"
              step="0.01"
              min="0"
              required
              value={data.cogs}
              onChange={(e) => onChange({ cogs: e.target.value })}
              placeholder="COGS in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gross_profit">Gross Profit</Label>
            <Input
              id="gross_profit"
              type="number"
              step="0.01"
              min="0"
              value={data.gross_profit}
              onChange={(e) => onChange({ gross_profit: e.target.value })}
              placeholder="Auto-calculated: Revenue - COGS"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="operating_expenses">Operating Expenses *</Label>
            <Input
              id="operating_expenses"
              type="number"
              step="0.01"
              min="0"
              required
              value={data.operating_expenses}
              onChange={(e) => onChange({ operating_expenses: e.target.value })}
              placeholder="Operating expenses in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ebitda">EBITDA</Label>
            <Input
              id="ebitda"
              type="number"
              step="0.01"
              value={data.ebitda}
              onChange={(e) => onChange({ ebitda: e.target.value })}
              placeholder="Auto-calculated: Gross Profit - Operating Expenses"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="depreciation">Depreciation</Label>
            <Input
              id="depreciation"
              type="number"
              step="0.01"
              min="0"
              value={data.depreciation}
              onChange={(e) => onChange({ depreciation: e.target.value })}
              placeholder="Depreciation in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ebit">EBIT</Label>
            <Input
              id="ebit"
              type="number"
              step="0.01"
              value={data.ebit}
              onChange={(e) => onChange({ ebit: e.target.value })}
              placeholder="Auto-calculated: EBITDA - Depreciation"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="interest_expense">Interest Expense</Label>
            <Input
              id="interest_expense"
              type="number"
              step="0.01"
              min="0"
              value={data.interest_expense}
              onChange={(e) => onChange({ interest_expense: e.target.value })}
              placeholder="Interest expense in millions"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pretax_income">Pre-tax Income</Label>
            <Input
              id="pretax_income"
              type="number"
              step="0.01"
              value={data.pretax_income}
              onChange={(e) => onChange({ pretax_income: e.target.value })}
              placeholder="Auto-calculated: EBIT - Interest Expense"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax_rates">Tax Rate (%) *</Label>
            <Input
              id="tax_rates"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
              value={data.tax_rates}
              onChange={(e) => onChange({ tax_rates: e.target.value })}
              placeholder="Tax rate percentage (0-100)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxes">Taxes</Label>
            <Input
              id="taxes"
              type="number"
              step="0.01"
              min="0"
              value={data.taxes}
              onChange={(e) => onChange({ taxes: e.target.value })}
              placeholder="Auto-calculated: Pre-tax Income × Tax Rate"
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="net_income">Net Income</Label>
            <Input
              id="net_income"
              type="number"
              step="0.01"
              value={data.net_income}
              onChange={(e) => onChange({ net_income: e.target.value })}
              placeholder="Auto-calculated: Pre-tax Income - Taxes"
              disabled
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}