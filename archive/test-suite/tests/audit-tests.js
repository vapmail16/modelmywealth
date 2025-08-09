const { execSync } = require('child_process');

// Audit Trail test cases
const auditTests = [
  {
    name: 'Audit Trail - Complete History',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test complete audit history
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=5" -H "Authorization: Bearer ${token}" | jq -r '.success'`;
      
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
    name: 'Field-Specific History - Revenue',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test field-specific history
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
    name: 'Version Control - Incremental Versions',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Make a change to trigger version increment
      const saveCommand = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"revenue":3500000,"cogs":2100000}}' | jq -r '.data.version'`;
      
      const version = execSync(saveCommand, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: parseInt(version) > 1,
        duration,
        details: { 
          versionIncremented: parseInt(version) > 1,
          currentVersion: version
        }
      };
    }
  },
  
  {
    name: 'User Attribution - Change Tracking',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Check audit history for user attribution
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].user_email'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === config.testUser.email,
        duration,
        details: { 
          userAttributed: result === config.testUser.email,
          userEmail: result
        }
      };
    }
  },
  
  {
    name: 'Change Tracking - Before/After Values',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Check audit history for before/after values
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].old_values.revenue'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result !== 'null' && result !== '',
        duration,
        details: { 
          beforeAfterTracked: result !== 'null' && result !== '',
          oldValue: result
        }
      };
    }
  },
  
  {
    name: 'Changed Fields Tracking',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Check audit history for changed fields
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/${config.projectId}/sections/profit-loss/audit-history?limit=1" -H "Authorization: Bearer ${token}" | jq -r '.data.history[0].changed_fields | length'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: parseInt(result) > 0,
        duration,
        details: { 
          changedFieldsTracked: parseInt(result) > 0,
          fieldCount: result
        }
      };
    }
  }
];

module.exports = auditTests; 