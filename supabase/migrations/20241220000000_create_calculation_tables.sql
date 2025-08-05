-- Create debt_calculations table
CREATE TABLE IF NOT EXISTS debt_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    debt_type VARCHAR(50) NOT NULL CHECK (debt_type IN ('senior_secured', 'short_term')),
    month_cum INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    additional_loan DECIMAL(15,2) DEFAULT 0,
    amortisation DECIMAL(15,2) DEFAULT 0,
    interest DECIMAL(15,2) DEFAULT 0,
    repayment DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of project, debt type, and month
    UNIQUE(project_id, debt_type, month_cum)
);

-- Create depreciation_schedule table
CREATE TABLE IF NOT EXISTS depreciation_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    month_cum INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month VARCHAR(20) NOT NULL,
    asset_value DECIMAL(15,2) DEFAULT 0,
    depreciation_rate DECIMAL(5,4) DEFAULT 0,
    monthly_depreciation DECIMAL(15,2) DEFAULT 0,
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    net_book_value DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of project and month
    UNIQUE(project_id, month_cum)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debt_calculations_project_id ON debt_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_debt_calculations_debt_type ON debt_calculations(debt_type);
CREATE INDEX IF NOT EXISTS idx_debt_calculations_month_cum ON debt_calculations(month_cum);

CREATE INDEX IF NOT EXISTS idx_depreciation_schedule_project_id ON depreciation_schedule(project_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_schedule_month_cum ON depreciation_schedule(month_cum);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_debt_calculations_updated_at 
    BEFORE UPDATE ON debt_calculations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_depreciation_schedule_updated_at 
    BEFORE UPDATE ON depreciation_schedule 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE debt_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own debt calculations" ON debt_calculations
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own debt calculations" ON debt_calculations
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own debt calculations" ON debt_calculations
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own debt calculations" ON debt_calculations
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own depreciation schedule" ON depreciation_schedule
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own depreciation schedule" ON depreciation_schedule
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own depreciation schedule" ON depreciation_schedule
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own depreciation schedule" ON depreciation_schedule
    FOR DELETE USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    ); 