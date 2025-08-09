import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebtStructureData } from '@/hooks/useDebtStructureData';
import { DEBT_STRUCTURE_FIELD_CONFIGS } from '@/types/debtStructure';
import { Loader2, Save, RotateCcw, AlertCircle } from 'lucide-react';

interface DebtStructureFormProps {
  projectId: string;
}

export function DebtStructureForm({ projectId }: DebtStructureFormProps) {
  const {
    formData,
    originalData,
    isLoading,
    isSaving,
    saveError,
    lastSaved,
    validationErrors,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    hasChanged,
    hasUnsavedChanges,
    validateForm
  } = useDebtStructureData(projectId);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFieldValue(field, value);
  };

  const handleFieldBlur = async (field: keyof typeof formData) => {
    const value = formData[field];
    if (value !== originalData[field]) {
      await saveField(field, value);
    }
  };

  const handleSaveAll = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length === 0) {
      await saveAllFields();
    }
  };

  const renderField = (config: typeof DEBT_STRUCTURE_FIELD_CONFIGS[0]) => {
    const { field, label, type, required, placeholder, options, validation } = config;
    const value = formData[field];
    const error = validationErrors[field];
    const changed = hasChanged(field);

    const commonProps = {
      id: field,
      value: value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(field, e.target.value),
      onBlur: () => handleFieldBlur(field),
      placeholder: placeholder,
      className: error ? 'border-red-500' : changed ? 'border-blue-500' : '',
      disabled: isSaving
    };

    return (
      <div key={field} className="space-y-2">
        <Label htmlFor={field} className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {changed && <Badge variant="secondary" className="text-xs">Changed</Badge>}
        </Label>
        
        {type === 'select' ? (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field, newValue)}
            disabled={isSaving}
          >
            <SelectTrigger className={error ? 'border-red-500' : changed ? 'border-blue-500' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            {...commonProps}
            type={type === 'date' ? 'date' : type === 'number' ? 'number' : 'text'}
            step={type === 'number' ? 'any' : undefined}
            min={validation?.min}
            max={validation?.max}
          />
        )}
        
        {error && (
          <div className="flex items-center gap-1 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading debt structure data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Debt Structure</CardTitle>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {hasUnsavedChanges() && (
              <Badge variant="outline" className="text-orange-600">
                Unsaved changes
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {saveError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        )}

        {/* Total Debt Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Total Debt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEBT_STRUCTURE_FIELD_CONFIGS.slice(0, 4).map(renderField)}
          </div>
        </div>

        {/* Senior Secured Loan Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Senior Secured Loan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEBT_STRUCTURE_FIELD_CONFIGS.slice(4, 11).map(renderField)}
          </div>
        </div>

        {/* Short Term Loan Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Short Term Loan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEBT_STRUCTURE_FIELD_CONFIGS.slice(11, 18).map(renderField)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges()}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save All
          </Button>
          
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={isSaving || !hasUnsavedChanges()}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            onClick={revertChanges}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Revert Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 