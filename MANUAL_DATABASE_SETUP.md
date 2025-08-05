# Manual Database Setup Instructions

Since the Supabase CLI linking is having authentication issues, here's how to manually set up the database tables:

## Option 1: Use Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project: `ttf-refinancing` (vmrvugezqpydlfjcoldl)
3. Navigate to **SQL Editor**

### Step 2: Create Debt Calculations Table
Run this SQL in the SQL Editor:

```sql
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
```

### Step 3: Create Depreciation Schedule Table
Run this SQL in the SQL Editor:

```sql
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
```

### Step 4: Create Indexes
Run this SQL:

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_debt_calculations_project_id ON debt_calculations(project_id);
CREATE INDEX IF NOT EXISTS idx_debt_calculations_debt_type ON debt_calculations(debt_type);
CREATE INDEX IF NOT EXISTS idx_debt_calculations_month_cum ON debt_calculations(month_cum);

CREATE INDEX IF NOT EXISTS idx_depreciation_schedule_project_id ON depreciation_schedule(project_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_schedule_month_cum ON depreciation_schedule(month_cum);
```

### Step 5: Create Updated At Trigger
Run this SQL:

```sql
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
```

### Step 6: Enable RLS and Create Policies
Run this SQL:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE debt_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_schedule ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for debt_calculations
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

-- Create RLS policies for depreciation_schedule
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
```

## Option 2: Use Supabase CLI (Alternative)

If you want to try the CLI approach again:

1. **Get your database password:**
   - Go to Supabase Dashboard → Settings → Database
   - Copy the database password

2. **Link the project:**
   ```bash
   npx supabase link --project-ref vmrvugezqpydlfjcoldl
   # Enter your database password when prompted
   ```

3. **Push the migration:**
   ```bash
   npx supabase db push
   ```

## Option 3: Use Direct SQL Connection

If you have the database connection details, you can run the SQL directly using any PostgreSQL client.

## Verification

After setting up the tables, you can verify they exist by:

1. Going to Supabase Dashboard → Table Editor
2. You should see `debt_calculations` and `depreciation_schedule` tables
3. Check that the RLS policies are enabled

## Next Steps

Once the tables are created:

1. **Test the Calculation Engine:**
   - Go to `http://localhost:8080/dashboard/calculation-engine`
   - Try running some calculations

2. **Verify API Endpoints:**
   - The Edge Functions are already deployed
   - Test the API endpoints with sample data

3. **Integration:**
   - Connect the calculation engine to your existing data entry forms
   - Add calculation triggers to the data entry process

## Edge Functions Status

✅ **Already Deployed:**
- `debt-calculations` - Handles debt calculation CRUD
- `depreciation-schedule` - Handles depreciation CRUD

The Edge Functions are ready to use once the database tables are created! 