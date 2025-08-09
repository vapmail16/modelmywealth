const express = require('express');
const router = express.Router();
const calculationPersistenceController = require('../controllers/calculationPersistenceController');
const { authenticateUser } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateUser);

// Calculation run management
router.post('/projects/:projectId/calculations/runs', calculationPersistenceController.createCalculationRun);
router.put('/calculations/runs/:runId/complete', calculationPersistenceController.completeCalculationRun);
router.put('/calculations/runs/:runId/fail', calculationPersistenceController.failCalculationRun);

// Iteration management
router.post('/calculations/runs/:runId/iterations', calculationPersistenceController.saveIteration);

// Schedule management
router.post('/calculations/runs/:runId/schedules', calculationPersistenceController.saveSchedules);

// History and analysis
router.get('/projects/:projectId/calculations/history', calculationPersistenceController.getCalculationHistory);
router.get('/calculations/runs/:runId', calculationPersistenceController.getCalculationRun);
router.get('/calculations/runs/:runId1/compare/:runId2', calculationPersistenceController.compareCalculationRuns);
router.get('/projects/:projectId/calculations/stats', calculationPersistenceController.getCalculationStats);

// Maintenance
router.delete('/calculations/clean-old-runs', calculationPersistenceController.cleanOldRuns);

module.exports = router; 