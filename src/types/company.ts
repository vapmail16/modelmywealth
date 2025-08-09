/**
 * Company Data Types
 * 
 * These interfaces match EXACTLY with:
 * 1. Database: company_details table schema
 * 2. Backend API: company controller responses  
 * 3. Frontend: form fields and state management
 * 
 * CRITICAL: Column names must be identical across all layers!
 */

/**
 * Company Details - Matches database company_details table exactly
 */
export interface CompanyDetails {
  // Primary identification
  id: string;                           // UUID, primary key
  project_id: string;                   // UUID, foreign key to projects table
  
  // Company information fields
  company_name: string | null;          // varchar(255)
  industry: string | null;              // varchar(255)
  fiscal_year_end: string | null;       // date (ISO string format)
  reporting_currency: string | null;    // varchar(10)
  region: string | null;                // varchar(255)
  country: string | null;               // varchar(255)
  employee_count: number | null;        // integer
  founded: number | null;               // integer (year)
  company_website: string | null;       // text (URL)
  business_case: string | null;         // text
  notes: string | null;                 // text
  
  // Projection settings
  projection_start_month: number | null; // integer (1-12)
  projection_start_year: number | null;  // integer (year)
  projections_year: number | null;       // integer (target year)
  
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
 * Company Form Data - For React form state management
 * All fields as strings to handle form inputs, will be converted to proper types before API calls
 */
export interface CompanyFormData {
  // Company information (all strings for form handling)
  company_name: string;
  industry: string;
  fiscal_year_end: string;
  reporting_currency: string;
  region: string;
  country: string;
  employee_count: string;               // Will be converted to number
  founded: string;                      // Will be converted to number (year)
  company_website: string;
  business_case: string;
  notes: string;
  
  // Projection settings (strings for form selects)
  projection_start_month: string;       // Will be converted to number (1-12)
  projection_start_year: string;        // Will be converted to number
  projections_year: string;             // Will be converted to number
  
  // Change tracking
  change_reason: string;                // User-provided reason for changes
}

/**
 * Company API Request - Data sent to backend API
 * Only includes fields that can be updated (excludes audit/system fields)
 */
export interface CompanyUpdateRequest {
  // Company information
  company_name?: string | null;
  industry?: string | null;
  fiscal_year_end?: string | null;      // ISO date string or null
  reporting_currency?: string | null;
  region?: string | null;
  country?: string | null;
  employee_count?: number | null;
  founded?: number | null;
  company_website?: string | null;
  business_case?: string | null;
  notes?: string | null;
  
  // Projection settings
  projection_start_month?: number | null;
  projection_start_year?: number | null;
  projections_year?: number | null;
  
  // Change tracking
  change_reason?: string;
}

/**
 * Company API Response - Full response from backend
 */
export interface CompanyApiResponse {
  success: boolean;
  data: CompanyDetails;
  message: string;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord?: boolean;
  };
}

/**
 * Company API Error Response
 */
export interface CompanyApiError {
  success: false;
  error: string;
  message: string;
  errors?: Record<string, string>;      // Field-specific validation errors
}

/**
 * Audit History Entry - For change tracking UI
 */
export interface CompanyAuditEntry {
  id: string;
  record_id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: Partial<CompanyDetails>;
  new_values: Partial<CompanyDetails>;
  change_reason: string | null;
  created_at: string;                   // ISO timestamp
  created_by: string | null;            // User ID
  user_email?: string;                  // User email (joined from users table)
  user_name?: string;                   // User name (joined from profiles table)
  ip_address?: string;
}

/**
 * Company Validation Errors - For form validation
 */
export interface CompanyValidationErrors {
  company_name?: string;
  industry?: string;
  fiscal_year_end?: string;
  reporting_currency?: string;
  region?: string;
  country?: string;
  employee_count?: string;
  founded?: string;
  company_website?: string;
  business_case?: string;
  notes?: string;
  projection_start_month?: string;
  projection_start_year?: string;
  projections_year?: string;
  change_reason?: string;
}

/**
 * Company Save State - For UI feedback
 */
export interface CompanySaveState {
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  validationErrors: CompanyValidationErrors;
}

/**
 * Field Change Event - For tracking individual field changes
 */
export interface CompanyFieldChange {
  field: keyof CompanyFormData;
  oldValue: string;
  newValue: string;
  timestamp: Date;
  changeReason?: string;
}

/**
 * Company Data Transformation Utilities Types
 */
export interface CompanyDataTransforms {
  formToApi: (formData: CompanyFormData) => CompanyUpdateRequest;
  apiToForm: (apiData: CompanyDetails) => CompanyFormData;
  validateForm: (formData: CompanyFormData) => CompanyValidationErrors;
  isFormDirty: (current: CompanyFormData, original: CompanyFormData) => boolean;
  getChangedFields: (current: CompanyFormData, original: CompanyFormData) => Partial<CompanyFormData>;
}

/**
 * Dropdown Options for Company Form
 */
export interface CompanyDropdownOptions {
  industries: Array<{ value: string; label: string }>;
  countries: Array<{ value: string; label: string }>;
  regions: Array<{ value: string; label: string }>;
  currencies: Array<{ value: string; label: string }>;
  months: Array<{ value: number; label: string }>;
  years: Array<{ value: number; label: string }>;
}

/**
 * Company Form Field Configuration
 */
export interface CompanyFieldConfig {
  name: keyof CompanyFormData;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'url' | 'date';
  required: boolean;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  helpText?: string;
  validation?: (value: string) => string | null;
}

// Export default configuration for all company fields
export const COMPANY_FIELD_CONFIGS: CompanyFieldConfig[] = [
  {
    name: 'company_name',
    label: 'Company Name',
    type: 'text',
    required: false,
    maxLength: 255,
    placeholder: 'Enter company name'
  },
  {
    name: 'industry',
    label: 'Industry',
    type: 'select',
    required: false,
    placeholder: 'Select industry'
  },
  {
    name: 'region',
    label: 'Region',
    type: 'select',
    required: false,
    placeholder: 'Select region'
  },
  {
    name: 'country',
    label: 'Country',
    type: 'select',
    required: false,
    placeholder: 'Select country'
  },
  {
    name: 'employee_count',
    label: 'Employee Count',
    type: 'number',
    required: false,
    minValue: 0,
    placeholder: 'Number of employees'
  },
  {
    name: 'founded',
    label: 'Founded Year',
    type: 'select',
    required: false,
    minValue: 1800,
    maxValue: new Date().getFullYear(),
    placeholder: 'Select year'
  },
  {
    name: 'company_website',
    label: 'Company Website',
    type: 'url',
    required: false,
    placeholder: 'https://example.com'
  },
  {
    name: 'reporting_currency',
    label: 'Reporting Currency',
    type: 'select',
    required: false,
    placeholder: 'Select currency'
  },
  {
    name: 'projection_start_month',
    label: 'Projection Start Month',
    type: 'select',
    required: false,
    placeholder: 'Select month'
  },
  {
    name: 'projection_start_year',
    label: 'Projection Start Year',
    type: 'select',
    required: false,
    placeholder: 'Select year'
  },
  {
    name: 'projections_year',
    label: 'Projections Year',
    type: 'select',
    required: false,
    placeholder: 'Select target year'
  },
  {
    name: 'business_case',
    label: 'Business Case',
    type: 'textarea',
    required: false,
    placeholder: 'Describe the business case'
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'textarea',
    required: false,
    placeholder: 'Additional notes'
  }
];

/**
 * COLUMN NAME MAPPING VERIFICATION
 * 
 * Database → API → Frontend mapping verification:
 * ✅ company_name → company_name → company_name
 * ✅ industry → industry → industry  
 * ✅ fiscal_year_end → fiscal_year_end → fiscal_year_end
 * ✅ reporting_currency → reporting_currency → reporting_currency
 * ✅ region → region → region
 * ✅ country → country → country
 * ✅ employee_count → employee_count → employee_count
 * ✅ founded → founded → founded
 * ✅ company_website → company_website → company_website
 * ✅ business_case → business_case → business_case
 * ✅ notes → notes → notes
 * ✅ projection_start_month → projection_start_month → projection_start_month
 * ✅ projection_start_year → projection_start_year → projection_start_year
 * ✅ projections_year → projections_year → projections_year
 * 
 * ALL COLUMN NAMES ARE CONSISTENT ACROSS ALL LAYERS! ✅
 */