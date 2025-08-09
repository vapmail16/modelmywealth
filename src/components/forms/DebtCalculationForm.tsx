import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Calculator, 
  Download, 
  History, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCcw
} from "lucide-react";
import { useDebtCalculationData } from "@/hooks/useDebtCalculationData";
import { DebtCalculationDetails, CalculationRunDetails } from "@/types/debtCalculation";

interface DebtCalculationFormProps {
  projectId: string;
}

export const DebtCalculationForm: React.FC<DebtCalculationFormProps> = ({ projectId }) => {
  const {
    calculations,
    calculationHistory,
    validationResult,
    isLoading,
    isCalculating,
    isLoadingHistory,
    calculationError,
    loadError,
    performCalculation,
    loadCalculations,
    loadCalculationHistory,
    validateData,
    exportToExcel,
    calculationSummary
  } = useDebtCalculationData({ projectId });

  const [changeReason, setChangeReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleCalculate = async () => {
    await performCalculation(changeReason || undefined);
    setChangeReason('');
  };

  const handleRestoreCalculation = async (runId: string) => {
    await loadCalculations(runId);
    setShowHistory(false); // Hide history after restoring
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getMonthName = (month: number) => {
    const date = new Date(2024, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const renderValidationStatus = () => {
    if (!validationResult) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Validating data...</span>
        </div>
      );
    }

    if (validationResult.isValid) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>All required data is available</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="h-4 w-4" />
        <span>{validationResult.missingFields}</span>
      </div>
    );
  };

  const renderSummary = () => {
    if (!calculationSummary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Principal</p>
                <p className="text-lg font-semibold">{formatCurrency(calculationSummary.total_principal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-lg font-semibold">{formatCurrency(calculationSummary.total_interest)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Final Balance</p>
                <p className="text-lg font-semibold">{formatCurrency(calculationSummary.final_balance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Months</p>
                <p className="text-lg font-semibold">{formatNumber(calculationSummary.total_months)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCalculationHistory = () => {
    if (!showHistory) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Calculation History
          </CardTitle>
          <CardDescription>
            Previous calculation runs for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-4">Loading history...</div>
          ) : calculationHistory.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No calculation history found</div>
          ) : (
            <div className="space-y-2">
              {calculationHistory.map((run) => (
                <div 
                  key={run.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleRestoreCalculation(run.id)}
                >
                  <div>
                    <p className="font-medium">{run.run_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(run.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                      {run.status}
                    </Badge>
                    {run.execution_time_ms && (
                      <span className="text-sm text-muted-foreground">
                        {run.execution_time_ms}ms
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestoreCalculation(run.id);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Debt Calculations
          </CardTitle>
          <CardDescription>
            Calculate 120-month debt schedule based on your debt structure and balance sheet data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Status */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Data Validation</h3>
            {renderValidationStatus()}
          </div>

          {/* Calculation Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={handleCalculate}
                disabled={isCalculating || !validationResult?.isValid}
                className="flex items-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                {isCalculating ? 'Calculating...' : 'Calculate Debt Schedule'}
              </Button>

              <Button 
                variant="outline"
                onClick={exportToExcel}
                disabled={calculations.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>

              <Button 
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                {showHistory ? 'Hide History' : 'Show History'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-reason">Change Reason (Optional)</Label>
              <Input
                id="change-reason"
                placeholder="Enter reason for calculation..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
              />
            </div>
          </div>

          {/* Error Display */}
          {calculationError && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Calculation Error</span>
              </div>
              <p className="text-red-600 mt-1">{calculationError}</p>
            </div>
          )}

          {loadError && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Load Error</span>
              </div>
              <p className="text-red-600 mt-1">{loadError}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calculation History */}
      {renderCalculationHistory()}

      {/* Summary Cards */}
      {renderSummary()}

      {/* Results Table */}
      {calculations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debt Schedule Results</CardTitle>
            <CardDescription>
              {calculations.length} months of debt calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead className="text-right">Payment</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Closing Balance</TableHead>
                    <TableHead className="text-right">Cumulative Interest</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calculation) => (
                    <TableRow key={calculation.id}>
                      <TableCell className="font-medium">
                        {getMonthName(calculation.month)}
                      </TableCell>
                      <TableCell>{calculation.year}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.opening_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.payment)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.interest_payment)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.principal_payment)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.closing_balance)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(calculation.cumulative_interest)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading debt calculations...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 