import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard } from "lucide-react";

interface DebtStructureData {
  // Senior Secured
  seniorSecuredType: string;
  seniorSecuredPrincipal: string;
  seniorSecuredOutstanding: string;
  seniorSecuredInterestRate: string;
  seniorSecuredBaseRate: string;
  seniorSecuredSpread: string;
  seniorSecuredMaturityDate: string;
  
  // Subordinated  
  subordinatedType: string;
  subordinatedPrincipal: string;
  subordinatedOutstanding: string;
  subordinatedInterestRate: string;
  subordinatedBaseRate: string;
  subordinatedSpread: string;
  subordinatedMaturityDate: string;
  
  // Revolving Credit
  revolvingType: string;
  revolvingPrincipal: string;
  revolvingOutstanding: string;
  revolvingInterestRate: string;
  revolvingBaseRate: string;
  revolvingSpread: string;
  revolvingMaturityDate: string;
}

interface DebtStructureFormProps {
  data: DebtStructureData;
  onChange: (data: Partial<DebtStructureData>) => void;
}

export default function DebtStructureForm({ data, onChange }: DebtStructureFormProps) {
  const renderInput = (key: keyof DebtStructureData, label: string, placeholder: string, type: string = "number") => (
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

  const renderDebtSection = (title: string, prefix: string) => (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput(`${prefix}Type` as keyof DebtStructureData, 'Debt Type', 'Type of debt instrument', 'text')}
        {renderInput(`${prefix}Principal` as keyof DebtStructureData, 'Principal Amount', 'Total principal amount')}
        {renderInput(`${prefix}Outstanding` as keyof DebtStructureData, 'Outstanding Balance', 'Current outstanding balance')}
        {renderInput(`${prefix}InterestRate` as keyof DebtStructureData, 'Interest Rate (%)', 'Current interest rate')}
        {renderInput(`${prefix}BaseRate` as keyof DebtStructureData, 'Base Rate (%)', 'Base interest rate')}
        {renderInput(`${prefix}Spread` as keyof DebtStructureData, 'Spread (%)', 'Interest rate spread')}
        {renderInput(`${prefix}MaturityDate` as keyof DebtStructureData, 'Maturity Date', 'Debt maturity date', 'date')}
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
        {renderDebtSection("Senior Secured Debt", "seniorSecured")}
        {renderDebtSection("Subordinated Debt", "subordinated")}
        {renderDebtSection("Revolving Credit Facility", "revolving")}
      </CardContent>
    </Card>
  );
}