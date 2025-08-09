const express = require('express');
const router = express.Router();
const kpiController = require('../controllers/kpiController');
const { authenticateUser } = require('../middleware/auth');
const { general: rateLimiter } = require('../middleware/rateLimiter');
const DatabaseService = require('../services/database');

// Middleware for project ownership verification
const projectOwnershipMiddleware = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.id;

        const query = 'SELECT id FROM projects WHERE id = $1 AND user_id = $2';
        const result = await DatabaseService.query(query, [projectId, userId]);
        
        if (result.rows.length === 0) {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied. You do not have permission to access this project.' 
            });
        }
        
        req.project = result.rows[0];
        next();
    } catch (error) {
        console.error('Project ownership middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};

// Middleware for calculation run ownership verification
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
                error: 'Access denied. You do not have permission to access this calculation run.' 
            });
        }
        
        req.calculationRun = result.rows[0];
        next();
    } catch (error) {
        console.error('Calculation run ownership middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};

// Apply authentication and rate limiting to all routes
router.use(authenticateUser);
router.use(rateLimiter);

// Validation endpoint
router.get('/:projectId/validate', projectOwnershipMiddleware, kpiController.validateData);

// Calculation endpoint
router.post('/:projectId/calculate', projectOwnershipMiddleware, kpiController.performCalculation);

// Data retrieval endpoints
router.get('/:projectId/monthly', projectOwnershipMiddleware, kpiController.getMonthlyKpis);
router.get('/:projectId/quarterly', projectOwnershipMiddleware, kpiController.getQuarterlyKpis);
router.get('/:projectId/yearly', projectOwnershipMiddleware, kpiController.getYearlyKpis);

// History endpoints
router.get('/:projectId/history/monthly', projectOwnershipMiddleware, kpiController.getMonthlyKpiCalculationHistory);
router.get('/:projectId/history/quarterly', projectOwnershipMiddleware, kpiController.getQuarterlyKpiCalculationHistory);
router.get('/:projectId/history/yearly', projectOwnershipMiddleware, kpiController.getYearlyKpiCalculationHistory);

// Restore calculation run
router.get('/:projectId/:runId/restore', runOwnershipMiddleware, kpiController.restoreCalculationRun);

module.exports = router; 