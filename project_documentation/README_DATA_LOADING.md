# 📊 Data Entry Default Values Loading Scripts

This directory contains scripts to load all **128 Data Entry fields** with realistic default values based on your Excel and Streamlit app.

## 🎯 What These Scripts Do

- ✅ **Load all 128 Data Entry fields** with realistic default values
- ✅ **Use values from your Excel and Streamlit app** for consistency
- ✅ **Follow API abstraction layer pattern** for maintainability
- ✅ **Use Supabase Edge Function** to bypass RLS authentication issues
- ✅ **Connect to your existing project**: `05632bb7-b506-453d-9ca1-253344e04b6b`

## 📊 Field Breakdown (128 Total Fields)

| Category | Fields | Description |
|----------|--------|-------------|
| **Company Details** | 13 | Company name, industry, region, etc. |
| **Profit & Loss** | 12 | Revenue, costs, EBITDA, taxes, etc. |
| **Balance Sheet** | 19 | Assets, liabilities, equity, capex, etc. |
| **Cash Flow** | 4 | Operating, investing, financing flows |
| **Working Capital** | 4 | Receivables, inventory, payables % |
| **Growth Assumptions** | 48 | 12 years × 4 categories (revenue, cost, operating, capex) |
| **Seasonality** | 14 | Monthly patterns and working capital |
| **Debt Structure** | 14 | Senior secured and short-term debt terms |
| **TOTAL** | **128** | **All Data Entry fields** |

## 🚀 How to Use

### Option 1: Browser Interface (Recommended)

1. **Open the HTML file**:
   ```bash
   open load_default_data.html
   ```

2. **Click the button** to load all 128 fields with a nice progress interface

3. **Watch the real-time progress** as each category loads

### Option 2: Test Edge Function

1. **Open the test file**:
   ```bash
   open test_edge_function.html
   ```

2. **Click "Test Edge Function"** to verify the Edge Function is working

## 📋 Default Values Source

All default values are based on your **Excel and Streamlit app**:

### **Debt Structure** (Based on Excel)
- Senior Secured: 12,000 + 50,000 additional loan
- Short Term: 1,000 + 70,000 additional loan
- Interest rates: 5% + 1% + 1% = 7% (senior), 6% + 1.5% + 1.5% = 9% (short term)

### **Depreciation** (Based on Excel)
- PPE: 15,000 (opening balance)
- Capex: 20,000 annually (1,667 monthly)
- Depreciation: 10 years (10% annually)

### **Profit & Loss** (Based on Excel)
- Revenue: 4,550
- EBITDA: 1,548
- Net Income: 1,189
- Tax Rate: 30%

## 🔧 API Abstraction Layer

The scripts use a **Supabase Edge Function** for proper API abstraction:

```typescript
// Edge Function (supabase/functions/load-default-data/index.ts)
// Uses service role key to bypass RLS authentication issues
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);
```

This ensures:
- ✅ **Database independence** (can switch from Supabase to PostgreSQL)
- ✅ **Consistent error handling**
- ✅ **Reusable API patterns**
- ✅ **Easy testing and maintenance**
- ✅ **Bypasses RLS authentication issues**

## 🎯 Integration with Calculation Engine

After loading the default data:

1. **Go to Data Entry**: `http://localhost:8080/dashboard/data-entry`
   - All 128 fields will be pre-populated
   - You can modify values as needed

2. **Go to Calculation Engine**: `http://localhost:8080/dashboard/calculation-engine`
   - Will automatically load values from Data Entry
   - Debt calculations will use: 12,000 principal + 50,000 additional loan
   - Depreciation will use: 15,000 PPE + 20,000 annual capex

## 🔍 Verification

After running the script, you can verify the data was loaded by:

1. **Check Supabase Dashboard**: All tables should have data
2. **Check Data Entry page**: All fields should be populated
3. **Check Calculation Engine**: Should use Data Entry values instead of hardcoded defaults

## 🛠️ Troubleshooting

### Common Issues:

1. **Edge Function Not Deployed**: Run `npx supabase functions deploy load-default-data`
2. **Authentication Error**: Edge Function uses service role key automatically
3. **Network Error**: Ensure internet connection and Supabase is accessible

### Error Messages:

- `401 Unauthorized` - Edge Function authentication issue
- `404 Not Found` - Edge Function not deployed
- `500 Internal Server Error` - Database or RLS issue

## 📝 Customization

To modify default values:

1. **Edit the `defaultData` object** in `supabase/functions/load-default-data/index.ts`
2. **Update values** to match your specific requirements
3. **Deploy the function**: `npx supabase functions deploy load-default-data`
4. **Re-run the script** to load new values

## 🎉 Success Indicators

When the script runs successfully, you should see:

```
🎉 SUCCESS! All 128 Data Entry fields loaded with default values!
📊 Message: All 128 Data Entry fields loaded successfully!
📋 Detailed Results:
✅ company_details: Loaded successfully
✅ profit_loss_data: Loaded successfully
✅ balance_sheet_data: Loaded successfully
...
```

## 🔗 Related Files

- `load_default_data.html` - Browser interface
- `test_edge_function.html` - Edge Function test page
- `supabase/functions/load-default-data/index.ts` - Edge Function
- `README_DATA_LOADING.md` - This documentation

## 🚀 Deployment

The Edge Function is already deployed and ready to use. If you need to redeploy:

```bash
cd supabase
npx supabase functions deploy load-default-data
```

---

**Ready to load your default data? Open `load_default_data.html` and click the button! 🚀** 