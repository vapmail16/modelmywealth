import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle } from "lucide-react";

interface CovenantData {
  debtToEbitdaThreshold: string;
  dscrThreshold: string;
  interestCoverageThreshold: string;
  liquidityThreshold: string;
  capexThreshold: string;
}

interface CovenantFormProps {
  data: CovenantData;
  onChange: (data: Partial<CovenantData>) => void;
}

export default function CovenantForm({ data, onChange }: CovenantFormProps) {
  const renderInput = (key: keyof CovenantData, label: string, placeholder: string, description: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type="number"
        step="0.01"
        value={data[key]}
        onChange={(e) => onChange({ [key]: e.target.value })}
        placeholder={placeholder}
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Debt Covenants
        </CardTitle>
        <CardDescription>
          Define covenant thresholds and compliance requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Covenant Compliance</p>
              <p>Set maximum or minimum thresholds that must be maintained. Breach of covenants may trigger default or require waivers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderInput(
              'debtToEbitdaThreshold', 
              'Debt-to-EBITDA Maximum', 
              'e.g., 4.0', 
              'Maximum allowed ratio of total debt to EBITDA'
            )}
            
            {renderInput(
              'dscrThreshold', 
              'DSCR Minimum', 
              'e.g., 1.25', 
              'Minimum debt service coverage ratio required'
            )}
            
            {renderInput(
              'interestCoverageThreshold', 
              'Interest Coverage Minimum', 
              'e.g., 2.5', 
              'Minimum ratio of EBITDA to interest expense'
            )}
            
            {renderInput(
              'liquidityThreshold', 
              'Minimum Liquidity', 
              'e.g., 5000000', 
              'Minimum cash and available credit required'
            )}
            
            {renderInput(
              'capexThreshold', 
              'Maximum Capex', 
              'e.g., 2000000', 
              'Maximum annual capital expenditure allowed'
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}