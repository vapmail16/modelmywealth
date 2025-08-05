import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

interface WorkingCapitalData {
  account_receivable_percent: string;
  inventory_percent: string;
  other_current_assets_percent: string;
  accounts_payable_percent: string;
}

interface WorkingCapitalFormProps {
  data: WorkingCapitalData;
  onChange: (data: Partial<WorkingCapitalData>) => void;
}

export default function WorkingCapitalForm({ data, onChange }: WorkingCapitalFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Working Capital Assumptions
        </CardTitle>
        <CardDescription>
          Define working capital percentages for financial modeling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account_receivable_percent">Accounts Receivable (%)</Label>
            <Input
              id="account_receivable_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.account_receivable_percent}
              onChange={(e) => onChange({ account_receivable_percent: e.target.value })}
              placeholder="Accounts receivable as % of revenue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="inventory_percent">Inventory (%)</Label>
            <Input
              id="inventory_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.inventory_percent}
              onChange={(e) => onChange({ inventory_percent: e.target.value })}
              placeholder="Inventory as % of revenue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="other_current_assets_percent">Other Current Assets (%)</Label>
            <Input
              id="other_current_assets_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.other_current_assets_percent}
              onChange={(e) => onChange({ other_current_assets_percent: e.target.value })}
              placeholder="Other current assets as % of revenue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="accounts_payable_percent">Accounts Payable (%)</Label>
            <Input
              id="accounts_payable_percent"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.accounts_payable_percent}
              onChange={(e) => onChange({ accounts_payable_percent: e.target.value })}
              placeholder="Accounts payable as % of revenue"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}