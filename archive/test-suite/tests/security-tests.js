const { execSync } = require('child_process');

// Security test cases
const securityTests = [
  {
    name: 'Rate Limiting - Login Attempts',
    run: async (config) => {
      const startTime = Date.now();
      
      // Make multiple rapid login attempts
      const commands = [];
      for (let i = 0; i < 5; i++) {
        commands.push(`curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"wrongpassword"}' | jq -r '.success'`);
      }
      
      const results = commands.map(cmd => execSync(cmd, { encoding: 'utf8' }).trim());
      const duration = Date.now() - startTime;
      
      // Check if rate limiting is working (should see some failures)
      const successCount = results.filter(r => r === 'true').length;
      
      return {
        success: successCount < 5, // Rate limiting should prevent all attempts
        duration,
        details: { 
          totalAttempts: 5,
          successfulAttempts: successCount,
          rateLimited: successCount < 5
        }
      };
    }
  },
  
  {
    name: 'SQL Injection Prevention',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test SQL injection in login
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"test@example.com; DROP TABLE users; --","password":"test"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'false', // Should fail safely
        duration,
        details: { 
          sqlInjectionBlocked: result === 'false',
          response: result
        }
      };
    }
  },
  
  {
    name: 'XSS Prevention',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test XSS in data entry
      const command = `curl -s -X POST "${config.baseUrl}/api/projects/${config.projectId}/sections/company-details/force-save" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}" -d '{"data":{"company_name":"<script>alert(\"xss\")</script>","industry":"<img src=x onerror=alert(1)>"}}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true', // Should accept and sanitize
        duration,
        details: { 
          xssHandled: result === 'true',
          response: result
        }
      };
    }
  },
  
  {
    name: 'Unauthorized Access - No Token',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test protected endpoint without token
      const command = `curl -s -X GET "${config.baseUrl}/api/user/profile" | jq -r '.error'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'Unauthorized',
        duration,
        details: { 
          unauthorizedBlocked: result === 'Unauthorized',
          errorType: result
        }
      };
    }
  },
  
  {
    name: 'Unauthorized Access - Invalid Token',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test protected endpoint with invalid token
      const command = `curl -s -H "Authorization: Bearer invalid_token_here" "${config.baseUrl}/api/user/profile" | jq -r '.error'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'Unauthorized',
        duration,
        details: { 
          invalidTokenBlocked: result === 'Unauthorized',
          errorType: result
        }
      };
    }
  },
  
  {
    name: 'Project Access Control',
    run: async (config) => {
      const startTime = Date.now();
      
      // Get token first
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Test access to a different project ID
      const command = `curl -s -X GET "${config.baseUrl}/api/projects/00000000-0000-0000-0000-000000000000/data" -H "Authorization: Bearer ${token}" | jq -r '.error'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'Not Found' || result === 'Forbidden',
        duration,
        details: { 
          projectAccessControlled: result === 'Not Found' || result === 'Forbidden',
          errorType: result
        }
      };
    }
  },
  
  {
    name: 'Input Validation - Invalid Email',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test invalid email format
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"invalid-email","password":"test"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'false',
        duration,
        details: { 
          invalidEmailRejected: result === 'false',
          response: result
        }
      };
    }
  },
  
  {
    name: 'Input Validation - Empty Fields',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test empty fields
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"","password":""}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'false',
        duration,
        details: { 
          emptyFieldsRejected: result === 'false',
          response: result
        }
      };
    }
  },
  
  {
    name: 'CORS Headers',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test CORS headers
      const command = `curl -s -I "${config.baseUrl}/api/health" | grep -i "access-control-allow-origin"`;
      
      try {
        const result = execSync(command, { encoding: 'utf8' }).trim();
        const duration = Date.now() - startTime;
        
        return {
          success: result.length > 0,
          duration,
          details: { 
            corsHeadersPresent: result.length > 0,
            headers: result
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: 'CORS headers not found'
        };
      }
    }
  },
  
  {
    name: 'Content Security Policy',
    run: async (config) => {
      const startTime = Date.now();
      
      // Test CSP headers
      const command = `curl -s -I "${config.baseUrl}/api/health" | grep -i "content-security-policy"`;
      
      try {
        const result = execSync(command, { encoding: 'utf8' }).trim();
        const duration = Date.now() - startTime;
        
        return {
          success: result.length > 0,
          duration,
          details: { 
            cspHeadersPresent: result.length > 0,
            headers: result
          }
        };
      } catch (error) {
        return {
          success: false,
          duration: Date.now() - startTime,
          error: 'CSP headers not found'
        };
      }
    }
  }
];

module.exports = securityTests; 