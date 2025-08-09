const { execSync } = require('child_process');

// Authentication test cases
const authTests = [
  {
    name: 'Backend Health Check',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s "${config.baseUrl}/api/health" | jq -r '.status'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'OK',
        duration,
        details: { status: result }
      };
    }
  },
  
  {
    name: 'User Login - Valid Credentials',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { loginSuccess: result === 'true' }
      };
    }
  },
  
  {
    name: 'User Login - Invalid Credentials',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"wrongpassword"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'false',
        duration,
        details: { loginSuccess: result === 'false' }
      };
    }
  },
  
  {
    name: 'JWT Token Generation',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result !== 'null' && result.length > 50,
        duration,
        details: { tokenLength: result.length }
      };
    }
  },
  
  {
    name: 'User Profile Retrieval',
    run: async (config) => {
      const startTime = Date.now();
      
      // First get token
      const tokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.access_token'`;
      const token = execSync(tokenCommand, { encoding: 'utf8' }).trim();
      
      // Then get profile
      const command = `curl -s -H "Authorization: Bearer ${token}" "${config.baseUrl}/api/user/profile" | jq -r '.success'`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { profileRetrieved: result === 'true' }
      };
    }
  },
  
  {
    name: 'Authentication Required - Protected Endpoint',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s -H "Authorization: Bearer invalid_token" "${config.baseUrl}/api/user/profile" | jq -r '.error'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'Unauthorized',
        duration,
        details: { errorType: result }
      };
    }
  },
  
  {
    name: 'Password Reset Request',
    run: async (config) => {
      const startTime = Date.now();
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/forgot-password" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}"}' | jq -r '.success'`;
      
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { resetRequested: result === 'true' }
      };
    }
  },
  
  {
    name: 'Session Management - Token Refresh',
    run: async (config) => {
      const startTime = Date.now();
      
      // First get refresh token
      const refreshTokenCommand = `curl -s -X POST "${config.baseUrl}/api/auth/login" -H "Content-Type: application/json" -d '{"email":"${config.testUser.email}","password":"${config.testUser.password}"}' | jq -r '.data.session.refresh_token'`;
      const refreshToken = execSync(refreshTokenCommand, { encoding: 'utf8' }).trim();
      
      // Then refresh
      const command = `curl -s -X POST "${config.baseUrl}/api/auth/refresh" -H "Content-Type: application/json" -d '{"refresh_token":"${refreshToken}"}' | jq -r '.success'`;
      const result = execSync(command, { encoding: 'utf8' }).trim();
      const duration = Date.now() - startTime;
      
      return {
        success: result === 'true',
        duration,
        details: { tokenRefreshed: result === 'true' }
      };
    }
  }
];

module.exports = authTests; 