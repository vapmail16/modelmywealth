const kpiRepository = require('../repositories/kpiRepository');
const loggerService = require('./logger');
const logger = loggerService.logger;
const { spawn } = require('child_process');
const path = require('path');

class KpiService {
    constructor() {
        this.pythonPath = '/opt/venv/bin/python3';
    }

    async validateRequiredData(projectId) {
        try {
            // Check if consolidated data exists
            const consolidatedRepository = require('../repositories/consolidatedRepository');
            
            const monthlyData = await consolidatedRepository.getMonthlyConsolidatedByProjectId(projectId);
            const quarterlyData = await consolidatedRepository.getQuarterlyConsolidatedByProjectId(projectId);
            const yearlyData = await consolidatedRepository.getYearlyConsolidatedByProjectId(projectId);
            
            if (!monthlyData || monthlyData.length === 0) {
                return { valid: false, message: "Monthly consolidated data not found. Please run consolidated calculations first." };
            }
            
            if (!quarterlyData || quarterlyData.length === 0) {
                return { valid: false, message: "Quarterly consolidated data not found. Please run consolidated calculations first." };
            }
            
            if (!yearlyData || yearlyData.length === 0) {
                return { valid: false, message: "Yearly consolidated data not found. Please run consolidated calculations first." };
            }
            
            return { valid: true, message: "All required data is available for KPI calculations." };
        } catch (error) {
            logger.error('Error validating required data for KPI calculations:', error);
            return { valid: false, message: `Error validating data: ${error.message}` };
        }
    }

    async performKpiCalculation(projectId) {
        try {
            // Validate required data
            const validation = await this.validateRequiredData(projectId);
            if (!validation.valid) {
                return { success: false, error: validation.message };
            }

            // Create calculation run
            const calculationRun = await kpiRepository.createCalculationRun({
                project_id: projectId,
                calculation_type: 'kpi_calculation',
                status: 'running',
                description: 'KPI calculation from consolidated data',
                run_name: 'KPI Calculation',
                input_data: { projectId, calculationType: 'kpi_calculation' }
            });

            // Execute Python script
            const result = await this.executePythonScript(
                'calculate_kpis.py',
                [projectId, calculationRun.id]
            );

            if (result.success) {
                // Update calculation run status
                await kpiRepository.updateCalculationRun(calculationRun.id, {
                    status: 'completed',
                    description: 'KPI calculation completed successfully'
                });

                logger.info(`KPI calculation completed for project ${projectId}`);
                return { 
                    success: true, 
                    message: 'KPI calculation completed successfully',
                    calculationRunId: calculationRun.id
                };
            } else {
                // Update calculation run status
                await kpiRepository.updateCalculationRun(calculationRun.id, {
                    status: 'failed',
                    description: `KPI calculation failed: ${result.error}`
                });

                logger.error(`KPI calculation failed for project ${projectId}:`, result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            logger.error('Error performing KPI calculation:', error);
            return { success: false, error: error.message };
        }
    }

    async executePythonScript(scriptName, args) {
        return new Promise((resolve) => {
            const scriptPath = path.join(__dirname, '..', 'scripts', scriptName);
            
            const pythonProcess = spawn(this.pythonPath, [scriptPath, ...args], {
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        // Try to parse the output as JSON
                        const lines = stdout.trim().split('\n');
                        const results = {};
                        
                        lines.forEach(line => {
                            if (line.includes(':')) {
                                const [key, value] = line.split(': ', 2);
                                try {
                                    results[key] = JSON.parse(value);
                                } catch (e) {
                                    results[key] = value;
                                }
                            }
                        });
                        
                        resolve({ success: true, data: results });
                    } catch (error) {
                        resolve({ success: true, data: stdout });
                    }
                } else {
                    logger.error(`Python script failed with code ${code}:`, stderr);
                    resolve({ success: false, error: stderr || 'Python script execution failed' });
                }
            });

            pythonProcess.on('error', (error) => {
                logger.error('Error executing Python script:', error);
                resolve({ success: false, error: error.message });
            });
        });
    }

    async getMonthlyKpis(projectId, calculationRunId = null) {
        try {
            const kpis = await kpiRepository.getMonthlyKpisByProjectId(projectId, calculationRunId);
            return { success: true, data: kpis };
        } catch (error) {
            logger.error('Error getting monthly KPIs:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuarterlyKpis(projectId, calculationRunId = null) {
        try {
            const kpis = await kpiRepository.getQuarterlyKpisByProjectId(projectId, calculationRunId);
            return { success: true, data: kpis };
        } catch (error) {
            logger.error('Error getting quarterly KPIs:', error);
            return { success: false, error: error.message };
        }
    }

    async getYearlyKpis(projectId, calculationRunId = null) {
        try {
            const kpis = await kpiRepository.getYearlyKpisByProjectId(projectId, calculationRunId);
            return { success: true, data: kpis };
        } catch (error) {
            logger.error('Error getting yearly KPIs:', error);
            return { success: false, error: error.message };
        }
    }

    async getMonthlyKpiCalculationHistory(projectId) {
        try {
            const history = await kpiRepository.getMonthlyKpiCalculationHistory(projectId);
            return { success: true, data: history };
        } catch (error) {
            logger.error('Error getting monthly KPI calculation history:', error);
            return { success: false, error: error.message };
        }
    }

    async getQuarterlyKpiCalculationHistory(projectId) {
        try {
            const history = await kpiRepository.getQuarterlyKpiCalculationHistory(projectId);
            return { success: true, data: history };
        } catch (error) {
            logger.error('Error getting quarterly KPI calculation history:', error);
            return { success: false, error: error.message };
        }
    }

    async getYearlyKpiCalculationHistory(projectId) {
        try {
            const history = await kpiRepository.getYearlyKpiCalculationHistory(projectId);
            return { success: true, data: history };
        } catch (error) {
            logger.error('Error getting yearly KPI calculation history:', error);
            return { success: false, error: error.message };
        }
    }

    async restoreCalculationRun(projectId, runId) {
        try {
            const calculationRun = await kpiRepository.getCalculationRunById(runId);
            if (!calculationRun) {
                return { success: false, error: 'Calculation run not found' };
            }

            // Get KPIs for this specific run
            const monthlyKpis = await kpiRepository.getMonthlyKpisByProjectId(projectId, runId);
            const quarterlyKpis = await kpiRepository.getQuarterlyKpisByProjectId(projectId, runId);
            const yearlyKpis = await kpiRepository.getYearlyKpisByProjectId(projectId, runId);

            return {
                success: true,
                data: {
                    calculationRun,
                    monthlyKpis,
                    quarterlyKpis,
                    yearlyKpis
                }
            };
        } catch (error) {
            logger.error('Error restoring calculation run:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new KpiService(); 