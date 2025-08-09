const express = require('express');
const router = express.Router();
const growthAssumptionsController = require('../controllers/growthAssumptionsController');
const authMiddleware = require('../middleware/auth');
const rateLimiters = require('../middleware/rateLimiter');
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

// Apply rate limiting to all routes
router.use(rateLimiters.general);

// Apply project ownership middleware to all routes
router.use('/:projectId', projectOwnershipMiddleware);

// GET /api/growth-assumptions/:projectId
// Get growth assumptions data for a project
router.get('/:projectId', growthAssumptionsController.getGrowthAssumptionsData);

// PUT /api/growth-assumptions/:projectId
// Save/update growth assumptions data
router.put('/:projectId', growthAssumptionsController.saveGrowthAssumptionsData);

// PATCH /api/growth-assumptions/:projectId
// Update specific fields of growth assumptions data
router.patch('/:projectId', growthAssumptionsController.updateGrowthAssumptionsFields);

// DELETE /api/growth-assumptions/:projectId
// Delete growth assumptions data
router.delete('/:projectId', growthAssumptionsController.deleteGrowthAssumptionsData);

// GET /api/growth-assumptions/:projectId/audit
// Get audit history for growth assumptions data
router.get('/:projectId/audit', growthAssumptionsController.getAuditHistory);

// GET /api/growth-assumptions/:projectId/audit/stats
// Get audit statistics for growth assumptions data
router.get('/:projectId/audit/stats', growthAssumptionsController.getAuditStats);

module.exports = router; 