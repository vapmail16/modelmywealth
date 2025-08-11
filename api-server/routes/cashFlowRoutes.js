const express = require('express');
const router = express.Router();
const cashFlowController = require('../controllers/cashFlowController');
const authMiddleware = require('../middleware/auth');
const DatabaseService = require('../services/database');

// Project ownership middleware
const projectOwnershipMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required'
      });
    }

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
      message: 'Error verifying project ownership'
    });
  }
};

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateUser);

// Apply project ownership middleware to all routes
router.use('/:projectId', projectOwnershipMiddleware);

// GET /api/cash-flow/:projectId
// Get cash flow data for a project
router.get('/:projectId', cashFlowController.getCashFlowData);

// PUT /api/cash-flow/:projectId
// Save/update cash flow data
router.put('/:projectId', cashFlowController.saveCashFlowData);

// PATCH /api/cash-flow/:projectId
// Update specific fields of cash flow data
router.patch('/:projectId', cashFlowController.updateCashFlowFields);

// GET /api/cash-flow/:projectId/audit
// Get audit history for cash flow data
router.get('/:projectId/audit', cashFlowController.getAuditHistory);

// GET /api/cash-flow/:projectId/audit/stats
// Get audit statistics for cash flow data
router.get('/:projectId/audit/stats', cashFlowController.getAuditStats);

module.exports = router;