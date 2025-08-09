// Base consolidated data structure
export interface ConsolidatedData {
    id: string;
    project_id: string;
    calculation_run_id: string;
    created_at: string;
    updated_at: string;
}

// Monthly Consolidated Data
export interface MonthlyConsolidatedData extends ConsolidatedData {
    month: number;
    year: number;
    month_name: string;
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    operating_expenses: number;
    ebitda: number;
    depreciation: number;
    interest_expense: number;
    net_income_before_tax: number;
    income_tax_expense: number;
    net_income: number;
    cash: number;
    accounts_receivable: number;
    inventory: number;
    other_current_assets: number;
    ppe_net: number;
    other_assets: number;
    total_assets: number;
    accounts_payable: number;
    senior_secured: number;
    debt_tranche1: number;
    equity: number;
    retained_earning: number;
    total_equity_liability: number;
    net_cash_operating: number;
    capital_expenditures: number;
    net_cash_investing: number;
    proceeds_debt: number;
    repayment_debt: number;
    net_cash_financing: number;
    net_cash_flow: number;
}

// Quarterly Consolidated Data
export interface QuarterlyConsolidatedData extends ConsolidatedData {
    quarter: number;
    year: number;
    quarter_name: string;
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    operating_expenses: number;
    ebitda: number;
    depreciation: number;
    interest_expense: number;
    net_income_before_tax: number;
    income_tax_expense: number;
    net_income: number;
    cash: number;
    accounts_receivable: number;
    inventory: number;
    other_current_assets: number;
    ppe_net: number;
    other_assets: number;
    total_assets: number;
    accounts_payable: number;
    senior_secured: number;
    debt_tranche1: number;
    equity: number;
    retained_earning: number;
    total_equity_liability: number;
    net_cash_operating: number;
    capital_expenditures: number;
    net_cash_investing: number;
    proceeds_debt: number;
    repayment_debt: number;
    net_cash_financing: number;
    net_cash_flow: number;
}

// Yearly Consolidated Data
export interface YearlyConsolidatedData extends ConsolidatedData {
    year: number;
    revenue: number;
    cost_of_goods_sold: number;
    gross_profit: number;
    operating_expenses: number;
    ebitda: number;
    depreciation: number;
    interest_expense: number;
    net_income_before_tax: number;
    income_tax_expense: number;
    net_income: number;
    cash: number;
    accounts_receivable: number;
    inventory: number;
    other_current_assets: number;
    ppe_net: number;
    other_assets: number;
    total_assets: number;
    accounts_payable: number;
    senior_secured: number;
    debt_tranche1: number;
    equity: number;
    retained_earning: number;
    total_equity_liability: number;
    net_cash_operating: number;
    capital_expenditures: number;
    net_cash_investing: number;
    proceeds_debt: number;
    repayment_debt: number;
    net_cash_financing: number;
    net_cash_flow: number;
}

// Calculation Run
export interface CalculationRun {
    id: string;
    project_id: string;
    type: string;
    status: 'running' | 'completed' | 'failed';
    description: string;
    created_at: string;
    updated_at: string;
}

// API Response Types
export interface ConsolidatedValidationResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface ConsolidatedCalculationResult {
    success: boolean;
    calculationRunId?: string;
    totalMonths?: number;
    totalQuarters?: number;
    totalYears?: number;
    message?: string;
    error?: string;
}

export interface ConsolidatedDataResponse {
    success: boolean;
    data: MonthlyConsolidatedData[] | QuarterlyConsolidatedData[] | YearlyConsolidatedData[];
    error?: string;
}

export interface ConsolidatedHistoryResponse {
    success: boolean;
    history: CalculationRun[];
    error?: string;
}

export interface ConsolidatedApiResponse {
    success: boolean;
    data?: any;
    error?: string;
}

// Form Data Types
export interface ConsolidatedFormData {
    projectId: string;
    calculationRunId?: string;
}

// Tab Types for UI
export type ConsolidatedTabType = 'monthly' | 'quarterly' | 'yearly';

// Summary Statistics
export interface ConsolidatedSummary {
    totalRevenue: number;
    totalEbitda: number;
    totalNetIncome: number;
    averageCash: number;
    totalAssets: number;
    totalDebt: number;
    totalEquity: number;
}

// Chart Data Types
export interface ConsolidatedChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor?: string;
        backgroundColor?: string;
    }[];
} 