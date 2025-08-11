const { spawn } = require('child_process');
const path = require('path');
const consolidatedRepository = require('../repositories/consolidatedRepository');
const loggerService = require('./logger');
const logger = loggerService.logger;

class ConsolidatedService {
    constructor() {
        this.scriptsPath = path.join(__dirname, '..', 'scripts');
    }

    async validateRequiredData(projectId) {
        try {
            // Check if debt calculations exist
            const debtCalculations = await consolidatedRepository.getDebtCalculationsByProjectId(projectId);
            if (!debtCalculations || debtCalculations.length === 0) {
                return {
                    isValid: false,
                    error: 'Debt calculations not found. Please run debt calculations first.'
                };
            }

            // Check if depreciation schedule exists
            const depreciationSchedule = await consolidatedRepository.getDepreciationScheduleByProjectId(projectId);
            if (!depreciationSchedule || depreciationSchedule.length === 0) {
                return {
                    isValid: false,
                    error: 'Depreciation schedule not found. Please run depreciation calculations first.'
                };
            }

            return {
                isValid: true,
                message: 'All required data is available for consolidated calculations.'
            };
        } catch (error) {
            logger.error('Error validating required data:', error);
            return {
                isValid: false,
                error: 'Error validating required data: ' + error.message
            };
        }
    }

    async performMonthlyCalculation(projectId) {
        try {
            // Create calculation run
            const calculationRun = await consolidatedRepository.createCalculationRun({
                project_id: projectId,
                type: 'monthly_consolidated',
                status: 'running',
                description: 'Monthly consolidated financial statements calculation',
                run_name: 'Monthly Consolidated Calculation',
                input_data: { projectId, calculationType: 'monthly_consolidated' }
            });

            // Execute Python script
            const result = await this.executePythonScript(
                'calculate_monthly_consolidated.py',
                [projectId, calculationRun.id]
            );

            if (result.success) {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'completed',
                    description: `Monthly calculation completed successfully. Generated ${result.total_months} months of data.`
                });

                // Auto-generate quarterly and yearly calculations
                try {
                    await this.performQuarterlyCalculation(projectId, calculationRun.id);
                    await this.performYearlyCalculation(projectId, calculationRun.id);
                } catch (autoCalcError) {
                    logger.error('Error in auto-generation of quarterly/yearly calculations:', autoCalcError);
                    // Don't fail the monthly calculation if auto-generation fails
                }

                return {
                    success: true,
                    calculationRunId: calculationRun.id,
                    totalMonths: result.total_months,
                    message: 'Monthly consolidated calculation completed successfully. Quarterly and yearly calculations auto-generated.'
                };
            } else {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'failed',
                    description: `Monthly calculation failed: ${result.error}`
                });

                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            logger.error('Error performing monthly calculation:', error);
            return {
                success: false,
                error: 'Error performing monthly calculation: ' + error.message
            };
        }
    }

    async performQuarterlyCalculation(projectId, monthlyCalculationRunId) {
        try {
            // Create calculation run
            const calculationRun = await consolidatedRepository.createCalculationRun({
                project_id: projectId,
                type: 'quarterly_consolidated',
                status: 'running',
                description: 'Quarterly consolidated financial statements calculation',
                run_name: 'Quarterly Consolidated Calculation',
                input_data: { projectId, calculationType: 'quarterly_consolidated', monthlyCalculationRunId }
            });

            // Execute Python script with the new calculation run ID
            const result = await this.executePythonScript(
                'calculate_quarterly_consolidated.py',
                [projectId, calculationRun.id]
            );

            if (result.success) {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'completed',
                    description: `Quarterly calculation completed successfully. Generated ${result.total_quarters} quarters of data.`
                });

                return {
                    success: true,
                    calculationRunId: calculationRun.id,
                    totalQuarters: result.total_quarters,
                    message: 'Quarterly consolidated calculation completed successfully.'
                };
            } else {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'failed',
                    description: `Quarterly calculation failed: ${result.error}`
                });

                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            logger.error('Error performing quarterly calculation:', error);
            return {
                success: false,
                error: 'Error performing quarterly calculation: ' + error.message
            };
        }
    }

    async performYearlyCalculation(projectId, monthlyCalculationRunId) {
        try {
            // Create calculation run
            const calculationRun = await consolidatedRepository.createCalculationRun({
                project_id: projectId,
                type: 'yearly_consolidated',
                status: 'running',
                description: 'Yearly consolidated financial statements calculation',
                run_name: 'Yearly Consolidated Calculation',
                input_data: { projectId, calculationType: 'yearly_consolidated', monthlyCalculationRunId }
            });

            // Execute Python script with the new calculation run ID
            const result = await this.executePythonScript(
                'calculate_yearly_consolidated.py',
                [projectId, calculationRun.id]
            );

            if (result.success) {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'completed',
                    description: `Yearly calculation completed successfully. Generated ${result.total_years} years of data.`
                });

                return {
                    success: true,
                    calculationRunId: calculationRun.id,
                    totalYears: result.total_years,
                    message: 'Yearly consolidated calculation completed successfully.'
                };
            } else {
                await consolidatedRepository.updateCalculationRun(calculationRun.id, {
                    status: 'failed',
                    description: `Yearly calculation failed: ${result.error}`
                });

                return {
                    success: false,
                    error: result.error
                };
            }
        } catch (error) {
            logger.error('Error performing yearly calculation:', error);
            return {
                success: false,
                error: 'Error performing yearly calculation: ' + error.message
            };
        }
    }

    async executePythonScript(scriptName, args) {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(this.scriptsPath, scriptName);
            const pythonProcess = spawn('/opt/venv/bin/python3', [scriptPath, ...args]);

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
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (error) {
                        resolve({
                            success: false,
                            error: 'Invalid JSON output from Python script'
                        });
                    }
                } else {
                    resolve({
                        success: false,
                        error: stderr || `Python script exited with code ${code}`
                    });
                }
            });

            pythonProcess.on('error', (error) => {
                resolve({
                    success: false,
                    error: 'Failed to start Python script: ' + error.message
                });
            });
        });
    }

    async getMonthlyConsolidated(projectId, calculationRunId = null) {
        try {
            const data = await consolidatedRepository.getMonthlyConsolidatedByProjectId(projectId, calculationRunId);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            logger.error('Error getting monthly consolidated data:', error);
            return {
                success: false,
                error: 'Error retrieving monthly consolidated data: ' + error.message
            };
        }
    }

    async getQuarterlyConsolidated(projectId, calculationRunId = null) {
        try {
            const data = await consolidatedRepository.getQuarterlyConsolidatedByProjectId(projectId, calculationRunId);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            logger.error('Error getting quarterly consolidated data:', error);
            return {
                success: false,
                error: 'Error retrieving quarterly consolidated data: ' + error.message
            };
        }
    }

    async getYearlyConsolidated(projectId, calculationRunId = null) {
        try {
            const data = await consolidatedRepository.getYearlyConsolidatedByProjectId(projectId, calculationRunId);
            return {
                success: true,
                data: data
            };
        } catch (error) {
            logger.error('Error getting yearly consolidated data:', error);
            return {
                success: false,
                error: 'Error retrieving yearly consolidated data: ' + error.message
            };
        }
    }

    async getMonthlyCalculationHistory(projectId) {
        try {
            const history = await consolidatedRepository.getMonthlyCalculationHistory(projectId);
            return {
                success: true,
                history: history
            };
        } catch (error) {
            logger.error('Error getting monthly calculation history:', error);
            return {
                success: false,
                error: 'Error retrieving monthly calculation history: ' + error.message
            };
        }
    }

    async getQuarterlyCalculationHistory(projectId) {
        try {
            const history = await consolidatedRepository.getQuarterlyCalculationHistory(projectId);
            return {
                success: true,
                history: history
            };
        } catch (error) {
            logger.error('Error getting quarterly calculation history:', error);
            return {
                success: false,
                error: 'Error retrieving quarterly calculation history: ' + error.message
            };
        }
    }

    async getYearlyCalculationHistory(projectId) {
        try {
            const history = await consolidatedRepository.getYearlyCalculationHistory(projectId);
            return {
                success: true,
                history: history
            };
        } catch (error) {
            logger.error('Error getting yearly calculation history:', error);
            return {
                success: false,
                error: 'Error retrieving yearly calculation history: ' + error.message
            };
        }
    }

    async restoreCalculationRun(projectId, runId, type) {
        try {
            const calculationRun = await consolidatedRepository.getCalculationRun(runId);
            if (!calculationRun) {
                return {
                    success: false,
                    error: 'Calculation run not found'
                };
            }

            // Verify the calculation run belongs to the project
            if (calculationRun.project_id !== projectId) {
                return {
                    success: false,
                    error: 'Calculation run does not belong to this project'
                };
            }

            return {
                success: true,
                calculationRun: calculationRun
            };
        } catch (error) {
            logger.error('Error restoring calculation run:', error);
            return {
                success: false,
                error: 'Error restoring calculation run: ' + error.message
            };
        }
    }
}

module.exports = new ConsolidatedService(); 