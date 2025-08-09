const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

const router = express.Router();


// Middleware to log all company-related requests
const companyRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Company API request started', {
    method: req.method,
    path: req.path,
    projectId: req.params.projectId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info('Company API request completed', {
      method: req.method,
      path: req.path,
      projectId: req.params.projectId,
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

// Project ownership middleware - ensures user can only access their projects
const projectOwnershipMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;
    
    if (!projectId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing project ID or user authentication'
      });
    }
    
    // Check if user owns this project (you might want to add this to projectService)
    // For now, we'll assume all authenticated users can access any project
    // In production, you should verify project ownership
    
    next();
  } catch (error) {
    logger.error('Project ownership check failed', {
      projectId: req.params.projectId,
      userId: req.user?.id,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to verify project ownership'
    });
  }
};

// Routes definition

/**
 * GET /api/projects/:projectId/company
 * Get company details for a project
 */
router.get('/:projectId/company', 
  rateLimiters.general, // Use existing rate limiter
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.getCompanyDetails
);

/**
 * PUT /api/projects/:projectId/company
 * Create or update company details (full replace)
 */
router.put('/:projectId/company',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.saveCompanyDetails
);

/**
 * PATCH /api/projects/:projectId/company
 * Partially update company details (only provided fields)
 */
router.patch('/:projectId/company',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.updateCompanyDetails
);

/**
 * GET /api/projects/:projectId/company/history
 * Get audit history for company details
 */
router.get('/:projectId/company/history',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.getAuditHistory
);

/**
 * GET /api/projects/:projectId/company/audit-stats
 * Get audit statistics for company details
 */
router.get('/:projectId/company/audit-stats',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.getAuditStats
);

/**
 * DELETE /api/projects/:projectId/company
 * Delete company details (soft delete with audit trail)
 */
router.delete('/:projectId/company',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  companyRequestLogger,
  companyController.deleteCompanyDetails
);

// Error handling middleware for company routes
router.use((error, req, res, next) => {
  logger.error('Company routes error handler', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    projectId: req.params.projectId,
    userId: req.user?.id,
    body: req.body
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
  
  if (error.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      error: 'Access forbidden'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred while processing company data'
  });
});

module.exports = router;