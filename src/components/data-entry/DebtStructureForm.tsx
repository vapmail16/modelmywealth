import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";

interface DebtStructureData {
  seniorSecuredLoanType: string;
  additionalLoanSeniorSecured: string;
  bankBaseRateSeniorSecured: string;
  liquidityPremiumsSeniorSecured: string;
  creditRiskPremiumsSeniorSecured: string;
  maturityYearsSeniorSecured: string;
  amortizationYearsSeniorSecured: string;
  
  shortTermLoanType: string;
  additionalLoanShortTerm: string;
  bankBaseRateShortTerm: string;
  liquidityPremiumsShortTerm: string;
  creditRiskPremiumsShortTerm: string;
  maturityYearsShortTerm: string;
  amortizationYearsShortTerm: string;
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
          "seniorSecuredLoanType",
          [
            { key: "additionalLoanSeniorSecured", label: "Additional Loan Amount", suffix: "$" },
            { key: "bankBaseRateSeniorSecured", label: "Bank Base Rate", suffix: "%" },
            { key: "liquidityPremiumsSeniorSecured", label: "Liquidity Premium", suffix: "%" },
            { key: "creditRiskPremiumsSeniorSecured", label: "Credit Risk Premium", suffix: "%" },
            { key: "maturityYearsSeniorSecured", label: "Maturity", suffix: "years" },
            { key: "amortizationYearsSeniorSecured", label: "Amortization Period", suffix: "years" },
          ]
        )}
        
        {renderLoanSection(
          "Short-Term Debt",
          "shortTerm",
          "shortTermLoanType",
          [
            { key: "additionalLoanShortTerm", label: "Additional Loan Amount", suffix: "$" },
            { key: "bankBaseRateShortTerm", label: "Bank Base Rate", suffix: "%" },
            { key: "liquidityPremiumsShortTerm", label: "Liquidity Premium", suffix: "%" },
            { key: "creditRiskPremiumsShortTerm", label: "Credit Risk Premium", suffix: "%" },
            { key: "maturityYearsShortTerm", label: "Maturity", suffix: "years" },
            { key: "amortizationYearsShortTerm", label: "Amortization Period", suffix: "years" },
          ]
        )}
      </CardContent>
    </Card>
  );
}