const express = require('express');
const router = express.Router();
const autoSaveController = require('../controllers/autoSaveController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateUser);

// Auto-save routes
router.post('/projects/:projectId/sections/:section/auto-save', autoSaveController.autoSave);
router.post('/projects/:projectId/sections/:section/force-save', autoSaveController.forceSave);
router.get('/projects/:projectId/sections/:section/audit-history', autoSaveController.getAuditHistory);
router.get('/projects/:projectId/sections/:section/fields/:fieldName/history', autoSaveController.getFieldHistory);
router.get('/projects/:projectId/sections/:section/save-status', autoSaveController.getSaveStatus);
router.delete('/projects/:projectId/cancel-pending-saves', autoSaveController.cancelPendingSaves);

module.exports = router; 