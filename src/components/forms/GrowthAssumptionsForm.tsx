import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGrowthAssumptionsData } from '@/hooks/useGrowthAssumptionsData';
import { GROWTH_ASSUMPTIONS_FIELD_CONFIGS } from '@/types/growthAssumptions';
import { Save, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';

interface GrowthAssumptionsFormProps {
  projectId: string;
}

export const GrowthAssumptionsForm: React.FC<GrowthAssumptionsFormProps> = ({ projectId }) => {
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
    validateForm
  } = useGrowthAssumptionsData({ projectId });

  // Group fields by category
  const groupedFields = GROWTH_ASSUMPTIONS_FIELD_CONFIGS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, typeof GROWTH_ASSUMPTIONS_FIELD_CONFIGS>);

  // Handle field change
  const handleFieldChange = (fieldName: keyof typeof formData, value: string) => {
    setFieldValue(fieldName, value);
  };

  // Handle field save
  const handleFieldSave = async (fieldName: keyof typeof formData, value: string) => {
    await saveField(fieldName, value);
  };

  // Check if a field has changed
  const isFieldChanged = (fieldName: keyof typeof formData) => {
    if (!originalData) return false;
    const originalValue = originalData[fieldName as keyof typeof originalData];
    const currentValue = formData[fieldName];
    
    // Handle null/undefined/empty string equivalencies
    if (originalValue === null && currentValue === '') return false;
    if (originalValue === null && currentValue !== '') return true;
    if (originalValue !== null && currentValue === '') return true;
    
    // Handle numeric comparisons
    if (originalValue !== null && currentValue !== '') {
      const originalNum = parseFloat(originalValue.toString());
      const currentNum = parseFloat(currentValue);
      
      if (!isNaN(originalNum) && !isNaN(currentNum)) {
        return originalNum !== currentNum;
      } else {
        // Fallback to string comparison for non-numeric values
        return originalValue.toString() !== currentValue;
      }
    }
    
    return false;
  };

  // Get category display name
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      revenue: 'Revenue Growth Rates',
      cost: 'Cost Growth Rates',
      operating_cost: 'Operating Cost Growth Rates',
      capex: 'Capital Expenditure Growth Rates'
    };
    return categoryMap[category] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading growth assumptions data...</span>
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
              <CardTitle className="text-xl">Growth Projections & Assumptions</CardTitle>
              <CardDescription>
                Define annual growth rates for revenue, costs, operating expenses, and capital expenditures
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
                Annual growth rates for years 1-12
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fields.map((fieldConfig) => {
                  const fieldName = fieldConfig.name;
                  const value = formData[fieldName];
                  const changed = isFieldChanged(fieldName);
                  
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