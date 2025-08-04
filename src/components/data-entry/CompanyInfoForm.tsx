import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building } from "lucide-react";

interface CompanyData {
  companyName: string;
  industry: string;
  location: string;
  fiscalYearEnd: string;
  employees: string;
  businessDescription: string;
}

interface CompanyInfoFormProps {
  data: CompanyData;
  onChange: (data: Partial<CompanyData>) => void;
}

export default function CompanyInfoForm({ data, onChange }: CompanyInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Company Information
        </CardTitle>
        <CardDescription>
          Basic information about your company
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={data.companyName}
              onChange={(e) => onChange({ companyName: e.target.value })}
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => onChange({ location: e.target.value })}
              placeholder="City, State/Country"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
            <Input
              id="fiscalYearEnd"
              type="date"
              value={data.fiscalYearEnd}
              onChange={(e) => onChange({ fiscalYearEnd: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employees">Number of Employees</Label>
            <Input
              id="employees"
              type="number"
              value={data.employees}
              onChange={(e) => onChange({ employees: e.target.value })}
              placeholder="Number of employees"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessDescription">Business Description</Label>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => onChange({ businessDescription: e.target.value })}
            placeholder="Brief description of your business"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}