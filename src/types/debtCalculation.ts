/**
 * Debt Calculation Data Types
 * 
 * These interfaces match EXACTLY with:
 * 1. Database: debt_calculations table schema
 * 2. Backend API: debt calculation controller responses  
 * 3. Frontend: form fields and state management
 * 
 * CRITICAL: Column names must be identical across all layers!
 */

/**
 * Debt Calculation Details - Matches database debt_calculations table exactly
 */
export interface DebtCalculationDetails {
  // Primary identification
  id: string;                           // UUID, primary key
  project_id: string;                   // UUID, foreign key to projects table
  
  // Monthly calculation data
  month: number;                        // Month number (1-120)
  year: number;                         // Year number (1-10)
  opening_balance: number;              // Opening debt balance
  payment: number;                      // Total monthly payment
  interest_payment: number;             // Interest portion of payment
  principal_payment: number;            // Principal portion of payment
  closing_balance: number;              // Closing debt balance
  cumulative_interest: number;          // Total interest paid to date
  
  // Timestamps
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}

/**
 * Calculation Run Details - Matches database calculation_runs table exactly
 */
export interface CalculationRunDetails {
  id: string;                           // UUID, primary key
  project_id: string;                   // UUID, foreign key to projects table
  run_name: string;                     // Name of the calculation run
  run_description?: string;             // Optional description
  calculation_type: string;             // Type of calculation (e.g., 'debt_calculation')
  input_data: any;                      // JSONB input data
  output_data?: any;                    // JSONB output data
  status: string;                       // Status: 'running', 'completed', 'failed'
  created_at: string;                   // ISO timestamp
  created_by: string;                   // UUID, foreign key to users table
  completed_at?: string;                // ISO timestamp when completed
  execution_time_ms?: number;           // Execution time in milliseconds
  error_message?: string;               // Error message if failed
}

/**
 * Debt Calculation Form Data - For React form state management
 */
export interface DebtCalculationFormData {
  // No form data needed as this is a calculation-only section
  // Users trigger calculations, they don't input data directly
}

/**
 * Debt Calculation Update Request - For API calls
 */
export interface DebtCalculationUpdateRequest {
  change_reason?: string;               // Optional reason for the calculation
}

/**
 * Debt Calculation API Response - Standard API response format
 */
export interface DebtCalculationApiResponse {
  success: boolean;
  message: string;
  data: DebtCalculationDetails[] | CalculationRunDetails[] | any;
  error?: string;
}

/**
 * Debt Calculation Audit Entry - For audit history
 */
export interface DebtCalculationAuditEntry {
  id: string;
  table_name: string;
  action: string;
  change_reason?: string;
  created_at: string;
  old_values: any;
  new_values: any;
  changed_fields: string[];
  created_by: string;
  ip_address?: string;
}

/**
 * Debt Calculation Validation Errors - For form validation
 */
export interface DebtCalculationValidationErrors {
  [key: string]: string;
}

/**
 * Debt Calculation Save State - For UI state management
 */
export interface DebtCalculationSaveState {
  isCalculating: boolean;
  calculationError?: string;
  lastCalculationTime?: string;
  calculationProgress?: number;
}

/**
 * Debt Calculation Field Change - For change tracking
 */
export interface DebtCalculationFieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

/**
 * Debt Calculation Data Transforms - For data conversion
 */
export interface DebtCalculationDataTransforms {
  transformFormToApiRequest: (formData: DebtCalculationFormData) => DebtCalculationUpdateRequest;
  transformApiToFormData: (apiData: DebtCalculationDetails[]) => DebtCalculationFormData;
}

/**
 * Debt Calculation Field Config - For form rendering
 */
export interface DebtCalculationFieldConfig {
  name: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'date';
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    message?: string;
  };
}

/**
 * Debt Calculation Summary - For display purposes
 */
export interface DebtCalculationSummary {
  total_months: number;
  total_principal: number;
  total_interest: number;
  final_balance: number;
  execution_time_ms: number;
  calculation_run_id: string;
}

/**
 * Debt Calculation Validation Result - For data validation
 */
export interface DebtCalculationValidationResult {
  isValid: boolean;
  debtStructureData?: any;
  balanceSheetData?: any;
  missingFields?: string;
}

// Export default configuration for debt calculation fields
export const DEBT_CALCULATION_FIELD_CONFIGS: DebtCalculationFieldConfig[] = [
  // No form fields needed as this is calculation-only
  // The calculation is triggered by a button, not form inputs
];

// Export default data transforms
export const DEBT_CALCULATION_DATA_TRANSFORMS: DebtCalculationDataTransforms = {
  transformFormToApiRequest: (formData: DebtCalculationFormData): DebtCalculationUpdateRequest => {
    return {
      change_reason: 'Debt calculation performed'
    };
  },
  
  transformApiToFormData: (apiData: DebtCalculationDetails[]): DebtCalculationFormData => {
    return {}; // No form data needed
  }
}; 