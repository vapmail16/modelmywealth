#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const config = {
  baseUrl: 'http://localhost:3001',
  frontendUrl: 'http://localhost:8080',
  testUser: {
    email: 'vapmail16@gmail.com',
    password: 'admin123'
  },
  projectId: '05632bb7-b506-453d-9ca1-253344e04b6b',
  logFile: 'test-results.json',
  verbose: process.argv.includes('--verbose'),
  stopOnFailure: process.argv.includes('--stop-on-failure')
};

// Test results storage
let testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0
  },
  tests: []
};

// Utility functions
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
  
  if (config.verbose) {
    fs.appendFileSync('test-runner.log', logMessage + '\n');
  }
}

function executeCommand(command, description) {
  try {
    log(`Executing: ${description}`);
    const result = execSync(command, { 
      encoding: 'utf8',
      timeout: 30000 // 30 second timeout
    });
    log(`✅ Success: ${description}`);
    return { success: true, output: result };
  } catch (error) {
    log(`❌ Failed: ${description} - ${error.message}`, 'ERROR');
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

function saveResults() {
  testResults.summary.endTime = new Date().toISOString();
  testResults.summary.duration = new Date(testResults.summary.endTime) - new Date(testResults.summary.startTime);
  
  fs.writeFileSync(config.logFile, JSON.stringify(testResults, null, 2));
  log(`Test results saved to ${config.logFile}`);
}

function printSummary() {
  const { summary } = testResults;
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST SUITE SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`⏭️  Skipped: ${summary.skipped}`);
  console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  - ${test.category}: ${test.name}`);
        if (test.error) console.log(`    Error: ${test.error}`);
      });
  }
}

// Test execution
async function runTests() {
  log('🚀 Starting comprehensive test suite...');
  
  // Import test modules
  const authTests = require('./tests/auth-tests');
  const dataEntryTests = require('./tests/data-entry-tests');
  const calculationTests = require('./tests/calculation-tests');
  const securityTests = require('./tests/security-tests');
  const auditTests = require('./tests/audit-tests');
  const integrationTests = require('./tests/integration-tests');
  const performanceTests = require('./tests/performance-tests');
  const frontendIntegrationTests = require('./tests/frontend-integration-tests');
  
  const testModules = [
    { name: 'Authentication', tests: authTests },
    { name: 'Data Entry', tests: dataEntryTests },
    { name: 'Calculation Engine', tests: calculationTests },
    { name: 'Security', tests: securityTests },
    { name: 'Audit Trail', tests: auditTests },
    { name: 'Integration', tests: integrationTests },
    { name: 'Performance', tests: performanceTests },
    { name: 'Frontend Integration', tests: frontendIntegrationTests }
  ];
  
  for (const module of testModules) {
    log(`\n📋 Running ${module.name} tests...`);
    
    for (const test of module.tests) {
      testResults.summary.total++;
      
      try {
        const result = await test.run(config);
        
        const testResult = {
          category: module.name,
          name: test.name,
          success: result.success,
          duration: result.duration || 0,
          error: result.error || null,
          details: result.details || {}
        };
        
        testResults.tests.push(testResult);
        
        if (result.success) {
          testResults.summary.passed++;
          log(`✅ ${test.name} - ${result.duration}ms`);
        } else {
          testResults.summary.failed++;
          log(`❌ ${test.name} - ${result.error}`, 'ERROR');
          
          if (config.stopOnFailure) {
            log('🛑 Stopping on failure as requested', 'ERROR');
            break;
          }
        }
      } catch (error) {
        testResults.summary.failed++;
        log(`❌ ${test.name} - Unexpected error: ${error.message}`, 'ERROR');
        
        if (config.stopOnFailure) {
          log('🛑 Stopping on failure as requested', 'ERROR');
          break;
        }
      }
    }
  }
  
  saveResults();
  printSummary();
  
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  log('🛑 Test suite interrupted by user');
  saveResults();
  printSummary();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'ERROR');
  saveResults();
  printSummary();
  process.exit(1);
});

// Start test execution
if (require.main === module) {
  runTests().catch(error => {
    log(`💥 Test suite failed to start: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { config, log, executeCommand }; 