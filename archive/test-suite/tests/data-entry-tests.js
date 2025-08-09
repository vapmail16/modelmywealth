const { execSync } = require('child_process');

// Data Entry test cases
const dataEntryTests = [
  {
    name: 'Auto-Save - Profit & Loss Data',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test auto-save
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":3000000,"cogs":1800000,"operating_expenses":600000}}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { autoSaveSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Force Save - Balance Sheet Data',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test force save
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"cash":700000,"accounts_receivable":400000,"inventory":500000,"ppe":2500000}}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { forceSaveSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Audit Trail - Complete History',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test audit history
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=3" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { auditHistorySuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Field-Specific History - Revenue Changes',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test field history
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/fields/revenue/history?limit=3" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { fieldHistorySuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Save Status - Pending Saves',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test save status
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/save-status" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { saveStatusSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Cancel Pending Saves',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test cancel pending saves
      const command = `curl -s -X DELETE "${config.baseUrl}/api/projects/${config.projectId}/cancel-pending-saves" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { cancelPendingSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Data Entry - Company Details',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test company details save
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"company_name":"Test Company","industry":"Technology","region":"North America","country":"USA"}}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { companyDetailsSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'Data Entry - Debt Structure',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test debt structure save
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/debt-structure/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"senior_secured_loan_type":"Term Loan","additional_loan_senior_secured":1000000,"bank_base_rate_senior_secured":5.5}}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { debtStructureSuccess: result === 'true' }
      };
    }
  }
];

module.exports = dataEntryTests; 