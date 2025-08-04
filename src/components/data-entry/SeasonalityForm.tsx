import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SeasonalityData {
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
  seasonalWorkingCapital: string;
  seasonalityPattern: string;
}

interface SeasonalityFormProps {
  data: SeasonalityData;
  onChange: (data: Partial<SeasonalityData>) => void;
}

export default function SeasonalityForm({ data, onChange }: SeasonalityFormProps) {
  const months = [
    { key: 'january', label: 'January' },
    { key: 'february', label: 'February' },
    { key: 'march', label: 'March' },
    { key: 'april', label: 'April' },
    { key: 'may', label: 'May' },
    { key: 'june', label: 'June' },
    { key: 'july', label: 'July' },
    { key: 'august', label: 'August' },
    { key: 'september', label: 'September' },
    { key: 'october', label: 'October' },
    { key: 'november', label: 'November' },
    { key: 'december', label: 'December' },
  ];

  const calculateTotal = (): number => {
    return months.reduce((total, month) => {
      return total + (parseFloat(data[month.key as keyof SeasonalityData] as string) || 0);
    }, 0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonality Analysis</CardTitle>
        <CardDescription>
          Configure seasonal patterns for revenue and working capital
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="seasonalityPattern">Seasonality Pattern</Label>
            <Select 
              value={data.seasonalityPattern} 
              onValueChange={(value) => onChange({ seasonalityPattern: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Seasonality</SelectItem>
                <SelectItem value="retail">Retail (Q4 Heavy)</SelectItem>
                <SelectItem value="tourism">Tourism</SelectItem>
                <SelectItem value="custom">Custom Pattern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="seasonalWorkingCapital">Seasonal Working Capital</Label>
            <Input
              id="seasonalWorkingCapital"
              type="number"
              value={data.seasonalWorkingCapital}
              onChange={(e) => onChange({ seasonalWorkingCapital: e.target.value })}
              placeholder="Working capital requirement"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Monthly Distribution (%)</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {months.map((month) => (
                <TableRow key={month.key}>
                  <TableCell className="font-medium">{month.label}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={data[month.key as keyof SeasonalityData] as string}
                      onChange={(e) => onChange({ [month.key]: e.target.value })}
                      placeholder="0.0"
                      className="w-24"
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2">
                <TableCell className="font-bold">Total</TableCell>
                <TableCell>
                  <div className="font-bold text-primary">
                    {calculateTotal().toFixed(1)}%
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}