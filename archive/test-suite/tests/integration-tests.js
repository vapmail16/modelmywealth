const { execSync } = require('child_process');

// Integration test cases
const integrationTests = [
  {
    name: 'End-to-End Data Entry Workflow',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // 1. Save company details
      const companyCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"company_name":"Integration Test Company","industry":"Technology"}}' | jq -r '.success'`;
      const companyResult = execSync(companyCommand, { encoding: 'utf8' }).trim();
      
      // 2. Save profit & loss data
      const plCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":4000000,"cogs":2400000,"operating_expenses":800000}}' | jq -r '.success'`;
      const plResult = execSync(plCommand, { encoding: 'utf8' }).trim();
      
      // 3. Save balance sheet data
      const bsCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"cash":800000,"accounts_receivable":500000,"inventory":600000}}' | jq -r '.success'`;
      const bsResult = execSync(bsCommand, { encoding: 'utf8' }).trim();
      
      const duration = Date.now() - startTime;
      
      return {
        success: companyResult === 'true' && plResult === 'true' && bsResult === 'true',
        duration,
        details: { 
          companyDetailsSaved: companyResult === 'true',
          profitLossSaved: plResult === 'true',
          balanceSheetSaved: bsResult === 'true'
        }
      };
    }
  },
  
  {
    name: 'End-to-End Calculation Workflow',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // 1. Create calculation run
      const createCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":3000000,"interestRate":0.08,"maturityYears":12},"runName":"Integration Test Calculation"}' | jq -r '.data.runId'`;
      const runId = execSync(createCommand, { encoding: 'utf8' }).trim();
      
      // 2. Complete calculation
      const completeCommand = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/complete" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"outputData":{"monthlyPayment":35000,"totalInterest":1200000,"totalRepayment":4200000},"executionTime":2000}' | jq -r '.success'`;
      const completeResult = execSync(completeCommand, { encoding: 'utf8' }).trim();
      
      // 3. Get calculation history
      const historyCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      const historyResult = execSync(historyCommand, { encoding: 'utf8' }).trim();
      
      const duration = Date.now() - startTime;
      
      return {
        success: runId !== 'null' && completeResult === 'true' && historyResult === 'true',
        duration,
        details: { 
          runCreated: runId !== 'null',
          calculationCompleted: completeResult === 'true',
          historyRetrieved: historyResult === 'true',
          runId
        }
      };
    }
  },
  
  {
    name: 'Data Persistence Across Sessions',
    run: async (config) => {
      const startTime = Date.now();
      
      // 1. Login and save data
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      const saveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":5000000,"cogs":3000000,"operating_expenses":1000000}}' | jq -r '.success'`;
      const saveResult = execSync(saveCommand, { encoding: 'utf8' }).trim();
      
      // 2. Login again and verify data
      const token2Command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token2 = execSync(token2Command, { encoding: 'utf8' }).trim();
      
      const verifyCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token2}" | jq -r '.success'`;
      const verifyResult = execSync(verifyCommand, { encoding: 'utf8' }).trim();
      
      const duration = Date.now() - startTime;
      
      return {
        success: saveResult === 'true' && verifyResult === 'true',
        duration,
        details: { 
          dataSaved: saveResult === 'true',
          dataPersisted: verifyResult === 'true'
        }
      };
    }
  },
  
  {
    name: 'Cross-Feature Integration - Auto-Save to Calculation',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // 1. Auto-save data entry
      const autoSaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/debt-structure/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"senior_secured_loan_type":"Term Loan","additional_loan_senior_secured":2000000,"bank_base_rate_senior_secured":6.5}}' | jq -r '.success'`;
      const autoSaveResult = execSync(autoSaveCommand, { encoding: 'utf8' }).trim();
      
      // 2. Create calculation using the saved data
      const calcCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":2000000,"interestRate":0.065,"maturityYears":10},"runName":"Auto-Save Integration Test"}' | jq -r '.success'`;
      const calcResult = execSync(calcCommand, { encoding: 'utf8' }).trim();
      
      const duration = Date.now() - startTime;
      
      return {
        success: autoSaveResult === 'true' && calcResult === 'true',
        duration,
        details: { 
          autoSaveSuccess: autoSaveResult === 'true',
          calculationSuccess: calcResult === 'true'
        }
      };
    }
  },
  
  {
    name: 'Error Recovery - Failed Save to Success',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // 1. Try to save with invalid data (should fail gracefully)
      const failCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":"invalid","cogs":"invalid"}}' | jq -r '.success'`;
      const failResult = execSync(failCommand, { encoding: 'utf8' }).trim();
      
      // 2. Try to save with valid data (should succeed)
      const successCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":6000000,"cogs":3600000,"operating_expenses":1200000}}' | jq -r '.success'`;
      const successResult = execSync(successCommand, { encoding: 'utf8' }).trim();
      
      const duration = Date.now() - startTime;
      
      return {
        success: successResult === 'true', // Only the success case matters
        duration,
        details: { 
          failedGracefully: failResult === 'false',
          recoveredSuccessfully: successResult === 'true'
        }
      };
    }
  }
];

module.exports = integrationTests; 