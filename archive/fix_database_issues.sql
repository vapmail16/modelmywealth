-- Fix Database Issues Script
-- Run this in Supabase SQL Editor

-- 1. Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create index for projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- 3. Enable RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (user_id = auth.uid());

-- 5. Insert a default project for testing (using a valid UUID)
INSERT INTO projects (id, user_id, name, description) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID, 
    (SELECT id FROM auth.users LIMIT 1), 
    'Default Project', 
    'Default project for testing calculations'
) ON CONFLICT (id) DO NOTHING;

-- 6. Check if debt_calculations table has correct foreign key
-- If the foreign key is causing issues, we'll temporarily disable it for testing
ALTER TABLE debt_calculations DROP CONSTRAINT IF EXISTS debt_calculations_project_id_fkey;

-- 7. Recreate the foreign key constraint
ALTER TABLE debt_calculations 
ADD CONSTRAINT debt_calculations_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 8. Check if depreciation_schedule table has correct foreign key
ALTER TABLE depreciation_schedule DROP CONSTRAINT IF EXISTS depreciation_schedule_project_id_fkey;

-- 9. Recreate the foreign key constraint
ALTER TABLE depreciation_schedule 
ADD CONSTRAINT depreciation_schedule_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 10. Insert test data to verify everything works
INSERT INTO debt_calculations (
    project_id, 
    debt_type, 
    month_cum, 
    year, 
    month, 
    opening_balance, 
    additional_loan, 
    amortisation, 
    interest, 
    repayment, 
    closing_balance
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    'senior_secured',
    1,
    1,
    'January',
    12000,
    60000,
    0,
    420,
    0,
    72420
) ON CONFLICT (project_id, debt_type, month_cum) DO NOTHING;

-- 11. Insert test depreciation data
INSERT INTO depreciation_schedule (
    project_id,
    month_cum,
    year,
    month,
    asset_value,
    depreciation_rate,
    monthly_depreciation,
    accumulated_depreciation,
    net_book_value
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::UUID,
    1,
    1,
    'January',
    100000,
    0.0167,
    1667,
    1667,
    98333
) ON CONFLICT (project_id, month_cum) DO NOTHING;

-- 12. Verify the data was inserted
SELECT 'debt_calculations' as table_name, COUNT(*) as count FROM debt_calculations
UNION ALL
SELECT 'depreciation_schedule' as table_name, COUNT(*) as count FROM depreciation_schedule
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as count FROM projects; 