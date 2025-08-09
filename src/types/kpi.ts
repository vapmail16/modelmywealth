export interface MonthlyKpi {
  id: string;
  project_id: string;
  month: number;
  year: number;
  month_name: string;
  
  // Debt-related KPIs
  debt_to_ebitda: number;
  debt_service_coverage_ratio: number;
  loan_to_value_ratio: number;
  interest_coverage_ratio: number;
  
  // Liquidity KPIs
  current_ratio: number;
  quick_ratio: number;
  
  // Leverage KPIs
  debt_to_equity_ratio: number;
  
  // Profitability KPIs
  operating_margin: number;
  
  // Cash Flow KPIs
  fcff: number;
  fcfe: number;
  
  // Working Capital KPIs
  ar_cycle_days: number;
  inventory_cycle_days: number;
  
  calculation_run_id: string;
  created_at: string;
  updated_at: string;
}

export interface QuarterlyKpi {
  id: string;
  project_id: string;
  quarter: number;
  year: number;
  quarter_name: string;
  
  // Debt-related KPIs
  debt_to_ebitda: number;
  debt_service_coverage_ratio: number;
  loan_to_value_ratio: number;
  interest_coverage_ratio: number;
  
  // Liquidity KPIs
  current_ratio: number;
  quick_ratio: number;
  
  // Leverage KPIs
  debt_to_equity_ratio: number;
  
  // Profitability KPIs
  operating_margin: number;
  
  // Cash Flow KPIs
  fcff: number;
  fcfe: number;
  
  // Working Capital KPIs
  ar_cycle_days: number;
  inventory_cycle_days: number;
  
  calculation_run_id: string;
  created_at: string;
  updated_at: string;
}

export interface YearlyKpi {
  id: string;
  project_id: string;
  year: number;
  
  // Debt-related KPIs
  debt_to_ebitda: number;
  debt_service_coverage_ratio: number;
  loan_to_value_ratio: number;
  interest_coverage_ratio: number;
  
  // Liquidity KPIs
  current_ratio: number;
  quick_ratio: number;
  
  // Leverage KPIs
  debt_to_equity_ratio: number;
  
  // Profitability KPIs
  operating_margin: number;
  
  // Cash Flow KPIs
  fcff: number;
  fcfe: number;
  
  // Working Capital KPIs
  ar_cycle_days: number;
  inventory_cycle_days: number;
  
  calculation_run_id: string;
  created_at: string;
  updated_at: string;
}

export interface KpiCalculationRun {
  id: string;
  project_id: string;
  calculation_type: string;
  description: string;
  run_name: string;
  status: string;
  created_at: string;
  completed_at?: string;
  record_count: number;
}

export interface KpiValidationResponse {
  success: boolean;
  message: string;
}

export interface KpiCalculationResponse {
  success: boolean;
  message: string;
  calculationRunId?: string;
  error?: string;
}

export interface KpiDataResponse {
  success: boolean;
  data: MonthlyKpi[] | QuarterlyKpi[] | YearlyKpi[];
  error?: string;
}

export interface KpiHistoryResponse {
  success: boolean;
  data: KpiCalculationRun[];
  error?: string;
}

export interface KpiRestoreResponse {
  success: boolean;
  data: {
    calculationRun: KpiCalculationRun;
    monthlyKpis: MonthlyKpi[];
    quarterlyKpis: QuarterlyKpi[];
    yearlyKpis: YearlyKpi[];
  };
  error?: string;
} 