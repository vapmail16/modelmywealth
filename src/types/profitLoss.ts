export interface ProfitLossDetails {
  id?: string;
  project_id: string;
  revenue?: number;
  cogs?: number;
  operating_expenses?: number;
  ebitda?: number;
  depreciation?: number;
  amortization?: number;
  ebit?: number;
  interest_expense?: number;
  ebt?: number;
  tax_rates?: number;
  taxes?: number;
  net_income?: number;
  version?: number;
  created_by?: string;
  updated_by?: string;
  change_reason?: string;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
}

export interface ProfitLossFormData {
  revenue: string;
  cogs: string;
  gross_profit: string; // Calculated field (revenue - cogs)
  operating_expenses: string;
  ebitda: string;
  depreciation: string;
  ebit: string;
  interest_expense: string;
  pretax_income: string; // This maps to 'ebt' in database
  tax_rates: string;
  taxes: string;
  net_income: string;
}

export interface ProfitLossSavePayload {
  revenue?: number;
  cogs?: number;
  operating_expenses?: number;
  ebitda?: number;
  depreciation?: number;
  amortization?: number;
  ebit?: number;
  interest_expense?: number;
  ebt?: number; // pretax_income maps to ebt
  tax_rates?: number;
  taxes?: number;
  net_income?: number;
  change_reason?: string; // For audit trail
}

export interface ProfitLossAuditEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  changed_fields: string[];
  change_reason?: string;
  created_by: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ProfitLossApiResponse {
  success: boolean;
  data: ProfitLossDetails;
  message: string;
  audit?: {
    changesDetected: boolean;
    changedFields: string[];
    version: number;
    isNewRecord: boolean;
  };
}

export interface ProfitLossCalculations {
  gross_profit: number;
  ebitda: number;
  ebit: number;
  pretax_income: number; // ebt
  taxes: number;
  net_income: number;
}

/**
 * Field mapping between frontend form, database, and calculations:
 * 
 * FRONTEND FORM → DATABASE → CALCULATIONS
 * ✅ revenue → revenue → revenue
 * ✅ cogs → cogs → cogs  
 * ✅ gross_profit → (calculated) → revenue - cogs
 * ✅ operating_expenses → operating_expenses → operating_expenses
 * ✅ ebitda → ebitda → gross_profit - operating_expenses
 * ✅ depreciation → depreciation → depreciation
 * ✅ ebit → ebit → ebitda - depreciation - amortization
 * ✅ interest_expense → interest_expense → interest_expense
 * ✅ pretax_income → ebt → ebit - interest_expense
 * ✅ tax_rates → tax_rates → tax_rates (percentage)
 * ✅ taxes → taxes → ebt * (tax_rates / 100)
 * ✅ net_income → net_income → ebt - taxes
 * 
 * NOTE: amortization exists in DB but not in current frontend form
 */