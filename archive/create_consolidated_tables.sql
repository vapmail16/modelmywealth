-- Create Monthly Consolidated Table
CREATE TABLE IF NOT EXISTS monthly_consolidated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    month INTEGER,
    year INTEGER,
    month_name VARCHAR(20),
    revenue NUMERIC(15,2),
    cost_of_goods_sold NUMERIC(15,2),
    gross_profit NUMERIC(15,2),
    operating_expenses NUMERIC(15,2),
    ebitda NUMERIC(15,2),
    depreciation NUMERIC(15,2),
    interest_expense NUMERIC(15,2),
    net_income_before_tax NUMERIC(15,2),
    income_tax_expense NUMERIC(15,2),
    net_income NUMERIC(15,2),
    cash NUMERIC(15,2),
    accounts_receivable NUMERIC(15,2),
    inventory NUMERIC(15,2),
    other_current_assets NUMERIC(15,2),
    ppe_net NUMERIC(15,2),
    other_assets NUMERIC(15,2),
    total_assets NUMERIC(15,2),
    accounts_payable NUMERIC(15,2),
    senior_secured NUMERIC(15,2),
    debt_tranche1 NUMERIC(15,2),
    equity NUMERIC(15,2),
    retained_earning NUMERIC(15,2),
    total_equity_liability NUMERIC(15,2),
    net_cash_operating NUMERIC(15,2),
    capital_expenditures NUMERIC(15,2),
    net_cash_investing NUMERIC(15,2),
    proceeds_debt NUMERIC(15,2),
    repayment_debt NUMERIC(15,2),
    net_cash_financing NUMERIC(15,2),
    net_cash_flow NUMERIC(15,2),
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Quarterly Consolidated Table
CREATE TABLE IF NOT EXISTS quarterly_consolidated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    quarter INTEGER,
    year INTEGER,
    quarter_name VARCHAR(20),
    revenue NUMERIC(15,2),
    cost_of_goods_sold NUMERIC(15,2),
    gross_profit NUMERIC(15,2),
    operating_expenses NUMERIC(15,2),
    ebitda NUMERIC(15,2),
    depreciation NUMERIC(15,2),
    interest_expense NUMERIC(15,2),
    net_income_before_tax NUMERIC(15,2),
    income_tax_expense NUMERIC(15,2),
    net_income NUMERIC(15,2),
    cash NUMERIC(15,2),
    accounts_receivable NUMERIC(15,2),
    inventory NUMERIC(15,2),
    other_current_assets NUMERIC(15,2),
    ppe_net NUMERIC(15,2),
    other_assets NUMERIC(15,2),
    total_assets NUMERIC(15,2),
    accounts_payable NUMERIC(15,2),
    senior_secured NUMERIC(15,2),
    debt_tranche1 NUMERIC(15,2),
    equity NUMERIC(15,2),
    retained_earning NUMERIC(15,2),
    total_equity_liability NUMERIC(15,2),
    net_cash_operating NUMERIC(15,2),
    capital_expenditures NUMERIC(15,2),
    net_cash_investing NUMERIC(15,2),
    proceeds_debt NUMERIC(15,2),
    repayment_debt NUMERIC(15,2),
    net_cash_financing NUMERIC(15,2),
    net_cash_flow NUMERIC(15,2),
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Yearly Consolidated Table
CREATE TABLE IF NOT EXISTS yearly_consolidated (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    year INTEGER,
    revenue NUMERIC(15,2),
    cost_of_goods_sold NUMERIC(15,2),
    gross_profit NUMERIC(15,2),
    operating_expenses NUMERIC(15,2),
    ebitda NUMERIC(15,2),
    depreciation NUMERIC(15,2),
    interest_expense NUMERIC(15,2),
    net_income_before_tax NUMERIC(15,2),
    income_tax_expense NUMERIC(15,2),
    net_income NUMERIC(15,2),
    cash NUMERIC(15,2),
    accounts_receivable NUMERIC(15,2),
    inventory NUMERIC(15,2),
    other_current_assets NUMERIC(15,2),
    ppe_net NUMERIC(15,2),
    other_assets NUMERIC(15,2),
    total_assets NUMERIC(15,2),
    accounts_payable NUMERIC(15,2),
    senior_secured NUMERIC(15,2),
    debt_tranche1 NUMERIC(15,2),
    equity NUMERIC(15,2),
    retained_earning NUMERIC(15,2),
    total_equity_liability NUMERIC(15,2),
    net_cash_operating NUMERIC(15,2),
    capital_expenditures NUMERIC(15,2),
    net_cash_investing NUMERIC(15,2),
    proceeds_debt NUMERIC(15,2),
    repayment_debt NUMERIC(15,2),
    net_cash_financing NUMERIC(15,2),
    net_cash_flow NUMERIC(15,2),
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance and history tracking
CREATE INDEX IF NOT EXISTS idx_monthly_consolidated_project_id ON monthly_consolidated(project_id);
CREATE INDEX IF NOT EXISTS idx_monthly_consolidated_calculation_run_id ON monthly_consolidated(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_monthly_consolidated_month_year ON monthly_consolidated(month, year);

CREATE INDEX IF NOT EXISTS idx_quarterly_consolidated_project_id ON quarterly_consolidated(project_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_consolidated_calculation_run_id ON quarterly_consolidated(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_consolidated_quarter_year ON quarterly_consolidated(quarter, year);

CREATE INDEX IF NOT EXISTS idx_yearly_consolidated_project_id ON yearly_consolidated(project_id);
CREATE INDEX IF NOT EXISTS idx_yearly_consolidated_calculation_run_id ON yearly_consolidated(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_yearly_consolidated_year ON yearly_consolidated(year); 