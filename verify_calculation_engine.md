# Calculation Engine Verification Guide

## 🎯 **Step-by-Step Verification**

### 1. **Database Tables Check**

Open the test page: `test_database_connection.html` and run the tests:

1. **Test 1: Check if tables exist** - Should show ✅ if tables are accessible
2. **Test 2: Test Debt Calculations API** - Should show ✅ if API is working
3. **Test 3: Test Depreciation API** - Should show ✅ if API is working
4. **Test 4: Create Sample Data** - Should create sample data successfully

### 2. **Manual Database Check**

If the tests fail, run these SQL commands in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('debt_calculations', 'depreciation_schedule', 'projects');

-- Check table structure
\d debt_calculations;
\d depreciation_schedule;
\d projects;
```

### 3. **Create Missing Tables**

If any tables are missing, run these SQL commands:

#### **Create Projects Table:**
```sql
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own projects" ON projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (user_id = auth.uid());

-- Insert default project
INSERT INTO projects (id, user_id, name, description) 
VALUES (
    'default-project'::UUID, 
    (SELECT id FROM auth.users LIMIT 1), 
    'Default Project', 
    'Default project for testing calculations'
) ON CONFLICT (id) DO NOTHING;
```

### 4. **Test Calculation Engine Page**

1. **Navigate to:** `http://localhost:8080/dashboard/calculation-engine`
2. **Try debt calculations:**
   - Fill in the form with sample data
   - Click "Calculate Debt Schedule"
   - Check if results appear

3. **Try depreciation calculations:**
   - Switch to "Depreciation Schedule" tab
   - Fill in asset details
   - Click "Calculate Depreciation Schedule"
   - Check if results appear

### 5. **Expected Results**

#### **Debt Calculation Test:**
- **Input:** Principal: 12000, Additional Loan: 60000, Interest Rate: 7%
- **Expected:** Monthly schedule with opening/closing balances
- **Summary:** Total interest, repayment, final balance

#### **Depreciation Test:**
- **Input:** Asset Value: 100000, Years: 5, Method: Straight Line
- **Expected:** Monthly depreciation schedule
- **Summary:** Total depreciation, final net book value

### 6. **Troubleshooting**

#### **If tables don't exist:**
```sql
-- Run the manual setup SQL from MANUAL_DATABASE_SETUP.md
```

#### **If API calls fail:**
- Check Edge Function logs in Supabase Dashboard
- Verify CORS settings
- Check authentication headers

#### **If calculation engine page doesn't load:**
- Check browser console for errors
- Verify the route is added to App.tsx
- Check if all imports are working

### 7. **Success Indicators**

✅ **Database Tables:** All tables exist and are accessible
✅ **API Endpoints:** Edge Functions respond correctly
✅ **Calculation Engine:** Page loads and calculations work
✅ **Data Persistence:** Results are saved to database
✅ **Export Functionality:** CSV export works

### 8. **Next Steps After Verification**

1. **Integration:** Connect calculation engine to data entry forms
2. **Real-time Updates:** Add calculation triggers to form changes
3. **Advanced Features:** Add more calculation types
4. **Charts Integration:** Connect results to existing charts

## 🚀 **Quick Test Commands**

```bash
# Test if development server is running
curl -s http://localhost:8080 | head -5

# Test Edge Functions
curl -X GET "https://vmrvugezqpydlfjcoldl.supabase.co/functions/v1/debt-calculations/default-project/senior_secured" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnZ1Z2V6cXB5ZGxmamNvbGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTgxNTEsImV4cCI6MjA2OTM5NDE1MX0.gG3F0SxaIoCZoM5FhjB4YfrHwQkVBj9BpK94ldl_gBE"
```

## 📊 **Expected Database Schema**

After successful setup, you should have:

- ✅ `projects` table with RLS policies
- ✅ `debt_calculations` table with RLS policies  
- ✅ `depreciation_schedule` table with RLS policies
- ✅ Proper indexes for performance
- ✅ Updated_at triggers for all tables 