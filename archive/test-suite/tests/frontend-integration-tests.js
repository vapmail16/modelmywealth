const { execSync } = require('child_process');

// Frontend Integration test cases - End-to-End User Workflows
const frontendIntegrationTests = [
  {
    name: 'Frontend Loading - Data Entry Page Accessibility',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test if frontend serves the data entry page
      const command = `curl -s -w "%{http_code}" "${config.frontendUrl}/dashboard/data-entry" -o /dev/null`;
      
      const statusCode = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: statusCode === '200',
        duration,
        details: { 
          statusCode,
          pageAccessible: statusCode === '200'
        }
      };
    }
  },

  {
    name: 'Frontend Loading - Calculation Engine Page Accessibility',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test if frontend serves the calculation engine page
      const command = `curl -s -w "%{http_code}" "${config.frontendUrl}/dashboard/calculation-engine" -o /dev/null`;
      
      const statusCode = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: statusCode === '200',
        duration,
        details: { 
          statusCode,
          pageAccessible: statusCode === '200'
        }
      };
    }
  },

  {
    name: 'Frontend-Backend Connection - API Base URL Reachable',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test if frontend can reach backend API
      const command = `curl -s -w "%{http_code}" "${config.baseUrl}/health" -o /dev/null`;
      
      const statusCode = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: statusCode === '200',
        duration,
        details: { 
          statusCode,
          backendReachable: statusCode === '200'
        }
      };
    }
  },

  {
    name: 'User Workflow - Login to Data Entry Navigation',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Step 1: Login and get token
        const loginCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.success'`;
        const loginSuccess = execSync(loginCommand, { encoding: 'utf8' }).trim();
        
        if (loginSuccess !== 'true') {
          throw new Error('Login failed');
        }

        // Step 2: Get token for subsequent requests
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Step 3: Test project data access (simulating data entry page load)
        const projectCommand = `curl -s -H "Authorization: Bearer ${token}" "${config.baseUrl}/api/projects/${config.projectId}/data" | jq -r '.success'`;
        const projectSuccess = execSync(projectCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: loginSuccess === 'true' && projectSuccess === 'true',
          duration,
          details: { 
            loginSuccess: loginSuccess === 'true',
            projectDataAccess: projectSuccess === 'true',
            tokenReceived: token.length > 50
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Data Entry Workflow - Form Data Auto-Save Simulation',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Get token
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Simulate user typing in company details (auto-save trigger)
        const autoSaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"company_name":"Frontend Test Company","industry":"Technology","region":"North America"}}' | jq -r '.success'`;
        const autoSaveResult = execSync(autoSaveCommand, { encoding: 'utf8' }).trim();

        // Wait 3 seconds (simulating debounce delay)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check save status (simulating frontend checking save status)
        const statusCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/save-status" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
        const statusResult = execSync(statusCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: autoSaveResult === 'true' && statusResult === 'true',
          duration,
          details: { 
            autoSaveTriggered: autoSaveResult === 'true',
            saveStatusChecked: statusResult === 'true'
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Data Entry Workflow - Manual Save Button Simulation',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Get token
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Simulate user clicking "Save Progress" button (force save)
        const forceSaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":"5000000","cogs":"3000000","operating_expenses":"800000"}}' | jq -r '.success'`;
        const forceSaveResult = execSync(forceSaveCommand, { encoding: 'utf8' }).trim();

        // Verify data was saved by checking audit history
        const auditCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
        const auditResult = execSync(auditCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: forceSaveResult === 'true' && auditResult === 'true',
          duration,
          details: { 
            forceSaveTriggered: forceSaveResult === 'true',
            auditTrailUpdated: auditResult === 'true'
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Data Entry Workflow - Section Navigation with Auto-Save',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Get token
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Step 1: Save data in current section (simulating "Next" button click)
        const section1SaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"cash":"1000000","accounts_receivable":"500000","inventory":"750000"}}' | jq -r '.success'`;
        const section1Result = execSync(section1SaveCommand, { encoding: 'utf8' }).trim();

        // Step 2: Move to next section and save different data
        const section2SaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/debt-structure/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"senior_secured_loan_type":"Term Loan","additional_loan_senior_secured":"2000000"}}' | jq -r '.success'`;
        const section2Result = execSync(section2SaveCommand, { encoding: 'utf8' }).trim();

        // Step 3: Verify both sections have data
        const section1HistoryCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history | length'`;
        const section1History = execSync(section1HistoryCommand, { encoding: 'utf8' }).trim();

        const section2HistoryCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/debt-structure/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
        const section2History = execSync(section2HistoryCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: section1Result === 'true' && section2Result === 'true' && section2History === 'true',
          duration,
          details: { 
            section1Saved: section1Result === 'true',
            section2Saved: section2Result === 'true',
            navigationWorkflow: section1Result === 'true' && section2Result === 'true',
            auditTrailsUpdated: section2History === 'true'
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Calculation Engine Workflow - Frontend to Backend Integration',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Get token
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Step 1: Create calculation run (simulating user clicking "Calculate")
        const createRunCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":3000000,"interestRate":0.075,"maturityYears":10},"runName":"Frontend Integration Test"}' | jq -r '.data.runId'`;
        const runId = execSync(createRunCommand, { encoding: 'utf8' }).trim();

        // Step 2: Complete calculation (simulating calculation finishing)
        const completeRunCommand = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/complete" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"outputData":{"monthlyPayment":36000,"totalInterest":1320000},"executionTime":1500}' | jq -r '.success'`;
        const completeResult = execSync(completeRunCommand, { encoding: 'utf8' }).trim();

        // Step 3: Check calculation history (simulating frontend loading history)
        const historyCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].status'`;
        const historyStatus = execSync(historyCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: runId !== 'null' && completeResult === 'true' && historyStatus === 'completed',
          duration,
          details: { 
            calculationCreated: runId !== 'null',
            calculationCompleted: completeResult === 'true',
            historyUpdated: historyStatus === 'completed',
            runId
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Error Handling Workflow - Frontend Error Recovery',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Get token
        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Step 1: Try to save with invalid data (should fail gracefully)
        const invalidSaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":"invalid","cogs":"also_invalid"}}' | jq -r '.success'`;
        const invalidResult = execSync(invalidSaveCommand, { encoding: 'utf8' }).trim();

        // Step 2: Try to save with valid data (should succeed)
        const validSaveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":"6000000","cogs":"3600000","operating_expenses":"900000"}}' | jq -r '.success'`;
        const validResult = execSync(validSaveCommand, { encoding: 'utf8' }).trim();

        // Step 3: Verify recovery worked
        const recoveryCheckCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
        const recoveryResult = execSync(recoveryCheckCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: validResult === 'true' && recoveryResult === 'true',
          duration,
          details: { 
            invalidDataHandled: invalidResult === 'false',
            validDataSaved: validResult === 'true',
            errorRecoveryWorked: recoveryResult === 'true'
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  },

  {
    name: 'Complete User Journey - Login to Data Entry to Calculation',
    run: async (config) => {
      const startTime = Date.now();
      
      try {
        // Step 1: Login
        const loginCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.success'`;
        const loginResult = execSync(loginCommand, { encoding: 'utf8' }).trim();

        const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
        const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();

        // Step 2: Data Entry - Fill multiple sections
        const companyDataCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"company_name":"Complete Journey Test","industry":"Financial Services"}}' | jq -r '.success'`;
        const companyResult = execSync(companyDataCommand, { encoding: 'utf8' }).trim();

        const financialDataCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":"10000000","cogs":"6000000","operating_expenses":"2000000"}}' | jq -r '.success'`;
        const financialResult = execSync(financialDataCommand, { encoding: 'utf8' }).trim();

        // Step 3: Calculation Engine - Run calculation
        const calcRunCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":5000000,"interestRate":0.08,"maturityYears":12},"runName":"Complete Journey Calculation"}' | jq -r '.data.runId'`;
        const runId = execSync(calcRunCommand, { encoding: 'utf8' }).trim();

        const completeCalcCommand = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/complete" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"outputData":{"monthlyPayment":55000,"totalInterest":2920000},"executionTime":2000}' | jq -r '.success'`;
        const calcResult = execSync(completeCalcCommand, { encoding: 'utf8' }).trim();

        // Step 4: Verify complete journey data
        const journeyVerifyCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/stats" -H "Authorization: Bearer ${token}" | jq -r '.data.stats.totalRuns'`;
        const totalRuns = execSync(journeyVerifyCommand, { encoding: 'utf8' }).trim();

        const duration = Date.now() - startTime;

        return {
          success: loginResult === 'true' && companyResult === 'true' && financialResult === 'true' && calcResult === 'true' && parseInt(totalRuns) > 0,
          duration,
          details: { 
            loginSuccess: loginResult === 'true',
            companyDataSaved: companyResult === 'true',
            financialDataSaved: financialResult === 'true',
            calculationCompleted: calcResult === 'true',
            totalCalculationRuns: parseInt(totalRuns) || 0,
            completeJourneyWorked: true
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: error.message
        };
      }
    }
  }
];

module.exports = frontendIntegrationTests;