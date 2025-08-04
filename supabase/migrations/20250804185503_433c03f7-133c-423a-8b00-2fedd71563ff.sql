-- Create comprehensive financial data tables for project-level data storage

-- 1. Company Information Table (extends existing companies table functionality)
CREATE TABLE IF NOT EXISTS public.company_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Basic company info
  company_name TEXT,
  industry TEXT,
  region TEXT,
  country TEXT,
  company_website TEXT,
  employee_count INTEGER,
  founded INTEGER,
  business_case TEXT,
  
  -- Financial reporting info
  reporting_currency TEXT DEFAULT 'USD',
  projections_year INTEGER,
  projection_start_month INTEGER,
  projection_start_year INTEGER,
  
  -- Notes and metadata
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Profit & Loss Statement Data
CREATE TABLE IF NOT EXISTS public.profit_loss_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Core P&L items (input fields)
  revenue DECIMAL(15,2),
  cogs DECIMAL(15,2),
  operating_expenses DECIMAL(15,2),
  depreciation DECIMAL(15,2),
  interest_expense DECIMAL(15,2),
  taxes DECIMAL(15,2),
  tax_rates DECIMAL(5,2),
  
  -- Calculated fields
  gross_profit DECIMAL(15,2),
  ebitda DECIMAL(15,2),
  ebit DECIMAL(15,2),
  pretax_income DECIMAL(15,2),
  net_income DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Balance Sheet Data
CREATE TABLE IF NOT EXISTS public.balance_sheet_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Assets
  cash DECIMAL(15,2),
  accounts_receivable DECIMAL(15,2),
  inventory DECIMAL(15,2),
  other_current_assets DECIMAL(15,2),
  ppe DECIMAL(15,2),
  other_assets DECIMAL(15,2),
  
  -- Liabilities
  accounts_payable_provisions DECIMAL(15,2),
  short_term_debt DECIMAL(15,2),
  senior_secured DECIMAL(15,2),
  debt_tranche1 DECIMAL(15,2),
  other_long_term_debt DECIMAL(15,2),
  
  -- Equity
  equity DECIMAL(15,2),
  retained_earnings DECIMAL(15,2),
  
  -- Additional fields
  capital_expenditure_additions DECIMAL(15,2),
  asset_depreciated_over_years INTEGER,
  additional_capex_planned_next_year DECIMAL(15,2),
  asset_depreciated_over_years_new INTEGER,
  
  -- Calculated totals
  total_assets DECIMAL(15,2),
  total_liabilities_and_equity DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Debt Structure Data
CREATE TABLE IF NOT EXISTS public.debt_structure_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Senior Secured Loan Details
  senior_secured_loan_type TEXT,
  additional_loan_senior_secured DECIMAL(15,2),
  bank_base_rate_senior_secured DECIMAL(5,4),
  liquidity_premiums_senior_secured DECIMAL(5,4),
  credit_risk_premiums_senior_secured DECIMAL(5,4),
  maturity_y_senior_secured INTEGER,
  amortization_y_senior_secured INTEGER,
  
  -- Short Term Loan Details
  short_term_loan_type TEXT,
  additional_loan_short_term DECIMAL(15,2),
  bank_base_rate_short_term DECIMAL(5,4),
  liquidity_premiums_short_term DECIMAL(5,4),
  credit_risk_premiums_short_term DECIMAL(5,4),
  maturity_y_short_term INTEGER,
  amortization_y_short_term INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Cash Flow Data
CREATE TABLE IF NOT EXISTS public.cash_flow_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Core cash flow items
  operating_cash_flow DECIMAL(15,2),
  capital_expenditures DECIMAL(15,2),
  free_cash_flow DECIMAL(15,2),
  debt_service DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Growth Assumptions Data (12 months projections)
CREATE TABLE IF NOT EXISTS public.growth_assumptions_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Revenue Growth (12 months)
  gr_revenue_1 DECIMAL(5,2), gr_revenue_2 DECIMAL(5,2), gr_revenue_3 DECIMAL(5,2),
  gr_revenue_4 DECIMAL(5,2), gr_revenue_5 DECIMAL(5,2), gr_revenue_6 DECIMAL(5,2),
  gr_revenue_7 DECIMAL(5,2), gr_revenue_8 DECIMAL(5,2), gr_revenue_9 DECIMAL(5,2),
  gr_revenue_10 DECIMAL(5,2), gr_revenue_11 DECIMAL(5,2), gr_revenue_12 DECIMAL(5,2),
  
  -- Cost Growth (12 months)
  gr_cost_1 DECIMAL(5,2), gr_cost_2 DECIMAL(5,2), gr_cost_3 DECIMAL(5,2),
  gr_cost_4 DECIMAL(5,2), gr_cost_5 DECIMAL(5,2), gr_cost_6 DECIMAL(5,2),
  gr_cost_7 DECIMAL(5,2), gr_cost_8 DECIMAL(5,2), gr_cost_9 DECIMAL(5,2),
  gr_cost_10 DECIMAL(5,2), gr_cost_11 DECIMAL(5,2), gr_cost_12 DECIMAL(5,2),
  
  -- Operating Cost Growth (12 months)
  gr_cost_oper_1 DECIMAL(5,2), gr_cost_oper_2 DECIMAL(5,2), gr_cost_oper_3 DECIMAL(5,2),
  gr_cost_oper_4 DECIMAL(5,2), gr_cost_oper_5 DECIMAL(5,2), gr_cost_oper_6 DECIMAL(5,2),
  gr_cost_oper_7 DECIMAL(5,2), gr_cost_oper_8 DECIMAL(5,2), gr_cost_oper_9 DECIMAL(5,2),
  gr_cost_oper_10 DECIMAL(5,2), gr_cost_oper_11 DECIMAL(5,2), gr_cost_oper_12 DECIMAL(5,2),
  
  -- Capex Growth (12 months)
  gr_capex_1 DECIMAL(5,2), gr_capex_2 DECIMAL(5,2), gr_capex_3 DECIMAL(5,2),
  gr_capex_4 DECIMAL(5,2), gr_capex_5 DECIMAL(5,2), gr_capex_6 DECIMAL(5,2),
  gr_capex_7 DECIMAL(5,2), gr_capex_8 DECIMAL(5,2), gr_capex_9 DECIMAL(5,2),
  gr_capex_10 DECIMAL(5,2), gr_capex_11 DECIMAL(5,2), gr_capex_12 DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Working Capital Data
CREATE TABLE IF NOT EXISTS public.working_capital_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Working capital percentages
  account_receivable_percent DECIMAL(5,2),
  other_current_assets_percent DECIMAL(5,2),
  inventory_percent DECIMAL(5,2),
  accounts_payable_percent DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Seasonality Data
CREATE TABLE IF NOT EXISTS public.seasonality_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Seasonality settings
  seasonality_pattern TEXT,
  seasonal_working_capital DECIMAL(15,2),
  
  -- Monthly percentages (should total 100%)
  january DECIMAL(5,2), february DECIMAL(5,2), march DECIMAL(5,2),
  april DECIMAL(5,2), may DECIMAL(5,2), june DECIMAL(5,2),
  july DECIMAL(5,2), august DECIMAL(5,2), september DECIMAL(5,2),
  october DECIMAL(5,2), november DECIMAL(5,2), december DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Calculated KPIs and Ratios (results from calculations)
CREATE TABLE IF NOT EXISTS public.financial_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  
  -- Key Performance Indicators
  debt_to_ebitda DECIMAL(8,4),
  dscr DECIMAL(8,4),
  interest_coverage DECIMAL(8,4),
  ebitda_margin DECIMAL(5,4),
  return_on_assets DECIMAL(5,4),
  return_on_equity DECIMAL(5,4),
  current_ratio DECIMAL(8,4),
  quick_ratio DECIMAL(8,4),
  debt_to_equity DECIMAL(8,4),
  asset_turnover DECIMAL(8,4),
  
  -- Additional calculated metrics
  gross_margin DECIMAL(5,4),
  operating_margin DECIMAL(5,4),
  net_margin DECIMAL(5,4),
  
  -- Calculation metadata
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  calculation_version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.company_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_sheet_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_structure_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_assumptions_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_capital_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (users can only access their own data)
-- Company Details policies
CREATE POLICY "Users can view their own company details" ON public.company_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own company details" ON public.company_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company details" ON public.company_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own company details" ON public.company_details FOR DELETE USING (auth.uid() = user_id);

-- Profit Loss Data policies
CREATE POLICY "Users can view their own profit loss data" ON public.profit_loss_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profit loss data" ON public.profit_loss_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profit loss data" ON public.profit_loss_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profit loss data" ON public.profit_loss_data FOR DELETE USING (auth.uid() = user_id);

-- Balance Sheet Data policies
CREATE POLICY "Users can view their own balance sheet data" ON public.balance_sheet_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own balance sheet data" ON public.balance_sheet_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own balance sheet data" ON public.balance_sheet_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own balance sheet data" ON public.balance_sheet_data FOR DELETE USING (auth.uid() = user_id);

-- Debt Structure Data policies
CREATE POLICY "Users can view their own debt structure data" ON public.debt_structure_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own debt structure data" ON public.debt_structure_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own debt structure data" ON public.debt_structure_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own debt structure data" ON public.debt_structure_data FOR DELETE USING (auth.uid() = user_id);

-- Cash Flow Data policies
CREATE POLICY "Users can view their own cash flow data" ON public.cash_flow_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cash flow data" ON public.cash_flow_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cash flow data" ON public.cash_flow_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cash flow data" ON public.cash_flow_data FOR DELETE USING (auth.uid() = user_id);

-- Growth Assumptions Data policies
CREATE POLICY "Users can view their own growth assumptions data" ON public.growth_assumptions_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own growth assumptions data" ON public.growth_assumptions_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own growth assumptions data" ON public.growth_assumptions_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own growth assumptions data" ON public.growth_assumptions_data FOR DELETE USING (auth.uid() = user_id);

-- Working Capital Data policies
CREATE POLICY "Users can view their own working capital data" ON public.working_capital_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own working capital data" ON public.working_capital_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own working capital data" ON public.working_capital_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own working capital data" ON public.working_capital_data FOR DELETE USING (auth.uid() = user_id);

-- Seasonality Data policies
CREATE POLICY "Users can view their own seasonality data" ON public.seasonality_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own seasonality data" ON public.seasonality_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own seasonality data" ON public.seasonality_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own seasonality data" ON public.seasonality_data FOR DELETE USING (auth.uid() = user_id);

-- Financial Calculations policies
CREATE POLICY "Users can view their own financial calculations" ON public.financial_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own financial calculations" ON public.financial_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own financial calculations" ON public.financial_calculations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own financial calculations" ON public.financial_calculations FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_company_details_updated_at
    BEFORE UPDATE ON public.company_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profit_loss_data_updated_at
    BEFORE UPDATE ON public.profit_loss_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_balance_sheet_data_updated_at
    BEFORE UPDATE ON public.balance_sheet_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_debt_structure_data_updated_at
    BEFORE UPDATE ON public.debt_structure_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_flow_data_updated_at
    BEFORE UPDATE ON public.cash_flow_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_growth_assumptions_data_updated_at
    BEFORE UPDATE ON public.growth_assumptions_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_working_capital_data_updated_at
    BEFORE UPDATE ON public.working_capital_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seasonality_data_updated_at
    BEFORE UPDATE ON public.seasonality_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_calculations_updated_at
    BEFORE UPDATE ON public.financial_calculations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();