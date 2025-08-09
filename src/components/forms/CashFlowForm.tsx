import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCashFlowData } from '@/hooks/useCashFlowData';
import { CASH_FLOW_FIELD_CONFIGS } from '@/types/cashFlow';
import { Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface CashFlowFormProps {
  projectId: string;
}

export const CashFlowForm: React.FC<CashFlowFormProps> = ({ projectId }) => {
  const {
    formData,
    originalData,
    isLoading,
    isSaving,
    saveError,
    setFieldValue,
    saveField,
    saveAllFields,
    resetForm,
    revertChanges,
    hasChanged,
    hasUnsavedChanges,
    validateForm,
    hasFieldChanged
  } = useCashFlowData({ projectId });

  // Group fields by category
  const groupedFields = CASH_FLOW_FIELD_CONFIGS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof CASH_FLOW_FIELD_CONFIGS>);

  // Handle field change
  const handleFieldChange = (fieldName: keyof typeof formData, value: string) => {
    setFieldValue(fieldName, value);
  };

  // Handle field save
  const handleFieldSave = async (fieldName: keyof typeof formData, value: string) => {
    await saveField(fieldName, value);
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      operating: 'Operating Cash Flow',
      investing: 'Investing Cash Flow',
      financing: 'Financing Cash Flow',
      summary: 'Cash Flow Summary'
    };
    return categoryMap[category] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading cash flow data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with save status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Cash Flow Analysis</CardTitle>
              <CardDescription>
                Track and analyze cash flows from operations, investing, and financing activities
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Unsaved Changes
                </Badge>
              )}
              {originalData && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Version {originalData.version || 1}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button 
              onClick={saveAllFields} 
              disabled={isSaving || !hasChanged}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </Button>
            {hasChanged && (
              <Button 
                variant="outline" 
                onClick={revertChanges}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Revert Changes
              </Button>
            )}
          </div>
          {saveError && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm">
              {saveError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Fields */}
      <div className="space-y-6">
        {Object.entries(groupedFields).map(([category, fields]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">{getCategoryDisplayName(category)}</CardTitle>
              <CardDescription>
                {category === 'operating' && 'Cash flows from day-to-day business operations'}
                {category === 'investing' && 'Cash flows from buying or selling long-term assets'}
                {category === 'financing' && 'Cash flows from debt and equity financing'}
                {category === 'summary' && 'Overall cash flow position and key metrics'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fields.map((fieldConfig) => {
                  const fieldName = fieldConfig.name;
                  const value = formData[fieldName];
                  const changed = hasFieldChanged(fieldName);
                  
                  return (
                    <div key={fieldName} className="space-y-2">
                      <Label htmlFor={fieldName} className="text-sm font-medium">
                        {fieldConfig.label}
                        {changed && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Changed
                          </Badge>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id={fieldName}
                          type={fieldConfig.type}
                          value={value}
                          onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                          onBlur={(e) => handleFieldSave(fieldName, e.target.value)}
                          placeholder={fieldConfig.placeholder}
                          min={fieldConfig.min}
                          max={fieldConfig.max}
                          step={fieldConfig.step}
                          readOnly={fieldConfig.readOnly}
                          className={changed ? 'border-orange-500 bg-orange-50' : ''}
                        />
                        {changed && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      {fieldConfig.description && (
                        <p className="text-xs text-muted-foreground">
                          {fieldConfig.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Info */}
      {originalData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Last Modified:</span>
                <span className="ml-2">
                  {originalData.updated_at 
                    ? new Date(originalData.updated_at).toLocaleString()
                    : 'Never'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium">Version:</span>
                <span className="ml-2">{originalData.version || 1}</span>
              </div>
              {originalData.change_reason && (
                <div className="md:col-span-2">
                  <span className="font-medium">Last Change Reason:</span>
                  <span className="ml-2">{originalData.change_reason}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};