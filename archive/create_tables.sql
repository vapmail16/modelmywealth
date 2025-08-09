-- Create tables for refi_wizard database
-- This matches the Supabase schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    company_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company details table
CREATE TABLE IF NOT EXISTS company_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    industry VARCHAR(255),
    fiscal_year_end DATE,
    reporting_currency VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profit & Loss data table
CREATE TABLE IF NOT EXISTS profit_loss_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    revenue DECIMAL(15,2),
    cogs DECIMAL(15,2),
    operating_expenses DECIMAL(15,2),
    ebitda DECIMAL(15,2),
    depreciation DECIMAL(15,2),
    amortization DECIMAL(15,2),
    ebit DECIMAL(15,2),
    interest_expense DECIMAL(15,2),
    ebt DECIMAL(15,2),
    taxes DECIMAL(15,2),
    net_income DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Balance Sheet data table
CREATE TABLE IF NOT EXISTS balance_sheet_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    cash DECIMAL(15,2),
    accounts_receivable DECIMAL(15,2),
    inventory DECIMAL(15,2),
    prepaid_expenses DECIMAL(15,2),
    other_current_assets DECIMAL(15,2),
    total_current_assets DECIMAL(15,2),
    ppe DECIMAL(15,2),
    intangible_assets DECIMAL(15,2),
    goodwill DECIMAL(15,2),
    other_assets DECIMAL(15,2),
    total_assets DECIMAL(15,2),
    accounts_payable DECIMAL(15,2),
    accrued_expenses DECIMAL(15,2),
    short_term_debt DECIMAL(15,2),
    other_current_liabilities DECIMAL(15,2),
    total_current_liabilities DECIMAL(15,2),
    long_term_debt DECIMAL(15,2),
    other_liabilities DECIMAL(15,2),
    total_liabilities DECIMAL(15,2),
    common_stock DECIMAL(15,2),
    retained_earnings DECIMAL(15,2),
    other_equity DECIMAL(15,2),
    total_equity DECIMAL(15,2),
    total_liabilities_equity DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cash Flow data table
CREATE TABLE IF NOT EXISTS cash_flow_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    net_income DECIMAL(15,2),
    depreciation DECIMAL(15,2),
    amortization DECIMAL(15,2),
    changes_in_working_capital DECIMAL(15,2),
    operating_cash_flow DECIMAL(15,2),
    capex DECIMAL(15,2),
    acquisitions DECIMAL(15,2),
    investing_cash_flow DECIMAL(15,2),
    debt_issuance DECIMAL(15,2),
    debt_repayment DECIMAL(15,2),
    dividends DECIMAL(15,2),
    financing_cash_flow DECIMAL(15,2),
    net_cash_flow DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Working Capital data table
CREATE TABLE IF NOT EXISTS working_capital_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    days_receivables INTEGER,
    days_inventory INTEGER,
    days_payables INTEGER,
    cash_cycle INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth Assumptions data table
CREATE TABLE IF NOT EXISTS growth_assumptions_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    gr_revenue_1 DECIMAL(5,4),
    gr_revenue_2 DECIMAL(5,4),
    gr_revenue_3 DECIMAL(5,4),
    gr_revenue_4 DECIMAL(5,4),
    gr_revenue_5 DECIMAL(5,4),
    gr_cost_1 DECIMAL(5,4),
    gr_cost_2 DECIMAL(5,4),
    gr_cost_3 DECIMAL(5,4),
    gr_cost_4 DECIMAL(5,4),
    gr_cost_5 DECIMAL(5,4),
    gr_cost_oper_1 DECIMAL(5,4),
    gr_cost_oper_2 DECIMAL(5,4),
    gr_cost_oper_3 DECIMAL(5,4),
    gr_cost_oper_4 DECIMAL(5,4),
    gr_cost_oper_5 DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasonality data table
CREATE TABLE IF NOT EXISTS seasonality_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    january DECIMAL(5,4),
    february DECIMAL(5,4),
    march DECIMAL(5,4),
    april DECIMAL(5,4),
    may DECIMAL(5,4),
    june DECIMAL(5,4),
    july DECIMAL(5,4),
    august DECIMAL(5,4),
    september DECIMAL(5,4),
    october DECIMAL(5,4),
    november DECIMAL(5,4),
    december DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt Structure data table
CREATE TABLE IF NOT EXISTS debt_structure_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    total_debt DECIMAL(15,2),
    interest_rate DECIMAL(5,4),
    maturity_date DATE,
    payment_frequency VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Debt Calculations table (for calculated schedules)
CREATE TABLE IF NOT EXISTS debt_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    month INTEGER,
    year INTEGER,
    opening_balance DECIMAL(15,2),
    payment DECIMAL(15,2),
    interest_payment DECIMAL(15,2),
    principal_payment DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    cumulative_interest DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Depreciation Schedule table (for calculated schedules)
CREATE TABLE IF NOT EXISTS depreciation_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    month INTEGER,
    year INTEGER,
    asset_value DECIMAL(15,2),
    depreciation_method VARCHAR(50),
    depreciation_rate DECIMAL(5,4),
    monthly_depreciation DECIMAL(15,2),
    accumulated_depreciation DECIMAL(15,2),
    net_book_value DECIMAL(15,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_company_details_project_id ON company_details(project_id);
CREATE INDEX IF NOT EXISTS idx_profit_loss_data_project_id ON profit_loss_data(project_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_data_project_id ON balance_sheet_data(project_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_data_project_id ON cash_flow_data(project_id);
CREATE INDEX IF NOT EXISTS idx_working_capital_data_project_id ON working_capital_data(project_id);
CREATE INDEX IF NOT EXISTS idx_growth_assumptions_data_project_id ON growth_assumptions_data(project_id);
CREATE INDEX IF NOT EXISTS idx_seasonality_data_project_id ON seasonality_data(project_id);
CREATE INDEX IF NOT EXISTS idx_debt_structure_data_project_id ON debt_structure_data(project_id);
CREATE INDEX IF NOT EXISTS idx_debt_calculations_project_id ON debt_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_schedule_project_id ON depreciation_schedule(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_details_updated_at BEFORE UPDATE ON company_details FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profit_loss_data_updated_at BEFORE UPDATE ON profit_loss_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_balance_sheet_data_updated_at BEFORE UPDATE ON balance_sheet_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cash_flow_data_updated_at BEFORE UPDATE ON cash_flow_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_working_capital_data_updated_at BEFORE UPDATE ON working_capital_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_growth_assumptions_data_updated_at BEFORE UPDATE ON growth_assumptions_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seasonality_data_updated_at BEFORE UPDATE ON seasonality_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debt_structure_data_updated_at BEFORE UPDATE ON debt_structure_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debt_calculations_updated_at BEFORE UPDATE ON debt_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_depreciation_schedule_updated_at BEFORE UPDATE ON depreciation_schedule FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
