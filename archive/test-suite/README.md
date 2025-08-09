# 🧪 Refi Wizard Test Suite

A comprehensive automated test suite for the Refi Wizard application covering authentication, data entry, calculation engine, security, audit trails, and performance.

## 📋 Test Categories

### 1. **Authentication Tests** (`tests/auth-tests.js`)
- ✅ Backend health check
- ✅ User login (valid/invalid credentials)
- ✅ JWT token generation
- ✅ User profile retrieval
- ✅ Authentication required endpoints
- ✅ Password reset functionality
- ✅ Session management (token refresh)

### 2. **Data Entry Tests** (`tests/data-entry-tests.js`)
- ✅ Auto-save functionality (debounced)
- ✅ Force save operations
- ✅ Audit trail history
- ✅ Field-specific history tracking
- ✅ Save status monitoring
- ✅ Cancel pending saves
- ✅ Company details persistence
- ✅ Debt structure data entry

### 3. **Calculation Engine Tests** (`tests/calculation-tests.js`)
- ✅ Debt calculation run creation
- ✅ Depreciation calculation runs
- ✅ Calculation completion
- ✅ Calculation history retrieval
- ✅ Calculation statistics
- ✅ Run details and comparison
- ✅ Failed calculation handling

### 4. **Security Tests** (`tests/security-tests.js`)
- ✅ Rate limiting
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ Unauthorized access blocking
- ✅ Project access control
- ✅ Input validation
- ✅ CORS headers
- ✅ Content Security Policy

### 5. **Audit Trail Tests** (`tests/audit-tests.js`)
- ✅ Complete audit history
- ✅ Field-specific history
- ✅ Version control
- ✅ User attribution
- ✅ Change tracking (before/after)
- ✅ Changed fields tracking

### 6. **Integration Tests** (`tests/integration-tests.js`)
- ✅ End-to-end data entry workflow
- ✅ End-to-end calculation workflow
- ✅ Data persistence across sessions
- ✅ Cross-feature integration
- ✅ Error recovery scenarios

### 7. **Performance Tests** (`tests/performance-tests.js`)
- ✅ API response time testing
- ✅ Concurrent request handling
- ✅ Database performance
- ✅ Memory usage optimization
- ✅ Network latency testing

### 8. **Frontend Integration Tests** (`tests/frontend-integration-tests.js`)
- ✅ Frontend page accessibility
- ✅ Frontend-backend connection
- ✅ User login to data entry workflow
- ✅ Form data auto-save simulation
- ✅ Manual save button functionality
- ✅ Section navigation with auto-save
- ✅ Calculation engine integration
- ✅ Error handling and recovery
- ✅ Complete user journey testing
- ✅ End-to-end workflow validation

## 🚀 Quick Start

### Prerequisites
- Node.js >= 14.0.0
- Backend server running on `http://localhost:3001`
- Frontend server running on `http://localhost:8080`
- PostgreSQL database with test data
- `curl` and `jq` installed

### Installation
```bash
cd test-suite
npm install
```

### Running Tests

#### Basic Test Run
```bash
npm test
```

#### Verbose Output (Detailed Logging)
```bash
npm run test:verbose
```

#### Stop on First Failure
```bash
npm run test:stop-on-failure
```

#### Full Test Suite (Verbose + Stop on Failure)
```bash
npm run test:full
```

#### Frontend Integration Tests Only
```bash
npm run test:frontend
```

#### Frontend Tests with Verbose Output
```bash
npm run test:frontend:verbose
```

## 📊 Test Results

The test suite generates detailed results in `test-results.json`:

```json
{
  "summary": {
    "total": 45,
    "passed": 42,
    "failed": 3,
    "skipped": 0,
    "startTime": "2025-08-06T12:45:52.005Z",
    "endTime": "2025-08-06T12:50:15.123Z",
    "duration": 263118
  },
  "tests": [
    {
      "category": "Authentication",
      "name": "User Login - Valid Credentials",
      "success": true,
      "duration": 245,
      "error": null,
      "details": {
        "loginSuccess": true
      }
    }
  ]
}
```

## ⚙️ Configuration

Edit `test-runner.js` to modify test configuration:

```javascript
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
```

## 🎭 Frontend Integration Test Details

### What These Tests Actually Validate

#### **User Workflow Tests:**
- **Login to Data Entry Navigation**: Verifies users can login and access data entry pages
- **Form Data Auto-Save Simulation**: Tests that typing in forms triggers auto-save after 2 seconds
- **Manual Save Button Functionality**: Validates "Save Progress" button actually saves data
- **Section Navigation with Auto-Save**: Tests "Next" button saves current section before navigating

#### **End-to-End Integration Tests:**
- **Frontend Page Accessibility**: Confirms frontend serves pages correctly (200 status)
- **Frontend-Backend Connection**: Validates frontend can reach backend APIs
- **Calculation Engine Integration**: Tests complete calculation workflow from UI to database
- **Error Handling and Recovery**: Validates graceful error handling and recovery

#### **Complete User Journey:**
- **Login → Data Entry → Calculation**: Full user workflow from start to finish
- **Multi-Section Data Entry**: Tests saving data across multiple form sections
- **Calculation History**: Verifies calculation results are stored and retrievable

### Why These Tests Matter

These tests catch issues like:
- ❌ Frontend loads but can't reach backend
- ❌ Forms exist but don't actually save data  
- ❌ Auto-save is configured but not triggering
- ❌ Save buttons show success but don't persist data
- ❌ Navigation works but loses data
- ❌ Calculations run but results aren't stored

**These are the exact issues that manual testing would catch but component testing misses.**

## 🎯 Test Coverage

### API Endpoints Tested
- ✅ `/api/health` - Health check
- ✅ `/api/auth/login` - User authentication
- ✅ `/api/auth/refresh` - Token refresh
- ✅ `/api/auth/forgot-password` - Password reset
- ✅ `/api/user/profile` - User profile
- ✅ `/api/projects/:id/sections/:section/auto-save` - Auto-save
- ✅ `/api/projects/:id/sections/:section/force-save` - Force save
- ✅ `/api/projects/:id/sections/:section/audit-history` - Audit trail
- ✅ `/api/projects/:id/sections/:section/fields/:field/history` - Field history
- ✅ `/api/projects/:id/sections/:section/save-status` - Save status
- ✅ `/api/projects/:id/cancel-pending-saves` - Cancel saves
- ✅ `/api/projects/:id/calculations/runs` - Calculation runs
- ✅ `/api/calculations/runs/:id/complete` - Complete calculations
- ✅ `/api/calculations/runs/:id/fail` - Failed calculations
- ✅ `/api/projects/:id/calculations/history` - Calculation history
- ✅ `/api/calculations/runs/:id` - Run details
- ✅ `/api/calculations/runs/:id1/compare/:id2` - Run comparison
- ✅ `/api/projects/:id/calculations/stats` - Calculation statistics

### Features Tested
- ✅ **Authentication System** - Login, tokens, sessions
- ✅ **Auto-Save System** - Debounced saves, status tracking
- ✅ **Audit Trail** - Complete change history, versioning
- ✅ **Calculation Engine** - Debt, depreciation, history
- ✅ **Security** - Rate limiting, injection prevention
- ✅ **Performance** - Response times, concurrent requests
- ✅ **Data Integrity** - Persistence, validation
- ✅ **Error Handling** - Graceful failures, recovery

## 🔧 Customization

### Adding New Tests
1. Create a new test file in `tests/` directory
2. Export an array of test objects with `name` and `run` properties
3. Import the new test module in `test-runner.js`
4. Add to the `testModules` array

### Test Object Structure
```javascript
{
  name: 'Test Name',
  run: async (config) => {
    const startTime = Date.now();
    
    // Test logic here
    const result = execSync(command, { encoding: 'utf8' }).trim();
    const duration = Date.now() - startTime;
    
    return {
      success: result === 'expected',
      duration,
      details: { /* test details */ }
    };
  }
}
```

## 📈 Performance Benchmarks

### Response Time Targets
- **Health Check**: < 1000ms
- **Login**: < 2000ms
- **Auto-Save**: < 1500ms
- **Force Save**: < 2000ms
- **Calculation History**: < 3000ms
- **Large Dataset**: < 5000ms

### Success Rate Targets
- **Authentication**: 100%
- **Data Entry**: 100%
- **Calculations**: 100%
- **Security**: 100%
- **Performance**: 95%+

## 🐛 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure backend server is running on port 3001
   - Check firewall settings

2. **Authentication Failures**
   - Verify test user credentials in config
   - Check database connection

3. **Timeout Errors**
   - Increase timeout values in test configuration
   - Check server performance

4. **Missing Dependencies**
   - Install `curl` and `jq`
   - Ensure Node.js version >= 14

### Debug Mode
Run with verbose logging for detailed output:
```bash
npm run test:verbose
```

## 📝 Logs

Test logs are saved to:
- `test-runner.log` - Detailed execution logs (verbose mode)
- `test-results.json` - Structured test results
- Console output - Real-time test progress

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Include proper error handling
3. Add meaningful test descriptions
4. Update this README with new test categories
5. Ensure tests are idempotent (can run multiple times)

## 📄 License

MIT License - See LICENSE file for details. 