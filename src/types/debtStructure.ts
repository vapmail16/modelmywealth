// Debt Structure Data Types

export interface DebtStructureDetails {
  id: string;
  project_id: string;
  total_debt: number | null;
  interest_rate: number | null;
  maturity_date: string | null;
  payment_frequency: string | null;
  senior_secured_loan_type: string | null;
  additional_loan_senior_secured: number | null;
  bank_base_rate_senior_secured: number | null;
  liquidity_premiums_senior_secured: number | null;
  credit_risk_premiums_senior_secured: number | null;
  maturity_y_senior_secured: number | null;
  amortization_y_senior_secured: number | null;
  short_term_loan_type: string | null;
  additional_loan_short_term: number | null;
  bank_base_rate_short_term: number | null;
  liquidity_premiums_short_term: number | null;
  credit_risk_premiums_short_term: number | null;
  maturity_y_short_term: number | null;
  amortization_y_short_term: number | null;
  version: number;
  created_by: string | null;
  updated_by: string | null;
  change_reason: string | null;
  created_at: string;
  updated_at: string;
  last_modified: string;
}

export interface DebtStructureFormData {
  // Total Debt
  total_debt: string;
  interest_rate: string;
  maturity_date: string;
  payment_frequency: string;
  
  // Senior Secured Loan
  senior_secured_loan_type: string;
  additional_loan_senior_secured: string;
  bank_base_rate_senior_secured: string;
  liquidity_premiums_senior_secured: string;
  credit_risk_premiums_senior_secured: string;
  maturity_y_senior_secured: string;
  amortization_y_senior_secured: string;
  
  // Short Term Loan
  short_term_loan_type: string;
  additional_loan_short_term: string;
  bank_base_rate_short_term: string;
  liquidity_premiums_short_term: string;
  credit_risk_premiums_short_term: string;
  maturity_y_short_term: string;
  amortization_y_short_term: string;
  
  // Change tracking
  change_reason: string;
}

export interface DebtStructureUpdateRequest {
  total_debt?: number | null;
  interest_rate?: number | null;
  maturity_date?: string | null;
  payment_frequency?: string | null;
  senior_secured_loan_type?: string | null;
  additional_loan_senior_secured?: number | null;
  bank_base_rate_senior_secured?: number | null;
  liquidity_premiums_senior_secured?: number | null;
  credit_risk_premiums_senior_secured?: number | null;
  maturity_y_senior_secured?: number | null;
  amortization_y_senior_secured?: number | null;
  short_term_loan_type?: string | null;
  additional_loan_short_term?: number | null;
  bank_base_rate_short_term?: number | null;
  liquidity_premiums_short_term?: number | null;
  credit_risk_premiums_short_term?: number | null;
  maturity_y_short_term?: number | null;
  amortization_y_short_term?: number | null;
  change_reason?: string;
}

export interface DebtStructureApiResponse {
  success: boolean;
  data: DebtStructureDetails;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord: boolean;
  };
  message: string;
}

export interface DebtStructureAuditEntry {
  id: string;
  table_name: string;
  action: string;
  change_reason: string | null;
  created_at: string;
  old_values: any;
  new_values: any;
  changed_fields: string[] | null;
  user_id: string | null;
  ip_address: string | null;
}

export interface DebtStructureValidationErrors {
  total_debt?: string;
  interest_rate?: string;
  maturity_date?: string;
  payment_frequency?: string;
  senior_secured_loan_type?: string;
  additional_loan_senior_secured?: string;
  bank_base_rate_senior_secured?: string;
  liquidity_premiums_senior_secured?: string;
  credit_risk_premiums_senior_secured?: string;
  maturity_y_senior_secured?: string;
  amortization_y_senior_secured?: string;
  short_term_loan_type?: string;
  additional_loan_short_term?: string;
  bank_base_rate_short_term?: string;
  liquidity_premiums_short_term?: string;
  credit_risk_premiums_short_term?: string;
  maturity_y_short_term?: string;
  amortization_y_short_term?: string;
}

export interface DebtStructureSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
  hasUnsavedChanges: boolean;
}

export interface DebtStructureFieldChange {
  field: keyof DebtStructureFormData;
  oldValue: string;
  newValue: string;
  timestamp: Date;
}

export interface DebtStructureDataTransforms {
  formToApi: (formData: DebtStructureFormData) => DebtStructureUpdateRequest;
  apiToForm: (apiData: DebtStructureDetails) => DebtStructureFormData;
}

export interface DebtStructureFieldConfig {
  field: keyof DebtStructureFormData;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

// Field configurations for form rendering
export const DEBT_STRUCTURE_FIELD_CONFIGS: DebtStructureFieldConfig[] = [
  {
    field: 'total_debt',
    label: 'Total Debt',
    type: 'number',
    required: false,
    placeholder: 'Enter total debt amount',
    validation: { min: 0, message: 'Total debt must be positive' }
  },
  {
    field: 'interest_rate',
    label: 'Interest Rate (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter interest rate',
    validation: { min: 0, max: 100, message: 'Interest rate must be between 0 and 100' }
  },
  {
    field: 'maturity_date',
    label: 'Maturity Date',
    type: 'date',
    required: false,
    placeholder: 'Select maturity date'
  },
  {
    field: 'payment_frequency',
    label: 'Payment Frequency',
    type: 'select',
    required: false,
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'semi-annually', label: 'Semi-Annually' },
      { value: 'annually', label: 'Annually' }
    ]
  },
  {
    field: 'senior_secured_loan_type',
    label: 'Senior Secured Loan Type',
    type: 'text',
    required: false,
    placeholder: 'Enter loan type'
  },
  {
    field: 'additional_loan_senior_secured',
    label: 'Additional Loan (Senior Secured)',
    type: 'number',
    required: false,
    placeholder: 'Enter additional loan amount',
    validation: { min: 0, message: 'Amount must be positive' }
  },
  {
    field: 'bank_base_rate_senior_secured',
    label: 'Bank Base Rate (Senior Secured) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter base rate',
    validation: { min: 0, max: 100, message: 'Rate must be between 0 and 100' }
  },
  {
    field: 'liquidity_premiums_senior_secured',
    label: 'Liquidity Premiums (Senior Secured) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter liquidity premiums',
    validation: { min: 0, max: 100, message: 'Premium must be between 0 and 100' }
  },
  {
    field: 'credit_risk_premiums_senior_secured',
    label: 'Credit Risk Premiums (Senior Secured) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter credit risk premiums',
    validation: { min: 0, max: 100, message: 'Premium must be between 0 and 100' }
  },
  {
    field: 'maturity_y_senior_secured',
    label: 'Maturity Years (Senior Secured)',
    type: 'number',
    required: false,
    placeholder: 'Enter maturity years',
    validation: { min: 1, message: 'Maturity years must be at least 1' }
  },
  {
    field: 'amortization_y_senior_secured',
    label: 'Amortization Years (Senior Secured)',
    type: 'number',
    required: false,
    placeholder: 'Enter amortization years',
    validation: { min: 1, message: 'Amortization years must be at least 1' }
  },
  {
    field: 'short_term_loan_type',
    label: 'Short Term Loan Type',
    type: 'text',
    required: false,
    placeholder: 'Enter loan type'
  },
  {
    field: 'additional_loan_short_term',
    label: 'Additional Loan (Short Term)',
    type: 'number',
    required: false,
    placeholder: 'Enter additional loan amount',
    validation: { min: 0, message: 'Amount must be positive' }
  },
  {
    field: 'bank_base_rate_short_term',
    label: 'Bank Base Rate (Short Term) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter base rate',
    validation: { min: 0, max: 100, message: 'Rate must be between 0 and 100' }
  },
  {
    field: 'liquidity_premiums_short_term',
    label: 'Liquidity Premiums (Short Term) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter liquidity premiums',
    validation: { min: 0, max: 100, message: 'Premium must be between 0 and 100' }
  },
  {
    field: 'credit_risk_premiums_short_term',
    label: 'Credit Risk Premiums (Short Term) (%)',
    type: 'number',
    required: false,
    placeholder: 'Enter credit risk premiums',
    validation: { min: 0, max: 100, message: 'Premium must be between 0 and 100' }
  },
  {
    field: 'maturity_y_short_term',
    label: 'Maturity Years (Short Term)',
    type: 'number',
    required: false,
    placeholder: 'Enter maturity years',
    validation: { min: 1, message: 'Maturity years must be at least 1' }
  },
  {
    field: 'amortization_y_short_term',
    label: 'Amortization Years (Short Term)',
    type: 'number',
    required: false,
    placeholder: 'Enter amortization years',
    validation: { min: 1, message: 'Amortization years must be at least 1' }
  }
]; 