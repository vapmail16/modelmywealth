const express = require('express');
const router = express.Router();
const debtStructureController = require('../controllers/debtStructureController');
const authMiddleware = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');

// Project ownership middleware
const projectOwnershipMiddleware = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if user has access to this project
    const { Pool } = require('pg');
    const db = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'refi_wizard',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });
    
    const query = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
    const result = await db.query(query, [projectId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You do not have permission to access this project'
      });
    }
    
    next();
  } catch (error) {
    console.error('Project ownership middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify project ownership'
    });
  }
};

// Apply middleware to all routes
router.use(authMiddleware.authenticateUser);
router.use(rateLimiters.general);

// GET /api/debt-structure/:projectId - Get debt structure data
router.get('/:projectId', projectOwnershipMiddleware, debtStructureController.getDebtStructureData);

// PUT /api/debt-structure/:projectId - Save debt structure data (create or update)
router.put('/:projectId', projectOwnershipMiddleware, debtStructureController.saveDebtStructureData);

// PATCH /api/debt-structure/:projectId - Update specific fields
router.patch('/:projectId', projectOwnershipMiddleware, debtStructureController.updateDebtStructureFields);

// GET /api/debt-structure/:projectId/audit - Get audit history
router.get('/:projectId/audit', projectOwnershipMiddleware, debtStructureController.getAuditHistory);

// GET /api/debt-structure/:projectId/audit/stats - Get audit statistics
router.get('/:projectId/audit/stats', projectOwnershipMiddleware, debtStructureController.getAuditStats);

// DELETE /api/debt-structure/:projectId - Delete debt structure data
router.delete('/:projectId', projectOwnershipMiddleware, debtStructureController.deleteDebtStructureData);

module.exports = router; 