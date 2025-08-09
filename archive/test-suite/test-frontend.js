#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Frontend-specific test configuration
const config = {
  baseUrl: 'http://localhost:3001',
  frontendUrl: 'http://localhost:8080',
  testUser: {
    email: 'vapmail16@gmail.com',
    password: 'admin123'
  },
  projectId: '05632bb7-b506-453d-9ca1-253344e04b6b',
  logFile: 'frontend-test-results.json',
  verbose: process.argv.includes('--verbose')
};

// Test results storage
let testResults = {
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0
  },
  tests: []
};

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);
}

function saveResults() {
  testResults.summary.endTime = new Date().toISOString();
  testResults.summary.duration = new Date(testResults.summary.endTime) - new Date(testResults.summary.startTime);
  
  fs.writeFileSync(config.logFile, JSON.stringify(testResults, null, 2));
  log(`Frontend test results saved to ${config.logFile}`);
}

function printSummary() {
  const { summary } = testResults;
  console.log('\n' + '='.repeat(60));
  console.log('🎭 FRONTEND INTEGRATION TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${summary.total}`);
  console.log(`✅ Passed: ${summary.passed}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`Duration: ${(summary.duration / 1000).toFixed(2)}s`);
  console.log(`Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (summary.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  - ${test.name}`);
        if (test.error) console.log(`    Error: ${test.error}`);
      });
  }

  console.log('\n📊 DETAILED RESULTS:');
  testResults.tests.forEach(test => {
    const status = test.success ? '✅' : '❌';
    console.log(`${status} ${test.name} (${test.duration}ms)`);
    if (test.details && config.verbose) {
      console.log(`    Details: ${JSON.stringify(test.details, null, 2)}`);
    }
  });
}

async function runFrontendTests() {
  log('🎭 Starting Frontend Integration Tests...');
  log(`Frontend URL: ${config.frontendUrl}`);
  log(`Backend URL: ${config.baseUrl}`);
  log(`Test User: ${config.testUser.email}`);
  log(`Project ID: ${config.projectId}`);
  
  // Import frontend integration tests
  const frontendIntegrationTests = require('./tests/frontend-integration-tests');
  
  log(`\n📋 Running ${frontendIntegrationTests.length} Frontend Integration tests...`);
  
  for (const test of frontendIntegrationTests) {
    testResults.summary.total++;
    
    try {
      log(`🧪 Running: ${test.name}`);
      const result = await test.run(config);
      
      const testResult = {
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
        if (config.verbose && result.details) {
          log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
        }
      } else {
        testResults.summary.failed++;
        log(`❌ ${test.name} - ${result.error}`, 'ERROR');
      }
    } catch (error) {
      testResults.summary.failed++;
      log(`❌ ${test.name} - Unexpected error: ${error.message}`, 'ERROR');
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  saveResults();
  printSummary();
  
  // Exit with error code if tests failed
  process.exit(testResults.summary.failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  log('🛑 Frontend tests interrupted by user');
  saveResults();
  printSummary();
  process.exit(1);
});

// Start test execution
if (require.main === module) {
  runFrontendTests().catch(error => {
    log(`💥 Frontend tests failed to start: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { config, runFrontendTests };