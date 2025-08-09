const consolidatedService = require('../services/consolidatedService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class ConsolidatedController {
    async validateData(req, res) {
        try {
            const { projectId } = req.params;
            
            const result = await consolidatedService.validateRequiredData(projectId);
            
            if (result.isValid) {
                res.json({
                    success: true,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error validating consolidated data:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async performMonthlyCalculation(req, res) {
        try {
            const { projectId } = req.params;
            
            const result = await consolidatedService.performMonthlyCalculation(projectId);
            
            if (result.success) {
                res.json({
                    success: true,
                    calculationRunId: result.calculationRunId,
                    totalMonths: result.totalMonths,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error performing monthly calculation:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async performQuarterlyCalculation(req, res) {
        try {
            const { projectId } = req.params;
            
            // Get the latest monthly calculation run ID
            const monthlyHistory = await consolidatedService.getMonthlyCalculationHistory(projectId);
            if (!monthlyHistory || monthlyHistory.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No monthly calculation found. Please run monthly calculation first.'
                });
            }
            
            const latestMonthlyRun = monthlyHistory[0]; // Get the most recent
            const result = await consolidatedService.performQuarterlyCalculation(projectId, latestMonthlyRun.id);
            
            if (result.success) {
                res.json({
                    success: true,
                    calculationRunId: result.calculationRunId,
                    totalQuarters: result.totalQuarters,
                    message: result.message
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error performing quarterly calculation:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async performYearlyCalculation(req, res) {
        try {
            const { projectId } = req.params;
            
            // Get the latest monthly calculation run ID
            const monthlyHistory = await consolidatedService.getMonthlyCalculationHistory(projectId);
            if (!monthlyHistory || monthlyHistory.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No monthly calculation found. Please run monthly calculation first.'
                });
            }
            
            const latestMonthlyRun = monthlyHistory[0]; // Get the most recent
            const result = await consolidatedService.performYearlyCalculation(projectId, latestMonthlyRun.id);
            
            if (result.success) {
                res.json({
                    success: true,
                    calculationRunId: result.calculationRunId,
                    totalYears: result.totalYears,
                    message: result.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error performing yearly calculation:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getMonthlyConsolidated(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            const result = await consolidatedService.getMonthlyConsolidated(projectId, calculationRunId);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting monthly consolidated data:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getQuarterlyConsolidated(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            const result = await consolidatedService.getQuarterlyConsolidated(projectId, calculationRunId);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting quarterly consolidated data:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getYearlyConsolidated(req, res) {
        try {
            const { projectId } = req.params;
            const { calculationRunId } = req.query;
            
            const result = await consolidatedService.getYearlyConsolidated(projectId, calculationRunId);
            
            if (result.success) {
                res.json({
                    success: true,
                    data: result.data
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting yearly consolidated data:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getMonthlyCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            const result = await consolidatedService.getMonthlyCalculationHistory(projectId);
            
            if (result.success) {
                res.json({
                    success: true,
                    history: result.history
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting monthly calculation history:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getQuarterlyCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            const result = await consolidatedService.getQuarterlyCalculationHistory(projectId);
            
            if (result.success) {
                res.json({
                    success: true,
                    history: result.history
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting quarterly calculation history:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async getYearlyCalculationHistory(req, res) {
        try {
            const { projectId } = req.params;
            
            const result = await consolidatedService.getYearlyCalculationHistory(projectId);
            
            if (result.success) {
                res.json({
                    success: true,
                    history: result.history
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error getting yearly calculation history:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }

    async restoreCalculationRun(req, res) {
        try {
            const { projectId, runId } = req.params;
            const { type } = req.query;
            
            const result = await consolidatedService.restoreCalculationRun(projectId, runId, type);
            
            if (result.success) {
                res.json({
                    success: true,
                    calculationRun: result.calculationRun
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Error restoring calculation run:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
}

module.exports = new ConsolidatedController(); 