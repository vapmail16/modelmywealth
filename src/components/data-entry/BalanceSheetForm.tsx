import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3 } from "lucide-react";

interface BalanceSheetData {
  cash: string;
  accounts_receivable: string;
  inventory: string;
  other_current_assets: string;
  ppe: string;
  other_assets: string;
  total_assets: string;
  accounts_payable_provisions: string;
  short_term_debt: string;
  other_long_term_debt: string;
  senior_secured: string;
  debt_tranche1: string;
  retained_earnings: string;
  equity: string;
  total_liabilities_and_equity: string;
  capital_expenditure_additions: string;
  asset_depreciated_over_years: string;
  additional_capex_planned_next_year: string;
  asset_depreciated_over_years_new: string;
}

interface BalanceSheetFormProps {
  data: BalanceSheetData;
  onChange: (data: Partial<BalanceSheetData>) => void;
}

export default function BalanceSheetForm({ data, onChange }: BalanceSheetFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Balance Sheet Data
        </CardTitle>
        <CardDescription>
          Complete balance sheet information including Capex and depreciation years
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cash">Cash</Label>
              <Input
                id="cash"
                type="number"
                step="0.01"
                value={data.cash}
                onChange={(e) => onChange({ cash: e.target.value })}
                placeholder="Cash in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accounts_receivable">Accounts Receivable</Label>
              <Input
                id="accounts_receivable"
                type="number"
                step="0.01"
                value={data.accounts_receivable}
                onChange={(e) => onChange({ accounts_receivable: e.target.value })}
                placeholder="Accounts receivable in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                step="0.01"
                value={data.inventory}
                onChange={(e) => onChange({ inventory: e.target.value })}
                placeholder="Inventory in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other_current_assets">Other Current Assets</Label>
              <Input
                id="other_current_assets"
                type="number"
                step="0.01"
                value={data.other_current_assets}
                onChange={(e) => onChange({ other_current_assets: e.target.value })}
                placeholder="Other current assets in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ppe">Property, Plant & Equipment (PPE)</Label>
              <Input
                id="ppe"
                type="number"
                step="0.01"
                value={data.ppe}
                onChange={(e) => onChange({ ppe: e.target.value })}
                placeholder="PPE in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other_assets">Other Assets</Label>
              <Input
                id="other_assets"
                type="number"
                step="0.01"
                value={data.other_assets}
                onChange={(e) => onChange({ other_assets: e.target.value })}
                placeholder="Other assets in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total_assets">Total Assets</Label>
              <Input
                id="total_assets"
                type="number"
                step="0.01"
                value={data.total_assets}
                onChange={(e) => onChange({ total_assets: e.target.value })}
                placeholder="Total assets in millions"
              />
            </div>
          </div>
        </div>

        {/* Liabilities & Equity Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Liabilities & Equity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="accounts_payable_provisions">Accounts Payable & Provisions</Label>
              <Input
                id="accounts_payable_provisions"
                type="number"
                step="0.01"
                value={data.accounts_payable_provisions}
                onChange={(e) => onChange({ accounts_payable_provisions: e.target.value })}
                placeholder="Accounts payable in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="short_term_debt">Short Term Debt</Label>
              <Input
                id="short_term_debt"
                type="number"
                step="0.01"
                value={data.short_term_debt}
                onChange={(e) => onChange({ short_term_debt: e.target.value })}
                placeholder="Short term debt in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="other_long_term_debt">Other Long Term Debt</Label>
              <Input
                id="other_long_term_debt"
                type="number"
                step="0.01"
                value={data.other_long_term_debt}
                onChange={(e) => onChange({ other_long_term_debt: e.target.value })}
                placeholder="Long term debt in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senior_secured">Senior Secured</Label>
              <Input
                id="senior_secured"
                type="number"
                step="0.01"
                value={data.senior_secured}
                onChange={(e) => onChange({ senior_secured: e.target.value })}
                placeholder="Senior secured debt in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="debt_tranche1">Debt Tranche 1</Label>
              <Input
                id="debt_tranche1"
                type="number"
                step="0.01"
                value={data.debt_tranche1}
                onChange={(e) => onChange({ debt_tranche1: e.target.value })}
                placeholder="Debt tranche 1 in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="retained_earnings">Retained Earnings</Label>
              <Input
                id="retained_earnings"
                type="number"
                step="0.01"
                value={data.retained_earnings}
                onChange={(e) => onChange({ retained_earnings: e.target.value })}
                placeholder="Retained earnings in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equity">Equity</Label>
              <Input
                id="equity"
                type="number"
                step="0.01"
                value={data.equity}
                onChange={(e) => onChange({ equity: e.target.value })}
                placeholder="Equity in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="total_liabilities_and_equity">Total Liabilities & Equity</Label>
              <Input
                id="total_liabilities_and_equity"
                type="number"
                step="0.01"
                value={data.total_liabilities_and_equity}
                onChange={(e) => onChange({ total_liabilities_and_equity: e.target.value })}
                placeholder="Total liabilities & equity in millions"
              />
            </div>
          </div>
        </div>

        {/* Capital Expenditure Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Capital Expenditure & Depreciation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capital_expenditure_additions">Capex Additions</Label>
              <Input
                id="capital_expenditure_additions"
                type="number"
                step="0.01"
                value={data.capital_expenditure_additions}
                onChange={(e) => onChange({ capital_expenditure_additions: e.target.value })}
                placeholder="Capital expenditure additions in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="asset_depreciated_over_years">Depreciation Years</Label>
              <Input
                id="asset_depreciated_over_years"
                type="number"
                value={data.asset_depreciated_over_years}
                onChange={(e) => onChange({ asset_depreciated_over_years: e.target.value })}
                placeholder="Asset depreciation period in years"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additional_capex_planned_next_year">Additional Capex Planned Next Year</Label>
              <Input
                id="additional_capex_planned_next_year"
                type="number"
                step="0.01"
                value={data.additional_capex_planned_next_year}
                onChange={(e) => onChange({ additional_capex_planned_next_year: e.target.value })}
                placeholder="Additional capex planned in millions"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="asset_depreciated_over_years_new">New Asset Depreciation Years</Label>
              <Input
                id="asset_depreciated_over_years_new"
                type="number"
                value={data.asset_depreciated_over_years_new}
                onChange={(e) => onChange({ asset_depreciated_over_years_new: e.target.value })}
                placeholder="New asset depreciation period in years"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}