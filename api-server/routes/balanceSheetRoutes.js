const express = require('express');
const router = express.Router();
const balanceSheetController = require('../controllers/balanceSheetController');
const authMiddleware = require('../middleware/auth');

// Project ownership middleware (defined inline to avoid import issues)
const projectOwnershipMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if user owns the project
    const db = require('../services/database');
    const result = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this project'
      });
    }
    
    next();
  } catch (error) {
    console.error('Project ownership check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify project ownership'
    });
  }
};

// Apply authentication to all routes
router.use(authMiddleware.authenticateUser);

// GET /api/balance-sheet/:projectId - Get balance sheet data
router.get('/:projectId', projectOwnershipMiddleware, balanceSheetController.getBalanceSheetData);

// PUT /api/balance-sheet/:projectId - Save balance sheet data (create or update)
router.put('/:projectId', projectOwnershipMiddleware, balanceSheetController.saveBalanceSheetData);

// PATCH /api/balance-sheet/:projectId - Update specific fields
router.patch('/:projectId', projectOwnershipMiddleware, balanceSheetController.updateBalanceSheetFields);

// DELETE /api/balance-sheet/:projectId - Delete balance sheet data
router.delete('/:projectId', projectOwnershipMiddleware, balanceSheetController.deleteBalanceSheetData);

// GET /api/balance-sheet/:projectId/audit/history - Get audit history
router.get('/:projectId/audit/history', projectOwnershipMiddleware, balanceSheetController.getAuditHistory);

// GET /api/balance-sheet/:projectId/audit/stats - Get audit statistics
router.get('/:projectId/audit/stats', projectOwnershipMiddleware, balanceSheetController.getAuditStats);

module.exports = router; 