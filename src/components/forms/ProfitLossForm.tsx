import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useProfitLossData } from '@/hooks/useProfitLossData';
import { cn } from '@/lib/utils';
import { Loader2, DollarSign, TrendingUp, Calculator, AlertCircle } from 'lucide-react';

interface ProfitLossFormProps {
  projectId: string;
  autoSave?: boolean;
  showAuditInfo?: boolean;
  onSave?: (data: any) => void;
  onError?: (error: string) => void;
}

const ProfitLossForm: React.FC<ProfitLossFormProps> = ({ 
  projectId, 
  autoSave = false, 
  showAuditInfo = true, 
  onSave, 
  onError 
}) => {
  const {
    formData,
    isLoading,
    isSaving,
    saveError,
    hasChanged,
    hasUnsavedChanges,
    updateFormField,
    saveField,
    saveAllFields,
    validateForm
  } = useProfitLossData(projectId);

  // Handle field change - just update the form state
  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    updateFormField(field, value);
  };

  // Handle save all changes
  const handleSaveAll = async () => {
    try {
      const validation = validateForm();
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          if (onError) onError(error);
        });
        return;
      }

      const success = await saveAllFields('Manual save all P&L data');
      if (success && onSave) {
        onSave(formData);
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Failed to save all changes');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading profit & loss data...</p>
      </div>
    );
  }

  const validation = validateForm();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profit & Loss Statement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Revenue Section */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue & COGS
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Revenue</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={(e) => handleFieldChange('revenue', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('revenue') })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cogs">Cost of Goods Sold (COGS)</Label>
                  <Input
                    id="cogs"
                    type="number"
                    value={formData.cogs}
                    onChange={(e) => handleFieldChange('cogs', e.target.value)}
                    onBlur={(e) => handleFieldBlur('cogs', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('cogs') })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gross_profit">Gross Profit (Calculated)</Label>
                  <Input
                    id="gross_profit"
                    type="number"
                    value={formData.gross_profit}
                    readOnly
                    className="bg-gray-50 font-medium"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Revenue - COGS</p>
                </div>
              </div>
            </Card>

            {/* Operating Expenses Section */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Operating Expenses
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="operating_expenses">Operating Expenses</Label>
                  <Input
                    id="operating_expenses"
                    type="number"
                    value={formData.operating_expenses}
                    onChange={(e) => handleFieldChange('operating_expenses', e.target.value)}
                    onBlur={(e) => handleFieldBlur('operating_expenses', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('operating_expenses') })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ebitda">EBITDA (Calculated)</Label>
                  <Input
                    id="ebitda"
                    type="number"
                    value={formData.ebitda}
                    readOnly
                    className="bg-gray-50 font-medium"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Gross Profit - Operating Expenses</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="depreciation">Depreciation</Label>
                  <Input
                    id="depreciation"
                    type="number"
                    value={formData.depreciation}
                    onChange={(e) => handleFieldChange('depreciation', e.target.value)}
                    onBlur={(e) => handleFieldBlur('depreciation', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('depreciation') })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ebit">EBIT (Calculated)</Label>
                  <Input
                    id="ebit"
                    type="number"
                    value={formData.ebit}
                    readOnly
                    className="bg-gray-50 font-medium"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">EBITDA - Depreciation</p>
                </div>
              </div>
            </Card>

            {/* Interest & Taxes Section */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Interest & Pre-Tax</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interest_expense">Interest Expense</Label>
                  <Input
                    id="interest_expense"
                    type="number"
                    value={formData.interest_expense}
                    onChange={(e) => handleFieldChange('interest_expense', e.target.value)}
                    onBlur={(e) => handleFieldBlur('interest_expense', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('interest_expense') })}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pretax_income">Pre-Tax Income (Calculated)</Label>
                  <Input
                    id="pretax_income"
                    type="number"
                    value={formData.pretax_income}
                    readOnly
                    className="bg-gray-50 font-medium"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">EBIT - Interest Expense</p>
                </div>
              </div>
            </Card>

            {/* Tax Section */}
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">Tax & Net Income</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rates">Tax Rate (%)</Label>
                  <Input
                    id="tax_rates"
                    type="number"
                    value={formData.tax_rates}
                    onChange={(e) => handleFieldChange('tax_rates', e.target.value)}
                    onBlur={(e) => handleFieldBlur('tax_rates', e.target.value)}
                    className={cn({ 'border-yellow-500': hasChanged('tax_rates') })}
                    placeholder="25.0"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxes">Taxes (Calculated)</Label>
                  <Input
                    id="taxes"
                    type="number"
                    value={formData.taxes}
                    readOnly
                    className="bg-gray-50 font-medium"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Pre-Tax Income × Tax Rate</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="net_income">Net Income (Calculated)</Label>
                  <Input
                    id="net_income"
                    type="number"
                    value={formData.net_income}
                    readOnly
                    className="bg-gray-50 font-bold text-lg"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">Pre-Tax Income - Taxes</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex items-center gap-4">
              {isSaving && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Saving...
                </div>
              )}
              {saveError && (
                <div className="flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {saveError}
                </div>
              )}
              {hasUnsavedChanges() && !isSaving && !saveError && (
                <div className="text-sm text-yellow-600">
                  Unsaved changes detected.
                </div>
              )}
              {!validation.isValid && (
                <div className="flex items-center text-sm text-red-500">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {validation.errors.length} validation error(s)
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSaveAll}
                disabled={isSaving || !hasUnsavedChanges() || !validation.isValid}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>

          {/* Audit Info */}
          {showAuditInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
              <p>Version tracking and audit trail enabled for all changes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { ProfitLossForm };