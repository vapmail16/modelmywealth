/**
 * Balance Sheet Data Types
 * 
 * These interfaces match EXACTLY with:
 * 1. Database: balance_sheet_data table schema
 * 2. Backend API: balance sheet controller responses  
 * 3. Frontend: form fields and state management
 * 
 * CRITICAL: Column names must be identical across all layers!
 */

/**
 * Balance Sheet Details - Matches database balance_sheet_data table exactly
 */
export interface BalanceSheetDetails {
  // Primary identification
  id: string;                           // UUID, primary key
  project_id: string;                   // UUID, foreign key to projects table
  
  // Assets
  cash: number | null;                  // numeric(15,2)
  accounts_receivable: number | null;   // numeric(15,2)
  inventory: number | null;             // numeric(15,2)
  prepaid_expenses: number | null;      // numeric(15,2)
  other_current_assets: number | null;  // numeric(15,2)
  total_current_assets: number | null;  // numeric(15,2)
  ppe: number | null;                   // numeric(15,2) - Property, Plant & Equipment
  intangible_assets: number | null;     // numeric(15,2)
  goodwill: number | null;              // numeric(15,2)
  other_assets: number | null;          // numeric(15,2)
  total_assets: number | null;          // numeric(15,2)
  
  // Liabilities
  accounts_payable: number | null;      // numeric(15,2)
  accrued_expenses: number | null;      // numeric(15,2)
  short_term_debt: number | null;       // numeric(15,2)
  other_current_liabilities: number | null; // numeric(15,2)
  total_current_liabilities: number | null; // numeric(15,2)
  long_term_debt: number | null;        // numeric(15,2)
  other_liabilities: number | null;     // numeric(15,2)
  total_liabilities: number | null;     // numeric(15,2)
  
  // Equity
  common_stock: number | null;          // numeric(15,2)
  retained_earnings: number | null;     // numeric(15,2)
  other_equity: number | null;          // numeric(15,2)
  total_equity: number | null;          // numeric(15,2)
  total_liabilities_equity: number | null; // numeric(15,2)
  
  // Capital Expenditure & Depreciation
  capital_expenditure_additions: number | null; // numeric(15,2)
  asset_depreciated_over_years: number | null; // integer
  
  // Audit trail fields (read-only in frontend)
  version: number;                      // integer, incremented on each update
  created_by: string | null;            // UUID, references users(id)
  updated_by: string | null;            // UUID, references users(id)
  change_reason: string | null;         // varchar(255)
  created_at: string;                   // timestamp, ISO string
  updated_at: string;                   // timestamp, ISO string
  last_modified: string;                // timestamp, ISO string
}

/**
 * Balance Sheet Form Data - For React form state management
 * All fields as strings to handle form inputs, will be converted to proper types before API calls
 */
export interface BalanceSheetFormData {
  // Assets (all strings for form handling)
  cash: string;
  accounts_receivable: string;
  inventory: string;
  prepaid_expenses: string;
  other_current_assets: string;
  total_current_assets: string;
  ppe: string;
  intangible_assets: string;
  goodwill: string;
  other_assets: string;
  total_assets: string;
  
  // Liabilities (strings for form handling)
  accounts_payable: string;
  accrued_expenses: string;
  short_term_debt: string;
  other_current_liabilities: string;
  total_current_liabilities: string;
  long_term_debt: string;
  other_liabilities: string;
  total_liabilities: string;
  
  // Equity (strings for form handling)
  common_stock: string;
  retained_earnings: string;
  other_equity: string;
  total_equity: string;
  total_liabilities_equity: string;
  
  // Capital Expenditure & Depreciation
  capital_expenditure_additions: string;
  asset_depreciated_over_years: string;
  
  // Change tracking
  change_reason: string;                // User-provided reason for changes
}

/**
 * Balance Sheet API Request - Data sent to backend API
 * Only includes fields that can be updated (excludes audit/system fields)
 */
export interface BalanceSheetUpdateRequest {
  // Assets
  cash?: number | null;
  accounts_receivable?: number | null;
  inventory?: number | null;
  prepaid_expenses?: number | null;
  other_current_assets?: number | null;
  total_current_assets?: number | null;
  ppe?: number | null;
  intangible_assets?: number | null;
  goodwill?: number | null;
  other_assets?: number | null;
  total_assets?: number | null;
  
  // Liabilities
  accounts_payable?: number | null;
  accrued_expenses?: number | null;
  short_term_debt?: number | null;
  other_current_liabilities?: number | null;
  total_current_liabilities?: number | null;
  long_term_debt?: number | null;
  other_liabilities?: number | null;
  total_liabilities?: number | null;
  
  // Equity
  common_stock?: number | null;
  retained_earnings?: number | null;
  other_equity?: number | null;
  total_equity?: number | null;
  total_liabilities_equity?: number | null;
  
  // Capital Expenditure & Depreciation
  capital_expenditure_additions?: number | null;
  asset_depreciated_over_years?: number | null;
  
  // Change tracking
  change_reason?: string;
}

/**
 * Balance Sheet API Response - Full response from backend
 */
export interface BalanceSheetApiResponse {
  success: boolean;
  data: BalanceSheetDetails;
  message: string;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord?: boolean;
  };
}

/**
 * Balance Sheet API Error Response
 */
export interface BalanceSheetApiError {
  success: false;
  error: string;
  message: string;
  errors?: Record<string, string>;      // Field-specific validation errors
}

/**
 * Audit History Entry - For change tracking UI
 */
export interface BalanceSheetAuditEntry {
  id: string;
  record_id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: Partial<BalanceSheetDetails>;
  new_values: Partial<BalanceSheetDetails>;
  change_reason: string | null;
  created_at: string;                   // ISO timestamp
  created_by: string | null;            // User ID
  user_email?: string;                  // User email (joined from users table)
  user_name?: string;                   // User name (joined from profiles table)
  ip_address?: string;
}

/**
 * Balance Sheet Validation Errors - For form validation
 */
export interface BalanceSheetValidationErrors {
  cash?: string;
  accounts_receivable?: string;
  inventory?: string;
  prepaid_expenses?: string;
  other_current_assets?: string;
  total_current_assets?: string;
  ppe?: string;
  intangible_assets?: string;
  goodwill?: string;
  other_assets?: string;
  total_assets?: string;
  accounts_payable?: string;
  accrued_expenses?: string;
  short_term_debt?: string;
  other_current_liabilities?: string;
  total_current_liabilities?: string;
  long_term_debt?: string;
  other_liabilities?: string;
  total_liabilities?: string;
  common_stock?: string;
  retained_earnings?: string;
  other_equity?: string;
  total_equity?: string;
  total_liabilities_equity?: string;
  capital_expenditure_additions?: string;
  asset_depreciated_over_years?: string;
  change_reason?: string;
}

/**
 * Balance Sheet Save State - For UI feedback
 */
export interface BalanceSheetSaveState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  validationErrors: BalanceSheetValidationErrors;
}

/**
 * Field Change Event - For tracking individual field changes
 */
export interface BalanceSheetFieldChange {
  field: keyof BalanceSheetFormData;
  oldValue: string;
  newValue: string;
  timestamp: Date;
  changeReason?: string;
}

/**
 * Balance Sheet Data Transformation Utilities Types
 */
export interface BalanceSheetDataTransforms {
  formToApi: (formData: BalanceSheetFormData) => BalanceSheetUpdateRequest;
  apiToForm: (apiData: BalanceSheetDetails) => BalanceSheetFormData;
  validateForm: (formData: BalanceSheetFormData) => BalanceSheetValidationErrors;
  isFormDirty: (current: BalanceSheetFormData, original: BalanceSheetFormData) => boolean;
  getChangedFields: (current: BalanceSheetFormData, original: BalanceSheetFormData) => Partial<BalanceSheetFormData>;
}

/**
 * Balance Sheet Form Field Configuration
 */
export interface BalanceSheetFieldConfig {
  name: keyof BalanceSheetFormData;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  required: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  helpText?: string;
  validation?: (value: string) => string | null;
}

// Export default configuration for all balance sheet fields
export const BALANCE_SHEET_FIELD_CONFIGS: BalanceSheetFieldConfig[] = [
  // Assets
  {
    name: 'cash',
    label: 'Cash',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Cash in millions'
  },
  {
    name: 'accounts_receivable',
    label: 'Accounts Receivable',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Accounts receivable in millions'
  },
  {
    name: 'inventory',
    label: 'Inventory',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Inventory in millions'
  },
  {
    name: 'prepaid_expenses',
    label: 'Prepaid Expenses',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Prepaid expenses in millions'
  },
  {
    name: 'other_current_assets',
    label: 'Other Current Assets',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Other current assets in millions'
  },
  {
    name: 'total_current_assets',
    label: 'Total Current Assets',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  {
    name: 'ppe',
    label: 'Property, Plant & Equipment (PPE)',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'PPE in millions'
  },
  {
    name: 'intangible_assets',
    label: 'Intangible Assets',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Intangible assets in millions'
  },
  {
    name: 'goodwill',
    label: 'Goodwill',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Goodwill in millions'
  },
  {
    name: 'other_assets',
    label: 'Other Assets',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Other assets in millions'
  },
  {
    name: 'total_assets',
    label: 'Total Assets',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  
  // Liabilities
  {
    name: 'accounts_payable',
    label: 'Accounts Payable',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Accounts payable in millions'
  },
  {
    name: 'accrued_expenses',
    label: 'Accrued Expenses',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Accrued expenses in millions'
  },
  {
    name: 'short_term_debt',
    label: 'Short Term Debt',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Short term debt in millions'
  },
  {
    name: 'other_current_liabilities',
    label: 'Other Current Liabilities',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Other current liabilities in millions'
  },
  {
    name: 'total_current_liabilities',
    label: 'Total Current Liabilities',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  {
    name: 'long_term_debt',
    label: 'Long Term Debt',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Long term debt in millions'
  },
  {
    name: 'other_liabilities',
    label: 'Other Liabilities',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Other liabilities in millions'
  },
  {
    name: 'total_liabilities',
    label: 'Total Liabilities',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  
  // Equity
  {
    name: 'common_stock',
    label: 'Common Stock',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Common stock in millions'
  },
  {
    name: 'retained_earnings',
    label: 'Retained Earnings',
    type: 'number',
    required: false,
    placeholder: 'Retained earnings in millions (can be negative)'
  },
  {
    name: 'other_equity',
    label: 'Other Equity',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Other equity in millions'
  },
  {
    name: 'total_equity',
    label: 'Total Equity',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  {
    name: 'total_liabilities_equity',
    label: 'Total Liabilities & Equity',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Auto-calculated'
  },
  
  // Capital Expenditure & Depreciation
  {
    name: 'capital_expenditure_additions',
    label: 'Capital Expenditure Additions',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Capex additions in millions'
  },
  {
    name: 'asset_depreciated_over_years',
    label: 'Asset Depreciation Years',
    type: 'number',
    required: false,
    minValue: 1,
    maxValue: 50,
    placeholder: 'Depreciation period (1-50 years)'
  }
];

/**
 * COLUMN NAME MAPPING VERIFICATION
 * 
 * Database → API → Frontend mapping verification:
 * ✅ cash → cash → cash
 * ✅ accounts_receivable → accounts_receivable → accounts_receivable
 * ✅ inventory → inventory → inventory
 * ✅ prepaid_expenses → prepaid_expenses → prepaid_expenses
 * ✅ other_current_assets → other_current_assets → other_current_assets
 * ✅ total_current_assets → total_current_assets → total_current_assets
 * ✅ ppe → ppe → ppe
 * ✅ intangible_assets → intangible_assets → intangible_assets
 * ✅ goodwill → goodwill → goodwill
 * ✅ other_assets → other_assets → other_assets
 * ✅ total_assets → total_assets → total_assets
 * ✅ accounts_payable → accounts_payable → accounts_payable
 * ✅ accrued_expenses → accrued_expenses → accrued_expenses
 * ✅ short_term_debt → short_term_debt → short_term_debt
 * ✅ other_current_liabilities → other_current_liabilities → other_current_liabilities
 * ✅ total_current_liabilities → total_current_liabilities → total_current_liabilities
 * ✅ long_term_debt → long_term_debt → long_term_debt
 * ✅ other_liabilities → other_liabilities → other_liabilities
 * ✅ total_liabilities → total_liabilities → total_liabilities
 * ✅ common_stock → common_stock → common_stock
 * ✅ retained_earnings → retained_earnings → retained_earnings
 * ✅ other_equity → other_equity → other_equity
 * ✅ total_equity → total_equity → total_equity
 * ✅ total_liabilities_equity → total_liabilities_equity → total_liabilities_equity
 * ✅ capital_expenditure_additions → capital_expenditure_additions → capital_expenditure_additions
 * ✅ asset_depreciated_over_years → asset_depreciated_over_years → asset_depreciated_over_years
 * 
 * ALL COLUMN NAMES ARE CONSISTENT ACROSS ALL LAYERS! ✅
 */ 