import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Save, RotateCcw, AlertCircle, CheckCircle } from "lucide-react";
import { useBalanceSheetData } from '@/hooks/useBalanceSheetData';
import { BALANCE_SHEET_FIELD_CONFIGS } from '@/types/balanceSheet';

interface BalanceSheetFormProps {
  projectId: string;
}

export default function BalanceSheetForm({ projectId }: BalanceSheetFormProps) {
  const {
    formData,
    saveState,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    hasChanged,
    validateForm
  } = useBalanceSheetData(projectId);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFieldValue(field, value);
  };

  const handleSaveAll = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      return;
    }
    await saveAllFields();
  };

  const handleReset = () => {
    resetForm();
  };

  const handleRevert = async () => {
    await revertChanges();
  };

  const renderField = (fieldName: keyof typeof formData) => {
    const config = BALANCE_SHEET_FIELD_CONFIGS.find(c => c.name === fieldName);
    if (!config) return null;

    const value = formData[fieldName];
    const error = saveState.validationErrors[fieldName];
    const isChanged = hasChanged(fieldName);

    return (
      <div key={fieldName} className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldName} className="text-sm font-medium">
            {config.label}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {isChanged && (
            <Badge variant="secondary" className="text-xs">
              Modified
            </Badge>
          )}
        </div>
        
        {config.type === 'textarea' ? (
          <Textarea
            id={fieldName}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className={error ? 'border-red-500' : ''}
          />
        ) : (
          <Input
            id={fieldName}
            type={config.type}
            value={value}
            onChange={(e) => handleFieldChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            min={config.minValue}
            max={config.maxValue}
            step="0.01"
            className={error ? 'border-red-500' : ''}
            disabled={fieldName.includes('total_')} // Disable calculated fields
          />
        )}
        
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {config.helpText && (
          <p className="text-xs text-muted-foreground">{config.helpText}</p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <div>
              <CardTitle>Balance Sheet Data</CardTitle>
              <CardDescription>
                Complete balance sheet information including assets, liabilities, equity, and capital expenditure
              </CardDescription>
            </div>
          </div>
          
          {/* Save Status */}
          <div className="flex items-center gap-2">
            {saveState.isSaving && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                Saving...
              </Badge>
            )}
            
            {saveState.lastSaved && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Saved {saveState.lastSaved.toLocaleTimeString()}
              </Badge>
            )}
            
            {saveState.hasUnsavedChanges && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error Display */}
        {saveState.saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {saveState.saveError}
            </p>
          </div>
        )}

        {/* Assets Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('cash')}
            {renderField('accounts_receivable')}
            {renderField('inventory')}
            {renderField('prepaid_expenses')}
            {renderField('other_current_assets')}
            {renderField('total_current_assets')}
            {renderField('ppe')}
            {renderField('intangible_assets')}
            {renderField('goodwill')}
            {renderField('other_assets')}
            {renderField('total_assets')}
          </div>
        </div>

        <Separator />

        {/* Liabilities Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Liabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('accounts_payable')}
            {renderField('accrued_expenses')}
            {renderField('short_term_debt')}
            {renderField('other_current_liabilities')}
            {renderField('total_current_liabilities')}
            {renderField('long_term_debt')}
            {renderField('other_liabilities')}
            {renderField('total_liabilities')}
          </div>
        </div>

        <Separator />

        {/* Equity Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Equity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('common_stock')}
            {renderField('retained_earnings')}
            {renderField('other_equity')}
            {renderField('total_equity')}
            {renderField('total_liabilities_equity')}
          </div>
        </div>

        <Separator />

        {/* Capital Expenditure & Depreciation Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Capital Expenditure & Depreciation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField('capital_expenditure_additions')}
            {renderField('asset_depreciated_over_years')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSaveAll}
              disabled={saveState.isSaving || saveState.isLoading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save All Changes
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saveState.isSaving || saveState.isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Form
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRevert}
              disabled={saveState.isSaving || saveState.isLoading}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Revert Changes
            </Button>
          </div>
          
          {/* Loading Indicator */}
          {saveState.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Loading...
            </div>
          )}
        </div>

        {/* Audit Info */}
        {saveState.lastSaved && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Last saved: {saveState.lastSaved.toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 