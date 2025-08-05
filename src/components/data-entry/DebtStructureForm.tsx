import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";

interface DebtStructureData {
  senior_secured_loan_type: string;
  additional_loan_senior_secured: string;
  bank_base_rate_senior_secured: string;
  liquidity_premiums_senior_secured: string;
  credit_risk_premiums_senior_secured: string;
  maturity_y_senior_secured: string;
  amortization_y_senior_secured: string;
  
  short_term_loan_type: string;
  additional_loan_short_term: string;
  bank_base_rate_short_term: string;
  liquidity_premiums_short_term: string;
  credit_risk_premiums_short_term: string;
  maturity_y_short_term: string;
  amortization_y_short_term: string;
}

interface DebtStructureFormProps {
  data: DebtStructureData;
  onChange: (data: Partial<DebtStructureData>) => void;
}

export default function DebtStructureForm({ data, onChange }: DebtStructureFormProps) {
  const renderLoanSection = (
    title: string,
    prefix: string,
    loanTypeKey: keyof DebtStructureData,
    fields: Array<{ key: keyof DebtStructureData; label: string; type?: string; suffix?: string }>
  ) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      
      <div className="space-y-2">
        <Label htmlFor={loanTypeKey}>Loan Type</Label>
        <Select 
          value={data[loanTypeKey] as string} 
          onValueChange={(value) => onChange({ [loanTypeKey]: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select loan type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="term-loan">Term Loan</SelectItem>
            <SelectItem value="revolving-credit">Revolving Credit</SelectItem>
            <SelectItem value="bridge-loan">Bridge Loan</SelectItem>
            <SelectItem value="mezzanine">Mezzanine Financing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <div className="relative">
              <Input
                id={field.key}
                type={field.type || "number"}
                step={field.type === "number" ? "0.01" : undefined}
                min={field.type === "number" ? "0" : undefined}
                required={field.key.includes("additional_loan") || field.key.includes("bank_base_rate")}
                value={data[field.key] as string}
                onChange={(e) => onChange({ [field.key]: e.target.value })}
                placeholder={`Enter ${field.label.toLowerCase()}`}
              />
              {field.suffix && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {field.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Debt Structure
        </CardTitle>
        <CardDescription>
          Configure debt terms and interest rate components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {renderLoanSection(
          "Senior Secured Debt",
          "seniorSecured",
          "senior_secured_loan_type",
          [
            { key: "additional_loan_senior_secured", label: "Additional Loan Amount", suffix: "$" },
            { key: "bank_base_rate_senior_secured", label: "Bank Base Rate", suffix: "%" },
            { key: "liquidity_premiums_senior_secured", label: "Liquidity Premium", suffix: "%" },
            { key: "credit_risk_premiums_senior_secured", label: "Credit Risk Premium", suffix: "%" },
            { key: "maturity_y_senior_secured", label: "Maturity", suffix: "years" },
            { key: "amortization_y_senior_secured", label: "Amortization Period", suffix: "years" },
          ]
        )}
        
        {renderLoanSection(
          "Short-Term Debt",
          "shortTerm",
          "short_term_loan_type",
          [
            { key: "additional_loan_short_term", label: "Additional Loan Amount", suffix: "$" },
            { key: "bank_base_rate_short_term", label: "Bank Base Rate", suffix: "%" },
            { key: "liquidity_premiums_short_term", label: "Liquidity Premium", suffix: "%" },
            { key: "credit_risk_premiums_short_term", label: "Credit Risk Premium", suffix: "%" },
            { key: "maturity_y_short_term", label: "Maturity", suffix: "years" },
            { key: "amortization_y_short_term", label: "Amortization Period", suffix: "years" },
          ]
        )}
      </CardContent>
    </Card>
  );
}