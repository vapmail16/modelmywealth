// Growth Assumptions Data Types
export interface GrowthAssumptionsDetails {
  id?: string;
  project_id: string;
  gr_revenue_1?: number | null;
  gr_revenue_2?: number | null;
  gr_revenue_3?: number | null;
  gr_revenue_4?: number | null;
  gr_revenue_5?: number | null;
  gr_revenue_6?: number | null;
  gr_revenue_7?: number | null;
  gr_revenue_8?: number | null;
  gr_revenue_9?: number | null;
  gr_revenue_10?: number | null;
  gr_revenue_11?: number | null;
  gr_revenue_12?: number | null;
  gr_cost_1?: number | null;
  gr_cost_2?: number | null;
  gr_cost_3?: number | null;
  gr_cost_4?: number | null;
  gr_cost_5?: number | null;
  gr_cost_6?: number | null;
  gr_cost_7?: number | null;
  gr_cost_8?: number | null;
  gr_cost_9?: number | null;
  gr_cost_10?: number | null;
  gr_cost_11?: number | null;
  gr_cost_12?: number | null;
  gr_cost_oper_1?: number | null;
  gr_cost_oper_2?: number | null;
  gr_cost_oper_3?: number | null;
  gr_cost_oper_4?: number | null;
  gr_cost_oper_5?: number | null;
  gr_cost_oper_6?: number | null;
  gr_cost_oper_7?: number | null;
  gr_cost_oper_8?: number | null;
  gr_cost_oper_9?: number | null;
  gr_cost_oper_10?: number | null;
  gr_cost_oper_11?: number | null;
  gr_cost_oper_12?: number | null;
  gr_capex_1?: number | null;
  gr_capex_2?: number | null;
  gr_capex_3?: number | null;
  gr_capex_4?: number | null;
  gr_capex_5?: number | null;
  gr_capex_6?: number | null;
  gr_capex_7?: number | null;
  gr_capex_8?: number | null;
  gr_capex_9?: number | null;
  gr_capex_10?: number | null;
  gr_capex_11?: number | null;
  gr_capex_12?: number | null;
  version?: number;
  created_by?: string;
  updated_by?: string;
  change_reason?: string;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
}

// Form data interface (for frontend forms)
export interface GrowthAssumptionsFormData {
  gr_revenue_1: string;
  gr_revenue_2: string;
  gr_revenue_3: string;
  gr_revenue_4: string;
  gr_revenue_5: string;
  gr_revenue_6: string;
  gr_revenue_7: string;
  gr_revenue_8: string;
  gr_revenue_9: string;
  gr_revenue_10: string;
  gr_revenue_11: string;
  gr_revenue_12: string;
  gr_cost_1: string;
  gr_cost_2: string;
  gr_cost_3: string;
  gr_cost_4: string;
  gr_cost_5: string;
  gr_cost_6: string;
  gr_cost_7: string;
  gr_cost_8: string;
  gr_cost_9: string;
  gr_cost_10: string;
  gr_cost_11: string;
  gr_cost_12: string;
  gr_cost_oper_1: string;
  gr_cost_oper_2: string;
  gr_cost_oper_3: string;
  gr_cost_oper_4: string;
  gr_cost_oper_5: string;
  gr_cost_oper_6: string;
  gr_cost_oper_7: string;
  gr_cost_oper_8: string;
  gr_cost_oper_9: string;
  gr_cost_oper_10: string;
  gr_cost_oper_11: string;
  gr_cost_oper_12: string;
  gr_capex_1: string;
  gr_capex_2: string;
  gr_capex_3: string;
  gr_capex_4: string;
  gr_capex_5: string;
  gr_capex_6: string;
  gr_capex_7: string;
  gr_capex_8: string;
  gr_capex_9: string;
  gr_capex_10: string;
  gr_capex_11: string;
  gr_capex_12: string;
}

// API request interface for updates
export interface GrowthAssumptionsUpdateRequest {
  fieldUpdates: Partial<GrowthAssumptionsDetails>;
  changeReason?: string;
}

// API response interface
export interface GrowthAssumptionsApiResponse {
  success: boolean;
  data: GrowthAssumptionsDetails | null;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord: boolean;
  };
  message: string;
  error?: string;
}

// Audit entry interface
export interface GrowthAssumptionsAuditEntry {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  change_reason: string;
  created_at: string;
  old_values: Partial<GrowthAssumptionsDetails>;
  new_values: Partial<GrowthAssumptionsDetails>;
  changed_fields: string[];
  user_id: string;
  ip_address: string | null;
}

// Validation errors interface
export interface GrowthAssumptionsValidationErrors {
  [key: string]: string;
}

// Save state interface
export interface GrowthAssumptionsSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Field change tracking
export interface GrowthAssumptionsFieldChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  timestamp: Date;
}

// Data transformation interfaces
export interface GrowthAssumptionsDataTransforms {
  formToApi: (formData: GrowthAssumptionsFormData) => GrowthAssumptionsDetails;
  apiToForm: (apiData: GrowthAssumptionsDetails) => GrowthAssumptionsFormData;
}

// Field configuration for UI
export interface GrowthAssumptionsFieldConfig {
  name: keyof GrowthAssumptionsFormData;
  label: string;
  type: 'number' | 'text' | 'select';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  category: 'revenue' | 'cost' | 'operating_cost' | 'capex';
  year: number;
  description?: string;
}

// Field configurations for UI rendering
export const GROWTH_ASSUMPTIONS_FIELD_CONFIGS: GrowthAssumptionsFieldConfig[] = [
  // Revenue Growth Rates (Years 1-12)
  { name: 'gr_revenue_1', label: 'Revenue Growth Year 1 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 1, description: 'Annual revenue growth rate for year 1' },
  { name: 'gr_revenue_2', label: 'Revenue Growth Year 2 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 2, description: 'Annual revenue growth rate for year 2' },
  { name: 'gr_revenue_3', label: 'Revenue Growth Year 3 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 3, description: 'Annual revenue growth rate for year 3' },
  { name: 'gr_revenue_4', label: 'Revenue Growth Year 4 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 4, description: 'Annual revenue growth rate for year 4' },
  { name: 'gr_revenue_5', label: 'Revenue Growth Year 5 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 5, description: 'Annual revenue growth rate for year 5' },
  { name: 'gr_revenue_6', label: 'Revenue Growth Year 6 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 6, description: 'Annual revenue growth rate for year 6' },
  { name: 'gr_revenue_7', label: 'Revenue Growth Year 7 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 7, description: 'Annual revenue growth rate for year 7' },
  { name: 'gr_revenue_8', label: 'Revenue Growth Year 8 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 8, description: 'Annual revenue growth rate for year 8' },
  { name: 'gr_revenue_9', label: 'Revenue Growth Year 9 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 9, description: 'Annual revenue growth rate for year 9' },
  { name: 'gr_revenue_10', label: 'Revenue Growth Year 10 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 10, description: 'Annual revenue growth rate for year 10' },
  { name: 'gr_revenue_11', label: 'Revenue Growth Year 11 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 11, description: 'Annual revenue growth rate for year 11' },
  { name: 'gr_revenue_12', label: 'Revenue Growth Year 12 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'revenue', year: 12, description: 'Annual revenue growth rate for year 12' },

  // Cost Growth Rates (Years 1-12)
  { name: 'gr_cost_1', label: 'Cost Growth Year 1 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 1, description: 'Annual cost growth rate for year 1' },
  { name: 'gr_cost_2', label: 'Cost Growth Year 2 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 2, description: 'Annual cost growth rate for year 2' },
  { name: 'gr_cost_3', label: 'Cost Growth Year 3 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 3, description: 'Annual cost growth rate for year 3' },
  { name: 'gr_cost_4', label: 'Cost Growth Year 4 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 4, description: 'Annual cost growth rate for year 4' },
  { name: 'gr_cost_5', label: 'Cost Growth Year 5 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 5, description: 'Annual cost growth rate for year 5' },
  { name: 'gr_cost_6', label: 'Cost Growth Year 6 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 6, description: 'Annual cost growth rate for year 6' },
  { name: 'gr_cost_7', label: 'Cost Growth Year 7 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 7, description: 'Annual cost growth rate for year 7' },
  { name: 'gr_cost_8', label: 'Cost Growth Year 8 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 8, description: 'Annual cost growth rate for year 8' },
  { name: 'gr_cost_9', label: 'Cost Growth Year 9 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 9, description: 'Annual cost growth rate for year 9' },
  { name: 'gr_cost_10', label: 'Cost Growth Year 10 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 10, description: 'Annual cost growth rate for year 10' },
  { name: 'gr_cost_11', label: 'Cost Growth Year 11 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 11, description: 'Annual cost growth rate for year 11' },
  { name: 'gr_cost_12', label: 'Cost Growth Year 12 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'cost', year: 12, description: 'Annual cost growth rate for year 12' },

  // Operating Cost Growth Rates (Years 1-12)
  { name: 'gr_cost_oper_1', label: 'Operating Cost Growth Year 1 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 1, description: 'Annual operating cost growth rate for year 1' },
  { name: 'gr_cost_oper_2', label: 'Operating Cost Growth Year 2 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 2, description: 'Annual operating cost growth rate for year 2' },
  { name: 'gr_cost_oper_3', label: 'Operating Cost Growth Year 3 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 3, description: 'Annual operating cost growth rate for year 3' },
  { name: 'gr_cost_oper_4', label: 'Operating Cost Growth Year 4 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 4, description: 'Annual operating cost growth rate for year 4' },
  { name: 'gr_cost_oper_5', label: 'Operating Cost Growth Year 5 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 5, description: 'Annual operating cost growth rate for year 5' },
  { name: 'gr_cost_oper_6', label: 'Operating Cost Growth Year 6 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 6, description: 'Annual operating cost growth rate for year 6' },
  { name: 'gr_cost_oper_7', label: 'Operating Cost Growth Year 7 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 7, description: 'Annual operating cost growth rate for year 7' },
  { name: 'gr_cost_oper_8', label: 'Operating Cost Growth Year 8 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 8, description: 'Annual operating cost growth rate for year 8' },
  { name: 'gr_cost_oper_9', label: 'Operating Cost Growth Year 9 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 9, description: 'Annual operating cost growth rate for year 9' },
  { name: 'gr_cost_oper_10', label: 'Operating Cost Growth Year 10 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 10, description: 'Annual operating cost growth rate for year 10' },
  { name: 'gr_cost_oper_11', label: 'Operating Cost Growth Year 11 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 11, description: 'Annual operating cost growth rate for year 11' },
  { name: 'gr_cost_oper_12', label: 'Operating Cost Growth Year 12 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'operating_cost', year: 12, description: 'Annual operating cost growth rate for year 12' },

  // Capex Growth Rates (Years 1-12)
  { name: 'gr_capex_1', label: 'Capex Growth Year 1 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 1, description: 'Annual capex growth rate for year 1' },
  { name: 'gr_capex_2', label: 'Capex Growth Year 2 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 2, description: 'Annual capex growth rate for year 2' },
  { name: 'gr_capex_3', label: 'Capex Growth Year 3 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 3, description: 'Annual capex growth rate for year 3' },
  { name: 'gr_capex_4', label: 'Capex Growth Year 4 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 4, description: 'Annual capex growth rate for year 4' },
  { name: 'gr_capex_5', label: 'Capex Growth Year 5 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 5, description: 'Annual capex growth rate for year 5' },
  { name: 'gr_capex_6', label: 'Capex Growth Year 6 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 6, description: 'Annual capex growth rate for year 6' },
  { name: 'gr_capex_7', label: 'Capex Growth Year 7 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 7, description: 'Annual capex growth rate for year 7' },
  { name: 'gr_capex_8', label: 'Capex Growth Year 8 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 8, description: 'Annual capex growth rate for year 8' },
  { name: 'gr_capex_9', label: 'Capex Growth Year 9 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 9, description: 'Annual capex growth rate for year 9' },
  { name: 'gr_capex_10', label: 'Capex Growth Year 10 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 10, description: 'Annual capex growth rate for year 10' },
  { name: 'gr_capex_11', label: 'Capex Growth Year 11 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 11, description: 'Annual capex growth rate for year 11' },
  { name: 'gr_capex_12', label: 'Capex Growth Year 12 (%)', type: 'number', placeholder: '0.00', min: 0, max: 1000, step: 0.01, category: 'capex', year: 12, description: 'Annual capex growth rate for year 12' }
]; 