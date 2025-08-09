export interface DepreciationScheduleDetails {
  id: string;
  project_id: string;
  month: number;
  year: number;
  asset_value: number;
  depreciation_method: string;
  depreciation_rate: number;
  monthly_depreciation: number;
  accumulated_depreciation: number;
  net_book_value: number;
  created_at: string;
  updated_at: string;
  calculation_run_id?: string;
}

export interface DepreciationScheduleSummary {
  total_months: number;
  total_depreciation: number;
  final_net_book_value: number;
  execution_time_ms?: number;
  calculation_run_id?: string;
}

export interface DepreciationScheduleValidationResult {
  isValid: boolean;
  balanceSheetData?: any;
  missingFields?: string;
}

export interface DepreciationScheduleApiResponse {
  success: boolean;
  message: string;
  data?: DepreciationScheduleDetails[] | DepreciationScheduleSummary | DepreciationScheduleValidationResult;
}

export interface DepreciationScheduleUpdateRequest {
  change_reason?: string;
}

export interface DepreciationScheduleFormData {
  // No form data needed for calculations
} 