// Working Capital Data Types
export interface WorkingCapitalDetails {
  id?: string;
  project_id: string;
  days_receivables?: number | null;
  days_inventory?: number | null;
  days_payables?: number | null;
  cash_cycle?: number | null;
  account_receivable_percent?: number | null;
  inventory_percent?: number | null;
  other_current_assets_percent?: number | null;
  accounts_payable_percent?: number | null;
  version?: number;
  created_by?: string;
  updated_by?: string;
  change_reason?: string;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
}

// Form data interface (for frontend forms)
export interface WorkingCapitalFormData {
  days_receivables: string;
  days_inventory: string;
  days_payables: string;
  cash_cycle: string;
  account_receivable_percent: string;
  inventory_percent: string;
  other_current_assets_percent: string;
  accounts_payable_percent: string;
}

// API request interface for updates
export interface WorkingCapitalUpdateRequest {
  fieldUpdates: Partial<WorkingCapitalDetails>;
  changeReason?: string;
}

// API response interface
export interface WorkingCapitalApiResponse {
  success: boolean;
  data: WorkingCapitalDetails | null;
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
export interface WorkingCapitalAuditEntry {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  change_reason: string;
  created_at: string;
  old_values: Partial<WorkingCapitalDetails>;
  new_values: Partial<WorkingCapitalDetails>;
  changed_fields: string[];
  created_by: string;
  ip_address: string | null;
}

// Validation errors interface
export interface WorkingCapitalValidationErrors {
  [key: string]: string;
}

// Save state interface
export interface WorkingCapitalSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Field change tracking
export interface WorkingCapitalFieldChange {
  field: string;
  oldValue: string | number | null;
  newValue: string | number | null;
  timestamp: Date;
}

// Data transformation interfaces
export interface WorkingCapitalDataTransforms {
  formToApi: (formData: WorkingCapitalFormData) => WorkingCapitalDetails;
  apiToForm: (apiData: WorkingCapitalDetails) => WorkingCapitalFormData;
}

// Field configuration for UI
export interface WorkingCapitalFieldConfig {
  name: keyof WorkingCapitalFormData;
  label: string;
  type: 'number' | 'text' | 'select';
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  category: 'days' | 'percentages';
  description?: string;
}

// Field configurations for UI rendering
export const WORKING_CAPITAL_FIELD_CONFIGS: WorkingCapitalFieldConfig[] = [
  // Days fields
  { name: 'days_receivables', label: 'Days Receivables', type: 'number', placeholder: '0', min: 0, max: 365, step: 1, category: 'days', description: 'Average number of days to collect receivables' },
  { name: 'days_inventory', label: 'Days Inventory', type: 'number', placeholder: '0', min: 0, max: 365, step: 1, category: 'days', description: 'Average number of days to sell inventory' },
  { name: 'days_payables', label: 'Days Payables', type: 'number', placeholder: '0', min: 0, max: 365, step: 1, category: 'days', description: 'Average number of days to pay suppliers' },
  { name: 'cash_cycle', label: 'Cash Cycle (Days)', type: 'number', placeholder: '0', min: -365, max: 365, step: 1, category: 'days', description: 'Cash cycle = Days Receivables + Days Inventory - Days Payables' },
  
  // Percentage fields
  { name: 'account_receivable_percent', label: 'Accounts Receivable (%)', type: 'number', placeholder: '0.00', min: 0, max: 100, step: 0.01, category: 'percentages', description: 'Percentage of revenue in accounts receivable' },
  { name: 'inventory_percent', label: 'Inventory (%)', type: 'number', placeholder: '0.00', min: 0, max: 100, step: 0.01, category: 'percentages', description: 'Percentage of revenue in inventory' },
  { name: 'other_current_assets_percent', label: 'Other Current Assets (%)', type: 'number', placeholder: '0.00', min: 0, max: 100, step: 0.01, category: 'percentages', description: 'Percentage of revenue in other current assets' },
  { name: 'accounts_payable_percent', label: 'Accounts Payable (%)', type: 'number', placeholder: '0.00', min: 0, max: 100, step: 0.01, category: 'percentages', description: 'Percentage of revenue in accounts payable' }
]; 