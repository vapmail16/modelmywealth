const express = require('express');
const router = express.Router();
const seasonalityController = require('../controllers/seasonalityController');
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

// GET /api/seasonality/:projectId
// Get seasonality data for a project
router.get('/:projectId', seasonalityController.getSeasonalityData);

// PUT /api/seasonality/:projectId
// Save/update seasonality data
router.put('/:projectId', seasonalityController.saveSeasonalityData);

// PATCH /api/seasonality/:projectId
// Update specific fields of seasonality data
router.patch('/:projectId', seasonalityController.updateSeasonalityFields);

// DELETE /api/seasonality/:projectId
// Delete seasonality data
router.delete('/:projectId', seasonalityController.deleteSeasonalityData);

// GET /api/seasonality/:projectId/audit
// Get audit history for seasonality data
router.get('/:projectId/audit', seasonalityController.getAuditHistory);

// GET /api/seasonality/:projectId/audit/stats
// Get audit statistics for seasonality data
router.get('/:projectId/audit/stats', seasonalityController.getAuditStats);

module.exports = router; 