# 🔧 Troubleshooting Guide - Modular Architecture Implementation

## 📋 Overview
This guide documents all issues encountered while implementing the modular architecture for Company Info, P&L, and Balance Sheet sections. Use this as a reference when implementing new sections to avoid common pitfalls.

## 🏗️ Architecture Pattern
Each section follows the **4-Backend + 4-Frontend** modular pattern:

### Backend Files (4 files):
1. **Repository** (`api-server/repositories/[section]Repository.js`) - Database operations
2. **Service** (`api-server/services/[section]Service.js`) - Business logic & change detection
3. **Controller** (`api-server/controllers/[section]Controller.js`) - HTTP request handling
4. **Routes** (`api-server/routes/[section]Routes.js`) - API endpoint definitions

### Frontend Files (4 files):
1. **Types** (`src/types/[section].ts`) - TypeScript interfaces
2. **API Service** (`src/services/api/[section]ApiService.ts`) - HTTP communication
3. **Hook** (`src/hooks/use[section]Data.ts`) - React state management
4. **Component** (`src/components/forms/[section]Form.tsx`) - UI component

---

## 🚨 Common Issues & Solutions

### 1. **Import Path Errors**

#### Issue: `Cannot find module '../middleware/authMiddleware'`
**Error Message:**
```
Error: Cannot find module '../middleware/authMiddleware'
```

**Solution:**
- **Correct path:** `require('../middleware/auth')`
- **Check:** Verify middleware file exists at `api-server/middleware/auth.js`

#### Issue: `Cannot find module '../middleware/rateLimiters'`
**Error Message:**
```
Error: Cannot find module '../middleware/rateLimiters'
```

**Solution:**
- **Correct path:** `require('../middleware/rateLimiter')`
- **Check:** Verify rate limiter file exists at `api-server/middleware/rateLimiter.js`

**Prevention:**
```javascript
// Always verify these imports in routes files:
const authMiddleware = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');
```

### 2. **Database Constraint Violations**

#### Issue: `null value in column "table_name" violates not-null constraint`
**Error Message:**
```
Database query error: error: null value in column "table_name" of relation "data_entry_audit_log" violates not-null constraint
```

**Root Cause:** Parameter name mismatch between service and audit service
- **Service sends:** camelCase parameters (`tableName`, `recordId`, `oldValues`, etc.)
- **Audit service expects:** snake_case parameters (`table_name`, `record_id`, `old_values`, etc.)

**Solution:**
```javascript
// ❌ WRONG - camelCase parameters
await auditService.logChange({
  tableName: 'balance_sheet_data',
  recordId: updatedData.id,
  oldValues: existingData,
  newValues: updatedData,
  changedFields: changes.changedFields,
  changeReason: changeReason,
  userId: userId,
  ipAddress: null
});

// ✅ CORRECT - snake_case parameters
await auditService.logChange({
  table_name: 'balance_sheet_data',
  record_id: updatedData.id,
  old_values: existingData,
  new_values: updatedData,
  changed_fields: changes.changedFields,
  change_reason: changeReason,
  user_id: userId,
  ip_address: null
});
```

### 3. **Change Detection Issues**

#### Issue: "No changes detected" when values are actually saved
**Symptoms:**
- Data saves to database correctly
- Audit log shows changes
- Frontend shows "No changes detected"
- Backend change detection returns false

**Root Cause:** Type mismatch in comparison
- **Database:** Numeric values (e.g., `15`)
- **Frontend:** String values (e.g., `"15"`)
- **Comparison:** `15 !== "15"` returns true

**Solution:** Implement proper type conversion in `valuesAreDifferent` method
```javascript
valuesAreDifferent(currentValue, newValue) {
  // Handle null/undefined/empty string equivalencies
  if (currentValue === null && (newValue === undefined || newValue === '')) return false;
  if (currentValue === undefined && (newValue === null || newValue === '')) return false;
  if ((currentValue === null || currentValue === undefined) && newValue === '') return false;
  if ((newValue === null || newValue === undefined) && currentValue === '') return false;
  
  // Handle string-to-number conversions
  if (typeof currentValue === 'number' && typeof newValue === 'string') {
    return currentValue !== parseInt(newValue) && currentValue !== parseFloat(newValue);
  }
  if (typeof newValue === 'number' && typeof currentValue === 'string') {
    return newValue !== parseInt(currentValue) && newValue !== parseFloat(currentValue);
  }
  
  return currentValue !== newValue;
}
```

### 4. **Frontend Response Handling Issues**

#### Issue: Frontend can't access audit information
**Symptoms:**
- Backend detects changes correctly
- Database saves changes correctly
- Frontend shows "No changes detected"
- `result.audit` is undefined

**Root Cause:** Controller not including audit info in response

**Solution:** Include audit information in controller responses
```javascript
// ❌ WRONG - Missing audit info
res.json({
  success: true,
  data: result,
  message: 'Data updated successfully'
});

// ✅ CORRECT - Include audit info
res.json({
  success: true,
  data: result,
  audit: result.audit,  // ← Add this line
  message: result.audit.changesDetected 
    ? 'Data updated successfully' 
    : 'No changes detected'
});
```

### 5. **Column Name Consistency Issues**

#### Issue: Frontend/Backend column mismatch
**Symptoms:**
- Data not saving
- Validation errors
- Type mismatches

**Solution:** Ensure consistent naming across all layers
```typescript
// ✅ Consistent naming pattern:
// Database: snake_case
// API: snake_case  
// Frontend: snake_case (for form data)
// TypeScript: snake_case (for interfaces)
```

### 6. **Server Integration Issues**

#### Issue: Routes not registered
**Symptoms:**
- 404 errors for new endpoints
- Routes not found

**Solution:** Register routes in `server.js`
```javascript
// Add to api-server/server.js
app.use("/api/balance-sheet", require("./routes/balanceSheetRoutes"));
```

### 7. **Data Persistence Issues**

#### Issue: Data disappears after logout/login
**Symptoms:**
- Data saves but vanishes on session change
- Progress not updated

**Root Causes:**
1. **Wrong project ID** - Check if using correct project UUID
2. **Database connection issues** - Verify PostgreSQL connection
3. **Transaction rollback** - Check for uncommitted transactions

**Debugging Steps:**
```bash
# Check if data exists in database
psql -h localhost -p 5432 -U postgres -d refi_wizard -c "SELECT * FROM balance_sheet_data WHERE project_id = 'your-project-id';"

# Check audit log
psql -h localhost -p 5432 -U postgres -d refi_wizard -c "SELECT * FROM data_entry_audit_log WHERE table_name = 'balance_sheet_data' ORDER BY created_at DESC LIMIT 5;"
```

---

## 🔍 Debugging Checklist

### Before Implementation:
- [ ] Verify all 4 backend files follow the template pattern
- [ ] Verify all 4 frontend files follow the template pattern
- [ ] Check import paths in routes file
- [ ] Ensure column names match across all layers
- [ ] Register routes in `server.js`

### After Implementation:
- [ ] Test backend API with `curl` commands
- [ ] Verify database operations work
- [ ] Check audit logging functionality
- [ ] Test frontend integration
- [ ] Verify change detection works
- [ ] Test data persistence across sessions

### Common Test Commands:
```bash
# Test backend health
curl -X GET "http://localhost:3001/api/health" | jq .

# Test data retrieval
curl -X GET "http://localhost:3001/api/balance-sheet/PROJECT_ID" | jq .

# Test data update
curl -X PUT "http://localhost:3001/api/balance-sheet/PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{"cash": "1000000"}' | jq .

# Check database
psql -h localhost -p 5432 -U postgres -d refi_wizard -c "SELECT * FROM balance_sheet_data;"
```

---

## 📚 Template Files Reference

### Backend Templates:
- **Repository:** `api-server/repositories/companyRepository.js`
- **Service:** `api-server/services/companyService.js`
- **Controller:** `api-server/controllers/companyController.js`
- **Routes:** `api-server/routes/companyRoutes.js`

### Frontend Templates:
- **Types:** `src/types/company.ts`
- **API Service:** `src/services/api/companyApiService.ts`
- **Hook:** `src/hooks/useCompanyData.ts`
- **Component:** `src/components/forms/CompanyForm.tsx`

---

## 🎯 Best Practices

### 1. **Consistent Naming**
- Use snake_case for all database columns
- Use snake_case for API request/response fields
- Use snake_case for TypeScript interfaces
- Use snake_case for form data

### 2. **Error Handling**
- Always include proper error handling in try-catch blocks
- Log errors with context information
- Return meaningful error messages to frontend

### 3. **Audit Trail**
- Always log changes to audit table
- Include change reason and user information
- Track old and new values

### 4. **Change Detection**
- Implement proper type conversion
- Handle null/undefined/empty string equivalencies
- Compare values correctly across types

### 5. **Response Structure**
- Always include audit information in responses
- Use consistent response format
- Include success/error indicators

### 6. **Audit Table Column Names**
- **Issue:** `column "user_id" does not exist` in audit queries
- **Root Cause:** Audit table uses `created_by` not `user_id`
- **Solution:** Always use `created_by` in audit history queries
- **Check:** Verify audit table schema: `\d data_entry_audit_log`

### 7. **Frontend Change Detection**
- **Issue:** "No changes detected" when values are actually changed
- **Root Cause:** String comparison instead of numeric comparison
- **Solution:** Convert values to numbers before comparison
- **Pattern:** 
  ```javascript
  // ❌ WRONG - String comparison
  if (originalValue !== null && formValue !== originalValue.toString()) return true;
  
  // ✅ CORRECT - Numeric comparison
  const originalNum = parseFloat(originalValue.toString());
  const formNum = parseFloat(formValue);
  if (!isNaN(originalNum) && !isNaN(formNum)) {
    if (originalNum !== formNum) return true;
  }
  ```

---

## 🚀 Quick Implementation Checklist

For each new section, ensure you have:

### Backend (4 files):
- [ ] Repository with CRUD operations
- [ ] Service with change detection
- [ ] Controller with proper response structure
- [ ] Routes with middleware integration

### Frontend (4 files):
- [ ] TypeScript interfaces
- [ ] API service with data transformation
- [ ] React hook with state management
- [ ] Form component with validation

### Integration:
- [ ] Routes registered in `server.js`
- [ ] Component integrated in main form
- [ ] All imports working correctly
- [ ] Database schema supports the section

---

## 📞 Emergency Contacts

If you encounter issues not covered in this guide:

1. **Check the audit log** - Always verify if data is being saved
2. **Test with curl** - Verify backend API functionality
3. **Check database directly** - Confirm data persistence
4. **Review server logs** - Look for error messages
5. **Compare with working sections** - Use Company Info/P&L as reference

---

*Last Updated: August 7, 2025*
*Version: 1.0* 