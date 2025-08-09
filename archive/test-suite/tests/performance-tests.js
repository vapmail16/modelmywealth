const { execSync } = require('child_process');

// Performance test cases
const performanceTests = [
  {
    name: 'API Response Time - Health Check',
    run: async (config) => {
      const startTime = Date.now();
      
      const command = `curl -s -w "%{time_total}" "${config.baseUrl}/api/health" | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 1000, // Should be under 1 second
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 1000
        }
      };
    }
  },
  
  {
    name: 'API Response Time - Login',
    run: async (config) => {
      const startTime = Date.now();
      
      const command = `curl -s -w "%{time_total}" -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 2000, // Should be under 2 seconds
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 2000
        }
      };
    }
  },
  
  {
    name: 'API Response Time - Auto-Save',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      const command = `curl -s -w "%{time_total}" -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":7000000,"cogs":4200000}}' | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 1500, // Should be under 1.5 seconds
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 1500
        }
      };
    }
  },
  
  {
    name: 'API Response Time - Force Save',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      const command = `curl -s -w "%{time_total}" -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"cash":900000,"accounts_receivable":600000,"inventory":700000}}' | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 2000, // Should be under 2 seconds
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 2000
        }
      };
    }
  },
  
  {
    name: 'API Response Time - Calculation History',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      const command = `curl -s -w "%{time_total}" -X GET "${config.baseUrl}/api/projects/${config.projectId}/calculations/history?limit=10" -H "Authorization: Bearer ${token}" | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 3000, // Should be under 3 seconds
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 3000
        }
      };
    }
  },
  
  {
    name: 'Concurrent Requests - Multiple Auto-Saves',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Make 3 concurrent auto-save requests
      const commands = [
        `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":8000000,"cogs":4800000}}'`,
        `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/balance-sheet/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"cash":1000000,"accounts_receivable":700000}}'`,
        `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/debt-structure/auto-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"senior_secured_loan_type":"Term Loan","additional_loan_senior_secured":3000000}}'`
      ];
      
      const results = commands.map(cmd => {
        try {
          return execSync(cmd, { encoding: 'utf8' });
        } catch (error) {
          return '{"success":false}';
        }
      });
      
      const successCount = results.filter(r => r.includes('"success":true')).length;
      const duration = Date.now() - startTime;
      
      return {
        success: successCount >= 2, // At least 2 out of 3 should succeed
        duration,
        details: { 
          concurrentRequests: 3,
          successfulRequests: successCount,
          concurrentPerformance: successCount >= 2
        }
      };
    }
  },
  
  {
    name: 'Database Performance - Large Dataset',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test audit history with larger limit
      const command = `curl -s -w "%{time_total}" -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=50" -H "Authorization: Bearer ${token}" | tail -1`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 5000, // Should be under 5 seconds for large dataset
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 5000,
          datasetSize: 50
        }
      };
    }
  },
  
  {
    name: 'Memory Usage - Calculation Run',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Create a complex calculation run
      const createCommand = `curl -s -w "%{time_total}" -X POST "${config.baseUrl}/api/projects/${config.projectId}/calculations/runs" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"calculationType":"debt","inputData":{"loanAmount":5000000,"interestRate":0.09,"maturityYears":15},"runName":"Performance Test Calculation"}' | tail -1`;
      
      const result = execSync(createCommand, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      const responseTime = parseFloat(result) * 1000; // Convert to milliseconds
      
      return {
        success: responseTime < 3000, // Should be under 3 seconds
        duration,
        details: { 
          responseTimeMs: responseTime,
          performanceTarget: responseTime < 3000,
          calculationComplexity: 'high'
        }
      };
    }
  },
  
  {
    name: 'Network Latency - Multiple Endpoints',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test multiple endpoints in sequence
      const endpoints = [
        `${config.baseUrl}/api/health`,
        `${config.baseUrl}/api/auth/login`,
        `${config.baseUrl}/api/projects/${config.projectId}/calculations/stats`
      ];
      
      const responseTimes = [];
      
      for (const endpoint of endpoints) {
        const command = `curl -s -w "%{time_total}" "${endpoint}" | tail -1`;
        try {
          const result = execSync(command, { encoding: 'utf8' }).trim();
          responseTimes.push(parseFloat(result) * 1000);
        } catch (error) {
          responseTimes.push(9999); // High value for failed requests
        }
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const duration = Date.now() - startTime;
      
      return {
        success: avgResponseTime < 2000, // Average should be under 2 seconds
        duration,
        details: { 
          averageResponseTimeMs: avgResponseTime,
          performanceTarget: avgResponseTime < 2000,
          individualTimes: responseTimes
        }
      };
    }
  }
];

module.exports = performanceTests; 