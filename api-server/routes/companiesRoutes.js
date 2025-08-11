const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/auth');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

// Middleware to log all companies-related requests
const companiesRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  logger.info('Companies API request started', {
    method: req.method,
    path: req.path,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info('Companies API request completed', {
      method: req.method,
      path: req.path,
      userId: req.user?.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: data?.success || false,
      timestamp: new Date().toISOString()
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateUser);

// Apply logging middleware to all routes
router.use(companiesRequestLogger);

// GET /api/companies
// Get all companies for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Get user's projects first, then get company details for each project
    const projectService = require('../services/projectService');
    const projects = await projectService.getUserProjects(userId);
    
    if (!projects || projects.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No projects found for user'
      });
    }
    
    // Get company details for each project
    const companies = [];
    for (const project of projects) {
      try {
        const companyDetails = await companyController.getCompanyDetails({
          params: { projectId: project.id },
          user: { id: userId }
        });
        
        if (companyDetails && companyDetails.data) {
          companies.push({
            projectId: project.id,
            projectName: project.name,
            company: companyDetails.data
          });
        }
      } catch (error) {
        logger.warn('Failed to get company details for project', {
          projectId: project.id,
          error: error.message
        });
        // Continue with other projects
      }
    }
    
    res.json({
      success: true,
      data: companies,
      message: 'Companies retrieved successfully'
    });
  } catch (error) {
    logger.error('Error fetching companies for user', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch companies'
    });
  }
});

// Error handling middleware for companies routes
router.use((error, req, res, next) => {
  logger.error('Companies routes error handler', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details || error.message
    });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized access'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred while processing companies data'
  });
});

module.exports = router;
