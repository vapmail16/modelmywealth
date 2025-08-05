import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building } from "lucide-react";

interface CompanyDetailsData {
  company_name: string;
  industry: string;
  region: string;
  country: string;
  employee_count: string;
  founded: string;
  company_website: string;
  business_case: string;
  notes: string;
  projection_start_month: string;
  projection_start_year: string;
  projections_year: string;
  reporting_currency: string;
}

interface CompanyDetailsFormProps {
  data: CompanyDetailsData;
  onChange: (data: Partial<CompanyDetailsData>) => void;
}

export default function CompanyDetailsForm({ data, onChange }: CompanyDetailsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Details
        </CardTitle>
        <CardDescription>
          Complete company information and business details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={data.company_name}
              onChange={(e) => onChange({ company_name: e.target.value })}
              placeholder="Enter company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select value={data.industry} onValueChange={(value) => onChange({ industry: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Input
              id="region"
              value={data.region}
              onChange={(e) => onChange({ region: e.target.value })}
              placeholder="Enter region"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              placeholder="Enter country"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employee_count">Employee Count</Label>
            <Input
              id="employee_count"
              type="number"
              value={data.employee_count}
              onChange={(e) => onChange({ employee_count: e.target.value })}
              placeholder="Number of employees"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="founded">Founded Year</Label>
            <Input
              id="founded"
              type="number"
              value={data.founded}
              onChange={(e) => onChange({ founded: e.target.value })}
              placeholder="Year founded"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_website">Company Website</Label>
            <Input
              id="company_website"
              type="url"
              value={data.company_website}
              onChange={(e) => onChange({ company_website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reporting_currency">Reporting Currency</Label>
            <Select value={data.reporting_currency} onValueChange={(value) => onChange({ reporting_currency: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projection_start_month">Projection Start Month</Label>
            <Input
              id="projection_start_month"
              type="number"
              min="1"
              max="12"
              value={data.projection_start_month}
              onChange={(e) => onChange({ projection_start_month: e.target.value })}
              placeholder="Month (1-12)"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projection_start_year">Projection Start Year</Label>
            <Input
              id="projection_start_year"
              type="number"
              value={data.projection_start_year}
              onChange={(e) => onChange({ projection_start_year: e.target.value })}
              placeholder="Year"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projections_year">Projections Year</Label>
            <Input
              id="projections_year"
              type="number"
              value={data.projections_year}
              onChange={(e) => onChange({ projections_year: e.target.value })}
              placeholder="Projection year"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="business_case">Business Case</Label>
          <Textarea
            id="business_case"
            value={data.business_case}
            onChange={(e) => onChange({ business_case: e.target.value })}
            placeholder="Describe the business case"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={data.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Additional notes"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}