# 🔗 **SUPABASE CONNECTION GUIDE**

## 📋 **QUICK START**

### **1. Test Your Connection**
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the test page:
   ```
   http://localhost:5173/dashboard/test-supabase
   ```

3. Click "Run Connection Tests" to verify everything is working

### **2. What's Already Configured**
- ✅ **Supabase Client** - Already set up in `src/integrations/supabase/client.ts`
- ✅ **Database Types** - TypeScript types generated in `src/integrations/supabase/types.ts`
- ✅ **Database Schema** - All tables already exist in your Supabase project
- ✅ **Authentication** - Auth system already configured

### **3. How to Use Supabase in Your Code**

#### **Basic Usage:**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Read data
const { data, error } = await supabase
  .from('profit_loss_data')
  .select('*')
  .eq('project_id', 'your-project-id');

// Insert data
const { data, error } = await supabase
  .from('profit_loss_data')
  .insert({
    project_id: 'your-project-id',
    revenue: 1000000,
    cogs: -600000,
    // ... other fields
  });

// Update data
const { data, error } = await supabase
  .from('profit_loss_data')
  .update({ revenue: 1200000 })
  .eq('project_id', 'your-project-id');
```

#### **Using the Data Service:**
```typescript
import { SupabaseDataService } from '@/services/api/SupabaseDataService';

// Save P&L data
await SupabaseDataService.saveProfitLossData(projectId, {
  revenue: 1000000,
  cogs: -600000,
  operating_expenses: -200000,
  // ... other fields
});

// Load project data
const projectData = await SupabaseDataService.loadProjectData(projectId);

// Create a new project
const newProject = await SupabaseDataService.createProject({
  name: 'My Financial Project',
  description: 'Project description',
  company_id: 'company-id'
});
```

---

## 🗄️ **DATABASE SCHEMA OVERVIEW**

### **Main Tables:**

#### **`profit_loss_data`**
- Revenue, COGS, Operating Expenses
- EBITDA, Depreciation, Interest, Taxes
- Net Income calculations

#### **`balance_sheet_data`**
- Cash, AR, Inventory, PPE
- AP, Debt, Equity
- Total Assets and Liabilities

#### **`debt_structure_data`**
- Senior Secured debt configuration
- Short Term debt configuration
- Interest rates, maturity, amortization

#### **`growth_assumptions_data`**
- Multi-year growth rates (12 years)
- Revenue, cost, operating cost, CAPEX growth

#### **`working_capital_data`**
- AR as % of revenue
- Inventory as % of COGS
- AP as % of COGS/OPEX

#### **`seasonality_data`**
- Monthly revenue distribution
- Seasonal working capital patterns

#### **`financial_calculations`**
- KPI results storage
- Debt ratios, profitability ratios
- Liquidity ratios

---

## 🔧 **IMPLEMENTATION STEPS**

### **Step 1: Connect Data Entry Forms**
```typescript
// In your DataEntry component
import { SupabaseDataService } from '@/services/api/SupabaseDataService';

const handleSave = async (formData: DataEntryFormData) => {
  try {
    await SupabaseDataService.saveProfitLossData(projectId, {
      revenue: parseFloat(formData.revenue),
      cogs: parseFloat(formData.cogs),
      // ... other fields
    });
    
    toast({
      title: "Data Saved",
      description: "Your financial data has been saved to Supabase.",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to save data: ${error.message}`,
      variant: "destructive",
    });
  }
};
```

### **Step 2: Auto-save Functionality**
```typescript
// Debounced auto-save
const debouncedSave = useCallback(
  debounce(async (data: Partial<DataEntryFormData>) => {
    if (projectId) {
      await SupabaseDataService.saveProfitLossData(projectId, data);
    }
  }, 1000), // Save after 1 second of inactivity
  [projectId]
);

// Use in form onChange
const handleFormChange = (data: Partial<DataEntryFormData>) => {
  setFormData(prev => ({ ...prev, ...data }));
  debouncedSave(data);
};
```

### **Step 3: Load Existing Data**
```typescript
// Load data when component mounts
useEffect(() => {
  const loadData = async () => {
    if (projectId) {
      try {
        const projectData = await SupabaseDataService.loadProjectData(projectId);
        setFormData({
          revenue: projectData.profitLossData?.revenue?.toString() || '',
          cogs: projectData.profitLossData?.cogs?.toString() || '',
          // ... map other fields
        });
      } catch (error) {
        console.error('Failed to load project data:', error);
      }
    }
  };
  
  loadData();
}, [projectId]);
```

---

## 🚀 **NEXT STEPS**

### **1. Test the Connection**
- Go to `/dashboard/test-supabase`
- Run the connection tests
- Verify all operations work

### **2. Update Your Data Entry Forms**
- Add auto-save functionality
- Connect forms to Supabase
- Add loading states

### **3. Build the Calculation Engine**
- Create real-time calculation hooks
- Connect calculations to Supabase
- Update charts with real data

### **4. Add Project Management**
- Create/select projects
- Load/save project data
- User authentication integration

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues:**

#### **Connection Failed**
- Check your Supabase URL and API key
- Verify your project is active
- Check network connectivity

#### **Authentication Error**
- Make sure user is logged in
- Check auth token expiration
- Verify user permissions

#### **Database Error**
- Check table names match exactly
- Verify column names and types
- Check RLS (Row Level Security) policies

#### **TypeScript Errors**
- Run `npm run build` to check types
- Verify type definitions are up to date
- Check import paths

---

## 📚 **RESOURCES**

- **Supabase Docs**: https://supabase.com/docs
- **TypeScript Guide**: https://supabase.com/docs/guides/api/typescript-support
- **Database Schema**: Check `src/integrations/supabase/types.ts`
- **Client Configuration**: Check `src/integrations/supabase/client.ts`

**Your Supabase connection is ready to use! Start by testing the connection, then integrate it into your data entry forms.** 🚀 