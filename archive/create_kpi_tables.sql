-- Create KPI tables for different time periods
-- Monthly KPIs
CREATE TABLE IF NOT EXISTS monthly_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    
    -- Debt-related KPIs
    debt_to_ebitda DECIMAL(10,4),
    debt_service_coverage_ratio DECIMAL(10,4),
    loan_to_value_ratio DECIMAL(10,4),
    interest_coverage_ratio DECIMAL(10,4),
    
    -- Liquidity KPIs
    current_ratio DECIMAL(10,4),
    quick_ratio DECIMAL(10,4),
    
    -- Leverage KPIs
    debt_to_equity_ratio DECIMAL(10,4),
    
    -- Profitability KPIs
    operating_margin DECIMAL(10,4),
    
    -- Cash Flow KPIs
    fcff DECIMAL(15,2),
    fcfe DECIMAL(15,2),
    
    -- Working Capital KPIs
    ar_cycle_days DECIMAL(10,2),
    inventory_cycle_days DECIMAL(10,2),
    
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quarterly KPIs
CREATE TABLE IF NOT EXISTS quarterly_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    quarter_name VARCHAR(20) NOT NULL,
    
    -- Debt-related KPIs
    debt_to_ebitda DECIMAL(10,4),
    debt_service_coverage_ratio DECIMAL(10,4),
    loan_to_value_ratio DECIMAL(10,4),
    interest_coverage_ratio DECIMAL(10,4),
    
    -- Liquidity KPIs
    current_ratio DECIMAL(10,4),
    quick_ratio DECIMAL(10,4),
    
    -- Leverage KPIs
    debt_to_equity_ratio DECIMAL(10,4),
    
    -- Profitability KPIs
    operating_margin DECIMAL(10,4),
    
    -- Cash Flow KPIs
    fcff DECIMAL(15,2),
    fcfe DECIMAL(15,2),
    
    -- Working Capital KPIs
    ar_cycle_days DECIMAL(10,2),
    inventory_cycle_days DECIMAL(10,2),
    
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Yearly KPIs
CREATE TABLE IF NOT EXISTS yearly_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    
    -- Debt-related KPIs
    debt_to_ebitda DECIMAL(10,4),
    debt_service_coverage_ratio DECIMAL(10,4),
    loan_to_value_ratio DECIMAL(10,4),
    interest_coverage_ratio DECIMAL(10,4),
    
    -- Liquidity KPIs
    current_ratio DECIMAL(10,4),
    quick_ratio DECIMAL(10,4),
    
    -- Leverage KPIs
    debt_to_equity_ratio DECIMAL(10,4),
    
    -- Profitability KPIs
    operating_margin DECIMAL(10,4),
    
    -- Cash Flow KPIs
    fcff DECIMAL(15,2),
    fcfe DECIMAL(15,2),
    
    -- Working Capital KPIs
    ar_cycle_days DECIMAL(10,2),
    inventory_cycle_days DECIMAL(10,2),
    
    calculation_run_id UUID REFERENCES calculation_runs(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_kpis_project_id ON monthly_kpis(project_id);
CREATE INDEX IF NOT EXISTS idx_monthly_kpis_calculation_run_id ON monthly_kpis(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_monthly_kpis_year_month ON monthly_kpis(year, month);

CREATE INDEX IF NOT EXISTS idx_quarterly_kpis_project_id ON quarterly_kpis(project_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_kpis_calculation_run_id ON quarterly_kpis(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_quarterly_kpis_year_quarter ON quarterly_kpis(year, quarter);

CREATE INDEX IF NOT EXISTS idx_yearly_kpis_project_id ON yearly_kpis(project_id);
CREATE INDEX IF NOT EXISTS idx_yearly_kpis_calculation_run_id ON yearly_kpis(calculation_run_id);
CREATE INDEX IF NOT EXISTS idx_yearly_kpis_year ON yearly_kpis(year); 