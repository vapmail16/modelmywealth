const debtCalculationRepository = require('../repositories/debtCalculationRepository');
const debtStructureRepository = require('../repositories/debtStructureRepository');
const balanceSheetRepository = require('../repositories/balanceSheetRepository');
const auditService = require('./auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class DebtCalculationService {

  async validateRequiredData(projectId) {
    try {
      // Get latest debt structure data
      const debtStructureData = await debtStructureRepository.getByProjectId(projectId);
      if (!debtStructureData) {
        throw new Error('Debt structure data not found. Please complete the Debt Structure section first.');
      }

      // Get latest balance sheet data
      const balanceSheetData = await balanceSheetRepository.getByProjectId(projectId);
      if (!balanceSheetData) {
        throw new Error('Balance sheet data not found. Please complete the Balance Sheet section first.');
      }

      return { debtStructureData, balanceSheetData };
    } catch (error) {
      throw new Error(`Data validation failed: ${error.message}`);
    }
  }

  async performDebtCalculation(projectId, userId, changeReason = 'Debt calculation performed') {
    try {
      const startTime = Date.now();
      
      // Validate required data
      const { debtStructureData, balanceSheetData } = await this.validateRequiredData(projectId);

      // Create calculation run record
      const calculationRun = await debtCalculationRepository.createCalculationRun({
        project_id: projectId,
        run_name: `Debt Calculation ${new Date().toISOString()}`,
        calculation_type: 'debt_calculation',
        input_data: { debtStructureData, balanceSheetData },
        output_data: {},
        status: 'running',
        created_by: userId
      });

      // Call Python script for calculation
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout, stderr } = await execAsync(`python3 scripts/calculate_debt_schedule.py ${projectId} ${calculationRun.id}`);
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'Python calculation failed');
      }

      // Get the calculated results from database
      const calculationResults = await debtCalculationRepository.getByProjectId(projectId);
      
      // Update calculation run with results
      const executionTime = Date.now() - startTime;
      await debtCalculationRepository.updateCalculationRun(calculationRun.id, {
        output_data: { 
          total_months: result.total_months,
          summary: {
            total_principal: result.total_principal,
            total_interest: result.total_interest,
            final_balance: result.final_balance
          }
        },
        status: 'completed',
        completed_at: new Date(),
        execution_time_ms: executionTime
      });

      // Log audit entry
      await auditService.logChange({
        table_name: 'debt_calculations',
        record_id: calculationRun.id,
        action: 'INSERT',
        old_values: {},
        new_values: { 
          project_id: projectId,
          calculation_run_id: calculationRun.id,
          total_records: calculationResults.length
        },
        changed_fields: ['calculation_performed'],
        change_reason: changeReason,
        user_id: userId,
        ip_address: null
      });

      return {
        success: true,
        calculationRun,
        results: calculationResults,
        summary: {
          total_months: result.total_months,
          total_principal: result.total_principal,
          total_interest: result.total_interest,
          final_balance: result.final_balance,
          execution_time_ms: executionTime
        }
      };

    } catch (error) {
      logger.error(`Debt calculation failed: ${error.message}`);
      throw error;
    }
  }

  async getDebtCalculations(projectId) {
    try {
      const calculations = await debtCalculationRepository.getByProjectId(projectId);
      return calculations;
    } catch (error) {
      throw new Error(`Failed to get debt calculations: ${error.message}`);
    }
  }

  async getCalculationHistory(projectId) {
    try {
      const history = await debtCalculationRepository.getCalculationHistory(projectId);
      return history;
    } catch (error) {
      throw new Error(`Failed to get calculation history: ${error.message}`);
    }
  }

  async restoreCalculationRun(runId, projectId) {
    try {
      // Get the calculation run details
      const run = await debtCalculationRepository.getCalculationRun(runId);
      
      if (!run) {
        throw new Error('Calculation run not found');
      }

      if (run.project_id !== projectId) {
        throw new Error('Calculation run does not belong to this project');
      }

      // Get the calculation results for this run
      const calculationResults = await debtCalculationRepository.getByCalculationRunId(runId);
      
      if (!calculationResults || calculationResults.length === 0) {
        throw new Error(`No calculation results found for run ${runId}. This run may have been created but the calculations were not saved properly.`);
      }

      // Delete current calculations for the project
      await debtCalculationRepository.deleteByProjectId(projectId);

      // Restore the calculations from the selected run
      const restoredCalculations = [];
      for (const calculation of calculationResults) {
        const restoredCalculation = await debtCalculationRepository.create({
          project_id: projectId,
          month: calculation.month,
          year: calculation.year,
          opening_balance: calculation.opening_balance,
          payment: calculation.payment,
          interest_payment: calculation.interest_payment,
          principal_payment: calculation.principal_payment,
          closing_balance: calculation.closing_balance,
          cumulative_interest: calculation.cumulative_interest,
          calculation_run_id: runId // Link to the original run
        });
        restoredCalculations.push(restoredCalculation);
      }

      // Log the restoration
      await auditService.logChange({
        table_name: 'debt_calculations',
        record_id: runId,
        action: 'RESTORE',
        old_values: {},
        new_values: { 
          project_id: projectId,
          restored_from_run_id: runId,
          total_records: restoredCalculations.length
        },
        changed_fields: ['calculation_restored'],
        change_reason: `Restored from calculation run ${runId}`,
        user_id: run.created_by,
        ip_address: null
      });

      return {
        success: true,
        restoredRun: run,
        restoredCalculations: restoredCalculations,
        totalRecords: restoredCalculations.length
      };

    } catch (error) {
      this.logger.error(`Failed to restore calculation run: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DebtCalculationService();
