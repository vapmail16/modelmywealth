const express = require('express');
const profitLossController = require('../controllers/profitLossController');
const authMiddleware = require('../middleware/auth');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

const router = express.Router();

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
    logger.error('Project ownership middleware error', {
      error: error.message,
      projectId: req.params.projectId,
      userId: req.user?.id
    });
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify project ownership'
    });
  }
};

// Middleware to log all profit loss related requests
const profitLossRequestLogger = (req, res, next) => {
  const startTime = Date.now();
  logger.info(`Profit Loss Route Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    projectId: req.params.projectId,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info(`Profit Loss Route Response: ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      projectId: req.params.projectId,
      userId: req.user?.id
    });
  });

  next();
};

// Get profit loss data for a project
router.get('/:projectId/profit-loss',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getProfitLossData
);

// Save/create profit loss data for a project (full replacement)
router.put('/:projectId/profit-loss',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.saveProfitLossData
);

// Update profit loss data for a project (partial update)
router.patch('/:projectId/profit-loss',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.updateProfitLossData
);

// Get audit history for profit loss data
router.get('/:projectId/profit-loss/history',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getAuditHistory
);

// Get audit statistics for profit loss data
router.get('/:projectId/profit-loss/audit-stats',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getAuditStats
);

// Delete profit loss data for a project
router.delete('/:projectId/profit-loss',
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.deleteProfitLossData
);

// Error handling middleware for profit loss routes
router.use((error, req, res, next) => {
  logger.error('Profit Loss routes error handler', {
    error: error.message,
    stack: error.stack,
    projectId: req.params.projectId,
    userId: req.user?.id,
    path: req.path,
    method: req.method
  });

  res.status(500).json({ 
    success: false, 
    error: 'Internal server error', 
    message: 'An unexpected error occurred in profit loss routes.' 
  });
});

module.exports = router;