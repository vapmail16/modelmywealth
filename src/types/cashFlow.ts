// Cash Flow Data Types
export interface CashFlowDetails {
  id: string;
  project_id: string;
  net_income: string;
  depreciation: string;
  amortization: string;
  changes_in_working_capital: string;
  operating_cash_flow: string;
  capex: string;
  acquisitions: string;
  investing_cash_flow: string;
  debt_issuance: string;
  debt_repayment: string;
  dividends: string;
  financing_cash_flow: string;
  net_cash_flow: string;
  capital_expenditures: string;
  free_cash_flow: string;
  debt_service: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  change_reason: string | null;
  last_modified: string;
}

// Form Data Type
export interface CashFlowFormData {
  net_income: string;
  depreciation: string;
  amortization: string;
  changes_in_working_capital: string;
  operating_cash_flow: string;
  capex: string;
  acquisitions: string;
  investing_cash_flow: string;
  debt_issuance: string;
  debt_repayment: string;
  dividends: string;
  financing_cash_flow: string;
  net_cash_flow: string;
  capital_expenditures: string;
  free_cash_flow: string;
  debt_service: string;
}

// API Request Types
export interface CashFlowUpdateRequest {
  data: Partial<CashFlowFormData>;
  changeReason?: string;
}

// API Response Types
export interface CashFlowApiResponse {
  success: boolean;
  data: CashFlowDetails;
  audit?: {
    changesDetected: boolean;
    changedFields?: string[];
    version: number;
    isNewRecord: boolean;
  };
  message: string;
}

// Audit Types
export interface CashFlowAuditEntry {
  id: string;
  table_name: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  change_reason: string | null;
  created_at: string;
  old_values: Partial<CashFlowDetails>;
  new_values: Partial<CashFlowDetails>;
  changed_fields: string[] | null;
  created_by: string;
  ip_address: string | null;
}

// Validation Types
export interface CashFlowValidationErrors {
  [key: string]: string;
}

// Save State Types
export interface CashFlowSaveState {
  isLoading: boolean;
  isSaving: boolean;
  saveError: string | null;
  hasUnsavedChanges: boolean;
}

// Field Change Types
export interface CashFlowFieldChange {
  fieldName: keyof CashFlowFormData;
  value: string;
}

// Data Transform Types
export interface CashFlowDataTransforms {
  transformFormToApiRequest: (formData: CashFlowFormData) => Partial<CashFlowFormData>;
  transformApiToFormData: (apiData: CashFlowDetails) => CashFlowFormData;
}

// Field Configuration Types
export interface CashFlowFieldConfig {
  name: keyof CashFlowFormData;
  label: string;
  type: 'text' | 'number';
  placeholder: string;
  category: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  readOnly?: boolean;
}

// Field Configurations
export const CASH_FLOW_FIELD_CONFIGS: CashFlowFieldConfig[] = [
  // Operating Cash Flow Section
  {
    name: 'net_income',
    label: 'Net Income',
    type: 'number',
    placeholder: 'Enter net income',
    category: 'operating',
    description: 'Net income from profit & loss statement',
    step: 0.01
  },
  {
    name: 'depreciation',
    label: 'Depreciation',
    type: 'number',
    placeholder: 'Enter depreciation',
    category: 'operating',
    description: 'Depreciation expense',
    step: 0.01
  },
  {
    name: 'amortization',
    label: 'Amortization',
    type: 'number',
    placeholder: 'Enter amortization',
    category: 'operating',
    description: 'Amortization expense',
    step: 0.01
  },
  {
    name: 'changes_in_working_capital',
    label: 'Changes in Working Capital',
    type: 'number',
    placeholder: 'Enter working capital changes',
    category: 'operating',
    description: 'Net changes in working capital',
    step: 0.01
  },
  {
    name: 'operating_cash_flow',
    label: 'Operating Cash Flow',
    type: 'number',
    placeholder: 'Calculated automatically',
    category: 'operating',
    description: 'Total operating cash flow',
    readOnly: true,
    step: 0.01
  },

  // Investing Cash Flow Section
  {
    name: 'capex',
    label: 'Capital Expenditures (CAPEX)',
    type: 'number',
    placeholder: 'Enter CAPEX',
    category: 'investing',
    description: 'Capital expenditures for fixed assets',
    step: 0.01
  },
  {
    name: 'acquisitions',
    label: 'Acquisitions',
    type: 'number',
    placeholder: 'Enter acquisitions',
    category: 'investing',
    description: 'Cost of acquisitions',
    step: 0.01
  },
  {
    name: 'investing_cash_flow',
    label: 'Investing Cash Flow',
    type: 'number',
    placeholder: 'Calculated automatically',
    category: 'investing',
    description: 'Total investing cash flow',
    readOnly: true,
    step: 0.01
  },

  // Financing Cash Flow Section
  {
    name: 'debt_issuance',
    label: 'Debt Issuance',
    type: 'number',
    placeholder: 'Enter debt issuance',
    category: 'financing',
    description: 'New debt issued',
    step: 0.01
  },
  {
    name: 'debt_repayment',
    label: 'Debt Repayment',
    type: 'number',
    placeholder: 'Enter debt repayment',
    category: 'financing',
    description: 'Debt repayments made',
    step: 0.01
  },
  {
    name: 'dividends',
    label: 'Dividends',
    type: 'number',
    placeholder: 'Enter dividends',
    category: 'financing',
    description: 'Dividends paid',
    step: 0.01
  },
  {
    name: 'financing_cash_flow',
    label: 'Financing Cash Flow',
    type: 'number',
    placeholder: 'Calculated automatically',
    category: 'financing',
    description: 'Total financing cash flow',
    readOnly: true,
    step: 0.01
  },

  // Summary Section
  {
    name: 'net_cash_flow',
    label: 'Net Cash Flow',
    type: 'number',
    placeholder: 'Calculated automatically',
    category: 'summary',
    description: 'Total net cash flow',
    readOnly: true,
    step: 0.01
  },
  {
    name: 'capital_expenditures',
    label: 'Capital Expenditures',
    type: 'number',
    placeholder: 'Enter capital expenditures',
    category: 'summary',
    description: 'Total capital expenditures',
    step: 0.01
  },
  {
    name: 'free_cash_flow',
    label: 'Free Cash Flow',
    type: 'number',
    placeholder: 'Calculated automatically',
    category: 'summary',
    description: 'Operating cash flow minus capital expenditures',
    readOnly: true,
    step: 0.01
  },
  {
    name: 'debt_service',
    label: 'Debt Service',
    type: 'number',
    placeholder: 'Enter debt service',
    category: 'summary',
    description: 'Total debt service payments',
    step: 0.01
  }
];