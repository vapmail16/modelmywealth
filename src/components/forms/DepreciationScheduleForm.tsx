import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  Download, 
  History, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingDown,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { useDepreciationScheduleData } from '@/hooks/useDepreciationScheduleData';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw } from 'lucide-react';

interface DepreciationScheduleFormProps {
  projectId: string;
}

export const DepreciationScheduleForm: React.FC<DepreciationScheduleFormProps> = ({ projectId }) => {
  const {
    schedule,
    calculationHistory,
    validationResult,
    isLoading,
    isCalculating,
    isLoadingHistory,
    calculationError,
    loadError,
    performCalculation,
    loadSchedule,
    loadCalculationHistory,
    validateData,
    exportToExcel,
    scheduleSummary
  } = useDepreciationScheduleData({ projectId });

  const [changeReason, setChangeReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleCalculate = async () => {
    await performCalculation(changeReason || undefined);
    setChangeReason('');
  };

  const handleRestoreCalculation = async (runId: string) => {
    await loadSchedule(runId);
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
    if (!scheduleSummary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Months</p>
                <p className="text-lg font-semibold">{formatNumber(scheduleSummary.total_months)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Depreciation</p>
                <p className="text-lg font-semibold">{formatCurrency(scheduleSummary.total_depreciation)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Final Net Book Value</p>
                <p className="text-lg font-semibold">{formatCurrency(scheduleSummary.final_net_book_value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Calculation Status</p>
                <p className="text-lg font-semibold">
                  {isCalculating ? 'Calculating...' : schedule.length > 0 ? 'Complete' : 'Not Started'}
                </p>
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
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleRestoreCalculation(run.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{run.run_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(run.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={run.status === 'completed' ? 'default' : 'secondary'}>
                      {run.status}
                    </Badge>
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

  const renderScheduleTable = () => {
    if (schedule.length === 0) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Depreciation Schedule Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Year</th>
                  <th className="text-right p-2">Asset Value</th>
                  <th className="text-right p-2">Depreciation</th>
                  <th className="text-right p-2">Accumulated Depreciation</th>
                  <th className="text-right p-2">Net Book Value</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-muted">
                    <td className="p-2">{getMonthName(row.month)}</td>
                    <td className="text-right p-2">{row.year}</td>
                    <td className="text-right p-2">{formatCurrency(row.asset_value)}</td>
                    <td className="text-right p-2">{formatCurrency(row.monthly_depreciation)}</td>
                    <td className="text-right p-2">{formatCurrency(row.accumulated_depreciation)}</td>
                    <td className="text-right p-2">{formatCurrency(row.net_book_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Depreciation Schedule</h2>
        <p className="text-muted-foreground">
          Calculate 120-month depreciation schedule based on your balance sheet data.
        </p>
      </div>

      {/* Data Validation */}
      <Card>
        <CardHeader>
          <CardTitle>Data Validation</CardTitle>
        </CardHeader>
        <CardContent>
          {renderValidationStatus()}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || !validationResult?.isValid}
          className="flex items-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          {isCalculating ? 'Calculating...' : 'Calculate Depreciation Schedule'}
        </Button>

        <Button
          variant="outline"
          onClick={exportToExcel}
          disabled={schedule.length === 0}
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

      {/* Change Reason Input */}
      <div className="space-y-2">
        <label htmlFor="changeReason" className="text-sm font-medium">
          Change Reason (Optional)
        </label>
        <Input
          id="changeReason"
          placeholder="Enter reason for calculation..."
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
        />
      </div>

      {/* Error Display */}
      {loadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {calculationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{calculationError}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {renderSummary()}

      {/* Calculation History */}
      {renderCalculationHistory()}

      {/* Schedule Table */}
      {renderScheduleTable()}
    </div>
  );
}; 