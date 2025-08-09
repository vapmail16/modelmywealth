const kpiService = require('../services/kpiService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class KpiController {
    async validateData(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const validation = await kpiService.validateRequiredData(projectId);
            
            return res.json({
                success: validation.valid,
                message: validation.message
            });
        } catch (error) {
            logger.error('Error validating KPI data:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async performCalculation(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.performKpiCalculation(projectId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    message: result.message,
                    calculationRunId: result.calculationRunId
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error performing KPI calculation:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getMonthlyKpis(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getMonthlyKpis(projectId, calculationRunId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting monthly KPIs:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getQuarterlyKpis(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getQuarterlyKpis(projectId, calculationRunId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting quarterly KPIs:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getYearlyKpis(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getYearlyKpis(projectId, calculationRunId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting yearly KPIs:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getMonthlyKpiCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getMonthlyKpiCalculationHistory(projectId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting monthly KPI calculation history:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getQuarterlyKpiCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getQuarterlyKpiCalculationHistory(projectId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting quarterly KPI calculation history:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async getYearlyKpiCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            if (!projectId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID is required' 
                });
            }

            const result = await kpiService.getYearlyKpiCalculationHistory(projectId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting yearly KPI calculation history:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }

    async restoreCalculationRun(req, res) {
        try {
            const { projectId, runId } = req.params;
            
            if (!projectId || !runId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Project ID and Run ID are required' 
                });
            }

            const result = await kpiService.restoreCalculationRun(projectId, runId);
            
            if (result.success) {
                return res.json({
                    success: true,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error restoring calculation run:', error);
            return res.status(500).json({ 
                success: false, 
                error: 'Internal server error' 
            });
        }
    }
}

module.exports = new KpiController(); 