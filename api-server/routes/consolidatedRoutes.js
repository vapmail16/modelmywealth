const express = require('express');
const router = express.Router();
const consolidatedController = require('../controllers/consolidatedController');
const { authenticateUser } = require('../middleware/auth');
const { general: rateLimiter } = require('../middleware/rateLimiter');
const DatabaseService = require('../services/database');

// Project ownership middleware
const projectOwnershipMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const query = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const result = await DatabaseService.query(query, [projectId, userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Project not found or you do not have permission'
      });
    }
    next();
  } catch (error) {
    console.error('Project ownership middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying project ownership',
      error: error.message
    });
  }
};

// Run ownership middleware (for routes that use runId)
const runOwnershipMiddleware = async (req, res, next) => {
  try {
    const { runId } = req.params;
    const userId = req.user.id;

    const query = `
      SELECT cr.id FROM calculation_runs cr 
      JOIN projects p ON cr.project_id = p.id 
      WHERE cr.id = $1 AND p.user_id = $2
    `;
    const result = await DatabaseService.query(query, [runId, userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Calculation run not found or you do not have permission'
      });
    }
    next();
  } catch (error) {
    console.error('Run ownership middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying run ownership',
      error: error.message
    });
  }
};

// Apply authentication and rate limiting to all routes
router.use(authenticateUser);
router.use(rateLimiter);

// Monthly Consolidated Routes
router.get('/:projectId/monthly/validate', projectOwnershipMiddleware, consolidatedController.validateData);
router.post('/:projectId/monthly/calculate', projectOwnershipMiddleware, consolidatedController.performMonthlyCalculation);
router.get('/:projectId/monthly/data', projectOwnershipMiddleware, consolidatedController.getMonthlyConsolidated);
router.get('/:projectId/monthly/history', projectOwnershipMiddleware, consolidatedController.getMonthlyCalculationHistory);

// Quarterly Consolidated Routes
router.get('/:projectId/quarterly/validate', projectOwnershipMiddleware, consolidatedController.validateData);
router.post('/:projectId/quarterly/calculate', projectOwnershipMiddleware, consolidatedController.performQuarterlyCalculation);
router.get('/:projectId/quarterly/data', projectOwnershipMiddleware, consolidatedController.getQuarterlyConsolidated);
router.get('/:projectId/quarterly/history', projectOwnershipMiddleware, consolidatedController.getQuarterlyCalculationHistory);

// Yearly Consolidated Routes
router.get('/:projectId/yearly/validate', projectOwnershipMiddleware, consolidatedController.validateData);
router.post('/:projectId/yearly/calculate', projectOwnershipMiddleware, consolidatedController.performYearlyCalculation);
router.get('/:projectId/yearly/data', projectOwnershipMiddleware, consolidatedController.getYearlyConsolidated);
router.get('/:projectId/yearly/history', projectOwnershipMiddleware, consolidatedController.getYearlyCalculationHistory);

// Generic calculation run restoration
router.get('/:projectId/:runId/restore', projectOwnershipMiddleware, runOwnershipMiddleware, consolidatedController.restoreCalculationRun);

module.exports = router; 