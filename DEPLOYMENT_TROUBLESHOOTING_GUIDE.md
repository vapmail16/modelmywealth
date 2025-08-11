# 🚀 Deployment Troubleshooting Guide - Refi Wizard PostgreSQL

## 📋 Table of Contents
1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Common Issues & Solutions](#common-issues--solutions)
4. [Python Script Configuration](#python-script-configuration)
5. [Docker Configuration](#docker-configuration)
6. [Database Migration](#database-migration)
7. [Frontend Issues](#frontend-issues)
8. [Backend Issues](#backend-issues)
9. [Troubleshooting Checklist](#troubleshooting-checklist)
10. [Best Practices](#best-practices)

---

## 🎯 Overview

This guide documents all the deployment issues encountered during the Refi Wizard PostgreSQL project deployment to dcdeploy and their solutions. It serves as a comprehensive reference for future deployments and troubleshooting.

### **Project Architecture**
- **Frontend**: React + Vite (deployed on dcdeploy)
- **Backend**: Node.js + Express (deployed on dcdeploy)
- **Database**: PostgreSQL (deployed on dcdeploy)
- **Python Scripts**: Financial calculation engine

---

## 🔧 Environment Setup

### **Required Environment Variables**
```bash
# Database Connection
POSTGRESQL_HOST=database-ck6f73nl9l.tcp-proxy-2212.dcdeploy.cloud
POSTGRESQL_PORT=30391
POSTGRESQL_DB=database-db
POSTGRESQL_USER=XteJIz
POSTGRESQL_PASSWORD=j_)fYQxDVs

# Frontend Configuration
VITE_API_BASE_URL=https://backend-ck6f73nl9l.dcdeploy.cloud/api
```

### **Local Development vs Production**
- **Local**: Uses `localhost:3001` for backend, `localhost:8080` for frontend
- **Production**: Uses dcdeploy URLs with proper CORS configuration

---

## 🚨 Common Issues & Solutions

### **1. Python Calculation Engine Failures**

#### **Issue**: `ModuleNotFoundError: No module named 'psycopg2'`
**Symptoms**: Calculation engine shows "Command failed" errors
**Root Cause**: Python dependencies not installing in Docker container

**Solution**:
```dockerfile
# Use Debian slim instead of Alpine Linux
FROM node:18-slim

# Install Python with proper package support
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev python3-venv && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt
```

#### **Issue**: `ModuleNotFoundError: No module named 'dotenv'`
**Solution**: Add to `requirements.txt`:
```txt
python-dotenv==1.0.0
```

### **2. Database Connection Issues**

#### **Issue**: Python scripts connecting to localhost instead of production DB
**Root Cause**: Hardcoded localhost in script main functions

**Solution**: Update all Python scripts to use environment variables:
```python
from dotenv import load_dotenv
import os
load_dotenv()

db_config = {
    'host': os.getenv('POSTGRESQL_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRESQL_PORT', '5432')),
    'database': os.getenv('POSTGRESQL_DB', 'refi_wizard'),
    'user': os.getenv('POSTGRESQL_USER', 'postgres'),
    'password': os.getenv('POSTGRESQL_PASSWORD', 'postgres')
}
```

### **3. Docker Build Failures**

#### **Issue**: User creation commands failing
**Root Cause**: Alpine Linux syntax in Debian container

**Solution**: Use Debian equivalents:
```dockerfile
# Instead of Alpine commands
# RUN addgroup -g 1001 -S nodejs
# RUN adduser -S nextjs -u 1001

# Use Debian commands
RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs -s /bin/bash -m nextjs
```

### **4. CORS Configuration Issues**

#### **Issue**: Frontend blocked by CORS policy
**Solution**: Configure specific CORS origins and handle preflight requests:
```javascript
const corsOptions = {
  origin: [
    'https://frontend-ck6f73nl9l.dcdeploy.cloud',
    'https://modelmywealth.dcdeploy.cloud',
    'http://localhost:8080',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-request-id', 'x-request-time']
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-request-id, x-request-time');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }
  next();
});
```

### **5. Rate Limiter Conflicts**

#### **Issue**: `express-rate-limit` errors with proxy headers
**Root Cause**: Application-level rate limiting conflicting with dcdeploy's built-in rate limiting

**Solution**: Remove rate limiter functionality entirely:
```javascript
// Remove these lines from server.js
// const rateLimiters = require("./middleware/rateLimiter");
// app.use(rateLimiters.general);

// Remove from all route files
// router.use(rateLimiters.general);
```

---

## 🐍 Python Script Configuration

### **Scripts Requiring Updates**
1. `calculate_debt_schedule.py` ✅ (Already configured)
2. `calculate_depreciation_schedule.py` ✅ (Fixed)
3. `calculate_monthly_consolidated.py` ✅ (Fixed)
4. `calculate_quarterly_consolidated.py` ✅ (Fixed)
5. `calculate_yearly_consolidated.py` ✅ (Fixed)
6. `calculate_kpis.py` ✅ (Fixed)

### **Required Dependencies**
```txt
pandas==2.1.4
numpy==1.24.3
numpy-financial==1.0.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
```

### **Environment Variable Pattern**
```python
# Load environment variables
from dotenv import load_dotenv
import os
load_dotenv()

# Database configuration
db_config = {
    'host': os.getenv('POSTGRESQL_HOST', 'localhost'),
    'port': int(os.getenv('POSTGRESQL_PORT', '5432')),
    'database': os.getenv('POSTGRESQL_DB', 'refi_wizard'),
    'user': os.getenv('POSTGRESQL_USER', 'postgres'),
    'password': os.getenv('POSTGRESQL_PASSWORD', 'postgres')
}
```

---

## 🐳 Docker Configuration

### **Production Dockerfile**
```dockerfile
# Backend Dockerfile
FROM node:18-slim

# Install Python and required packages for financial calculations
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev python3-venv && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements
COPY requirements.txt ./

# Create and activate virtual environment, then install Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN groupadd -g 1001 nodejs
RUN useradd -u 1001 -g nodejs -s /bin/bash -m nextjs

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
```

### **Development Dockerfile**
```dockerfile
# Backend Development Dockerfile
FROM node:18-slim

# Install Python and required packages for financial calculations
RUN apt-get update && apt-get install -y python3 python3-pip python3-dev python3-venv && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Create and activate virtual environment, then install Python dependencies
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 3001

# Start the development server
CMD ["npm", "run", "dev"]
```

---

## 🗄️ Database Migration

### **Migration Process**
1. **Schema Creation**: Create tables, columns, and basic structure
2. **Data Migration**: Transfer data from local to production
3. **Constraint Migration**: Add primary keys, foreign keys, indexes
4. **Trigger Migration**: Add database triggers and functions
5. **Validation**: Verify all objects match between environments

### **Key Migration Scripts**
- `create_production_schema.js` - Initial schema creation
- `migrate_missing_objects.js` - Add missing constraints and indexes
- `add_essential_triggers.js` - Add database triggers
- `comprehensive_validation.js` - Verify migration completeness

---

## 🎨 Frontend Issues

### **Image Loading Issues**
**Problem**: Home page images not displaying in production
**Solution**: Move images to `public/assets/homepage/` and update paths

**Before**:
```tsx
image: "src/assets/homepage/1.jpg"
```

**After**:
```tsx
image: "/assets/homepage/1.jpg"
```

### **API Endpoint Issues**
**Problem**: Missing `/api/companies` endpoint
**Solution**: Created `companiesRoutes.js` with proper endpoint

---

## ⚙️ Backend Issues

### **Missing Routes**
**Problem**: 404 errors on data entry sections
**Solution**: Ensure all routes are properly loaded in `server.js`

### **Authentication Issues**
**Problem**: 401 Unauthorized errors
**Solution**: Verify JWT middleware and token validation

---

## 🔍 Troubleshooting Checklist

### **Before Deployment**
- [ ] All environment variables configured
- [ ] Python dependencies in requirements.txt
- [ ] Dockerfiles updated for production
- [ ] CORS configuration set
- [ ] Rate limiters removed (if using dcdeploy)

### **During Deployment**
- [ ] Backend builds successfully
- [ ] Python dependencies install without errors
- [ ] Database connection established
- [ ] Frontend builds and deploys
- [ ] CORS headers properly set

### **After Deployment**
- [ ] Home page loads with images
- [ ] Authentication works
- [ ] Data entry forms load
- [ ] Calculation engine functions
- [ ] All API endpoints respond

---

## 💡 Best Practices

### **1. Environment Variables**
- Use consistent naming convention (`POSTGRESQL_*`)
- Provide sensible defaults for local development
- Never hardcode production values

### **2. Docker Configuration**
- Choose appropriate base images for dependencies
- Use virtual environments for Python packages
- Create non-root users for security

### **3. Python Scripts**
- Always use environment variables for configuration
- Provide fallback values for local development
- Test scripts locally before deployment

### **4. Error Handling**
- Log all errors with context
- Provide meaningful error messages
- Implement proper fallbacks

### **5. Testing**
- Test each fix individually
- Verify functionality before moving to next issue
- Test in both local and production environments

---

## 📚 Additional Resources

### **Useful Commands**
```bash
# Check backend deployment status
git log --oneline -5

# Test Python scripts locally
cd api-server && python3 scripts/calculate_debt_schedule.py --help

# Check Docker build logs
docker build -t test-backend .

# Verify environment variables
echo $POSTGRESQL_HOST
```

### **Key Files to Monitor**
- `api-server/Dockerfile`
- `api-server/requirements.txt`
- `api-server/scripts/*.py`
- `src/pages/Home.tsx`
- `api-server/server.js`

---

## 🎉 Conclusion

This guide covers all major deployment issues encountered during the Refi Wizard PostgreSQL project. The key to successful deployment is:

1. **Systematic approach** - Fix one issue at a time
2. **Environment consistency** - Use same configuration across environments
3. **Proper Docker setup** - Choose appropriate base images and dependencies
4. **Comprehensive testing** - Verify each fix before proceeding
5. **Documentation** - Keep track of all changes and solutions

Following this guide should prevent most deployment issues and provide quick solutions when they do occur.

---

*Last Updated: August 11, 2025*
*Version: 1.0*
