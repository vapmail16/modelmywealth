const express = require('express');
const profitLossController = require('../controllers/profitLossController');
const authMiddleware = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');
const loggerService = require('../services/logger');
const logger = loggerService.logger;
const projectOwnershipMiddleware = require('../middleware/projectOwnership');

const router = express.Router();

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
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getProfitLossData
);

// Save/create profit loss data for a project (full replacement)
router.put('/:projectId/profit-loss',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.saveProfitLossData
);

// Update profit loss data for a project (partial update)
router.patch('/:projectId/profit-loss',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.updateProfitLossData
);

// Get audit history for profit loss data
router.get('/:projectId/profit-loss/history',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getAuditHistory
);

// Get audit statistics for profit loss data
router.get('/:projectId/profit-loss/audit-stats',
  rateLimiters.general,
  authMiddleware.authenticateUser,
  projectOwnershipMiddleware,
  profitLossRequestLogger,
  profitLossController.getAuditStats
);

// Delete profit loss data for a project
router.delete('/:projectId/profit-loss',
  rateLimiters.general,
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