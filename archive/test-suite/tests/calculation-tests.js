const { execSync } = require('child_process');

// Calculation Engine test cases
const calculationTests = [
  {
    name: 'Create Debt Calculation Run',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Create calculation run
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":2000000,"interestRate":0.07,"maturityYears":10},"runName":"Test Debt Calculation - Automated"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { calculationRunCreated: result === 'true' }
      };
    }
  },
  
  {
    name: 'Complete Debt Calculation Run',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Get the latest run ID
      const runIdCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].id'`;
      const runId = execSync(runIdCommand, { encoding: 'utf8' }).trim();
      
      // Complete the calculation
      const command = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/complete" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"outputData":{"monthlyPayment":23000,"totalInterest":760000,"totalRepayment":2760000},"executionTime":1800}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { calculationCompleted: result === 'true', runId }
      };
    }
  },
  
  {
    name: 'Create Depreciation Calculation Run',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Create depreciation calculation run
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"depreciation","inputData":{"openingBalance":1000000,"monthlyCapex":3000,"depreciationRate":15.0,"depreciationMethod":"straight_line"},"runName":"Test Depreciation Calculation - Automated"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { depreciationRunCreated: result === 'true' }
      };
    }
  },
  
  {
    name: 'Complete Depreciation Calculation Run',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Get the latest depreciation run ID
      const runIdCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=5" -H "Authorization: Bearer ${token}" | jq -r '.data.history[] | select(.calculation_type == "depreciation") | .id' | head -1`;
      const runId = execSync(runIdCommand, { encoding: 'utf8' }).trim();
      
      // Complete the calculation
      const command = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/complete" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"outputData":{"totalDepreciation":1500000,"finalNetBookValue":850000,"averageMonthlyDepreciation":12500},"executionTime":2200}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { depreciationCompleted: result === 'true', runId }
      };
    }
  },
  
  {
    name: 'Calculation History Retrieval',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test calculation history
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=5" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { historyRetrieved: result === 'true' }
      };
    }
  },
  
  {
    name: 'Calculation Statistics',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test calculation statistics
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/stats" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { statsRetrieved: result === 'true' }
      };
    }
  },
  
  {
    name: 'Calculation Run Details',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Get the latest run ID
      const runIdCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].id'`;
      const runId = execSync(runIdCommand, { encoding: 'utf8' }).trim();
      
      // Test calculation run details
      const command = `curl -s -X GET "${config.baseUrl}/api/calculations/runs/${runId}" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { runDetailsRetrieved: result === 'true', runId }
      };
    }
  },
  
  {
    name: 'Calculation Comparison',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Get two run IDs for comparison
      const runIdsCommand = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=2" -H "Authorization: Bearer ${token}" | jq -r '.data.history[].id'`;
      const runIds = execSync(runIdsCommand, { encoding: 'utf8' }).trim().split('\n');
      
      if (runIds.length >= 2) {
        const command = `curl -s -X GET "${config.baseUrl}/api/calculations/runs/${runIds[0]}/compare/${runIds[1]}" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
        
        const result = execSync(command, { encoding: 'utf8' }).trim();
        const duration = Date.now() - startTime;
        
        return {
          success: result === 'true',
          duration,
          details: { comparisonSuccess: result === 'true', runId1: runIds[0], runId2: runIds[1] }
        };
      } else {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: 'Not enough calculation runs for comparison'
        };
      }
    }
  },
  
  {
    name: 'Failed Calculation Handling',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Create a calculation run that will fail
      const createCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"invalid","inputData":{},"runName":"Invalid Calculation Test"}' | jq -r '.data.runId'`;
      const runId = execSync(createCommand, { encoding: 'utf8' }).trim();
      
      // Mark it as failed
      const failCommand = `curl -s -X PUT "${config.baseUrl}/api/calculations/runs/${runId}/fail" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"errorMessage":"Invalid calculation type"}' | jq -r '.success'`;
      
      const result = execSync(failCommand, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { failureHandled: result === 'true', runId }
      };
    }
  }
];

module.exports = calculationTests; 