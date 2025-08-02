import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"

interface FinancialData {
  revenue: number;
  costOfGoodsSold: number;
  salesMarketing: number;
  administration: number;
  depreciation: number;
  amortization: number;
  interestIncome: number;
  interestExpense: number;
  incomeTaxExpense: number;
  extraordinaryItems: number;
}

export default function DataEntry() {
  const [formData, setFormData] = useState<FinancialData>({
    revenue: 1000000,
    costOfGoodsSold: 600000,
    salesMarketing: 100000,
    administration: 50000,
    depreciation: 20000,
    amortization: 10000,
    interestIncome: 5000,
    interestExpense: 15000,
    incomeTaxExpense: 30000,
    extraordinaryItems: 5000,
  });

  useEffect(() => {
    // Load data from local storage on component mount
    const storedData = localStorage.getItem('financialData');
    if (storedData) {
      setFormData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever formData changes
    localStorage.setItem('financialData', JSON.stringify(formData));
  }, [formData]);

  const calculateGrossProfit = () => {
    return formData.revenue - formData.costOfGoodsSold;
  };

  const calculateEBITDA = () => {
    return calculateGrossProfit() - formData.salesMarketing - formData.administration;
  };

  const calculateEBIT = () => {
    return calculateEBITDA() - formData.depreciation - formData.amortization;
  };

  const calculateNetIncomeBeforeTax = () => {
    return calculateEBIT() + formData.interestIncome - formData.interestExpense;
  };

  const calculateNetIncome = () => {
    return calculateNetIncomeBeforeTax() - formData.incomeTaxExpense + formData.extraordinaryItems;
  };

  const handleSubmit = () => {
    alert(JSON.stringify(formData));
  };

  // Helper function to format numbers with commas
  const formatNumberInput = (value: number) => {
    return value.toLocaleString();
  };

  // Helper function to parse formatted input back to number
  const parseNumberInput = (value: string) => {
    return parseFloat(value.replace(/,/g, '')) || 0;
  };

  // Handle input change with formatting
  const handleInputChange = (field: keyof FinancialData, value: string) => {
    const numericValue = parseNumberInput(value);
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Entry</h1>
        <Button onClick={handleSubmit}>Save Data</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>P&L Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenue</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.revenue)}
                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Cost of Goods Sold</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.costOfGoodsSold)}
                    onChange={(e) => handleInputChange('costOfGoodsSold', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Gross Profit</TableCell>
                <TableCell className="text-right">
                  <div className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent font-semibold px-3 py-2">
                    {calculateGrossProfit().toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Sales & Marketing</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.salesMarketing)}
                    onChange={(e) => handleInputChange('salesMarketing', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Administration</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.administration)}
                    onChange={(e) => handleInputChange('administration', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">EBITDA</TableCell>
                <TableCell className="text-right">
                  <div className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent font-semibold px-3 py-2">
                    {calculateEBITDA().toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Depreciation</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.depreciation)}
                    onChange={(e) => handleInputChange('depreciation', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Amortization</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.amortization)}
                    onChange={(e) => handleInputChange('amortization', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">EBIT</TableCell>
                <TableCell className="text-right">
                  <div className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent font-semibold px-3 py-2">
                    {calculateEBIT().toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Interest Income</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.interestIncome)}
                    onChange={(e) => handleInputChange('interestIncome', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Interest Expense</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.interestExpense)}
                    onChange={(e) => handleInputChange('interestExpense', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Net Income Before Tax</TableCell>
                <TableCell className="text-right">
                  <div className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent font-semibold px-3 py-2">
                    {calculateNetIncomeBeforeTax().toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Income Tax Expense</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.incomeTaxExpense)}
                    onChange={(e) => handleInputChange('incomeTaxExpense', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Extraordinary Items</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="text"
                    value={formatNumberInput(formData.extraordinaryItems)}
                    onChange={(e) => handleInputChange('extraordinaryItems', e.target.value)}
                    className="w-32 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>

              <TableRow className="border-t-2">
                <TableCell className="font-semibold">Net Income</TableCell>
                <TableCell className="text-right">
                  <div className="text-right w-32 ml-auto border-0 focus:ring-0 focus:border-0 shadow-none bg-transparent font-bold text-primary px-3 py-2">
                    {calculateNetIncome().toLocaleString()}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Balance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Balance Sheet data entry form will be here.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Cash Flow Statement data entry form will be here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
