const express = require('express');
const router = express.Router();
const workingCapitalController = require('../controllers/workingCapitalController');
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

// GET /api/working-capital/:projectId
// Get working capital data for a project
router.get('/:projectId', workingCapitalController.getWorkingCapitalData);

// PUT /api/working-capital/:projectId
// Save/update working capital data
router.put('/:projectId', workingCapitalController.saveWorkingCapitalData);

// PATCH /api/working-capital/:projectId
// Update specific fields of working capital data
router.patch('/:projectId', workingCapitalController.updateWorkingCapitalFields);

// DELETE /api/working-capital/:projectId
// Delete working capital data
router.delete('/:projectId', workingCapitalController.deleteWorkingCapitalData);

// GET /api/working-capital/:projectId/audit
// Get audit history for working capital data
router.get('/:projectId/audit', workingCapitalController.getAuditHistory);

// GET /api/working-capital/:projectId/audit/stats
// Get audit statistics for working capital data
router.get('/:projectId/audit/stats', workingCapitalController.getAuditStats);

module.exports = router; 