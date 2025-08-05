import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, DollarSign, CreditCard } from "lucide-react";

interface FinancialData {
  // P&L Data
  revenue: string;
  cogs: string;
  grossProfit: string;
  operatingExpenses: string;
  ebitda: string;
  depreciation: string;
  ebit: string;
  interestExpense: string;
  pretaxIncome: string;
  taxRate: string; // NEW: Tax Rate
  taxes: string;
  netIncome: string;
  
  // Balance Sheet Assets
  cash: string;
  accountsReceivable: string;
  inventory: string;
  otherCurrentAssets: string;
  totalCurrentAssets: string;
  ppe: string;
  intangibleAssets: string;
  otherAssets: string;
  totalAssets: string;
  
  // Balance Sheet Liabilities
  accountsPayable: string;
  accruedLiabilities: string;
  shortTermDebt: string;
  otherCurrentLiabilities: string;
  currentLiabilities: string;
  longTermDebt: string;
  otherLiabilities: string;
  totalLiabilities: string;
  
  // Balance Sheet Equity
  shareCapital: string;
  retainedEarnings: string;
  otherEquity: string;
  totalEquity: string;
  
  // Cash Flow Data
  operatingCashFlow: string;
  investingCashFlow: string;
  financingCashFlow: string;
  freeCashFlow: string;
  capex: string;
}

interface FinancialDataFormProps {
  data: FinancialData;
  onChange: (data: Partial<FinancialData>) => void;
}

export default function FinancialDataForm({ data, onChange }: FinancialDataFormProps) {
  const renderInput = (key: keyof FinancialData, label: string, placeholder: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type="number"
        value={data[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Financial Data
        </CardTitle>
        <CardDescription>
          Enter your company's financial information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pnl" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pnl">P&L Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pnl" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('revenue', 'Revenue', 'Total revenue')}
              {renderInput('cogs', 'Cost of Goods Sold (COGS)', 'Cost of goods sold')}
              {renderInput('grossProfit', 'Gross Profit', 'Gross profit')}
              {renderInput('operatingExpenses', 'Operating Expenses', 'Operating expenses')}
              {renderInput('ebitda', 'EBITDA', 'Earnings before interest, taxes, depreciation, and amortization')}
              {renderInput('depreciation', 'Depreciation & Amortization', 'Depreciation and amortization')}
              {renderInput('ebit', 'EBIT', 'Earnings before interest and taxes')}
              {renderInput('interestExpense', 'Interest Expense', 'Interest expense')}
              {renderInput('pretaxIncome', 'Pre-tax Income', 'Income before taxes')}
              {renderInput('taxRate', 'Tax Rate (%)', 'Corporate tax rate percentage')}
              {renderInput('taxes', 'Taxes', 'Tax expense')}
              {renderInput('netIncome', 'Net Income', 'Net income after taxes')}
            </div>
          </TabsContent>
          
          <TabsContent value="balance" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">ASSETS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('cash', 'Cash & Cash Equivalents', 'Cash and equivalents')}
                  {renderInput('accountsReceivable', 'Accounts Receivable', 'Accounts receivable')}
                  {renderInput('inventory', 'Inventory', 'Inventory value')}
                  {renderInput('otherCurrentAssets', 'Other Current Assets', 'Other current assets')}
                  {renderInput('totalCurrentAssets', 'Total Current Assets', 'Total current assets')}
                  {renderInput('ppe', 'Property, Plant & Equipment', 'Net PPE value')}
                  {renderInput('intangibleAssets', 'Intangible Assets', 'Intangible assets')}
                  {renderInput('otherAssets', 'Other Assets', 'Other non-current assets')}
                  {renderInput('totalAssets', 'Total Assets', 'Total assets')}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">LIABILITIES</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('accountsPayable', 'Accounts Payable', 'Accounts payable')}
                  {renderInput('accruedLiabilities', 'Accrued Liabilities', 'Accrued liabilities')}
                  {renderInput('shortTermDebt', 'Short-term Debt', 'Short-term debt')}
                  {renderInput('otherCurrentLiabilities', 'Other Current Liabilities', 'Other current liabilities')}
                  {renderInput('currentLiabilities', 'Total Current Liabilities', 'Total current liabilities')}
                  {renderInput('longTermDebt', 'Long-term Debt', 'Long-term debt')}
                  {renderInput('otherLiabilities', 'Other Liabilities', 'Other non-current liabilities')}
                  {renderInput('totalLiabilities', 'Total Liabilities', 'Total liabilities')}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">EQUITY</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInput('shareCapital', 'Share Capital', 'Share capital')}
                  {renderInput('retainedEarnings', 'Retained Earnings', 'Retained earnings')}
                  {renderInput('otherEquity', 'Other Equity', 'Other equity items')}
                  {renderInput('totalEquity', 'Total Equity', 'Total shareholders equity')}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cashflow" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput('operatingCashFlow', 'Operating Cash Flow', 'Cash flow from operations')}
              {renderInput('investingCashFlow', 'Investing Cash Flow', 'Cash flow from investing')}
              {renderInput('financingCashFlow', 'Financing Cash Flow', 'Cash flow from financing')}
              {renderInput('freeCashFlow', 'Free Cash Flow', 'Free cash flow')}
              {renderInput('capex', 'Capital Expenditures', 'Capital expenditures')}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}