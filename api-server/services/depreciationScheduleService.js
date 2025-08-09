const depreciationScheduleRepository = require('../repositories/depreciationScheduleRepository');
const balanceSheetRepository = require('../repositories/balanceSheetRepository');
const auditService = require('./auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class DepreciationScheduleService {

  async validateRequiredData(projectId) {
    try {
      // Get latest balance sheet data
      const balanceSheetData = await balanceSheetRepository.getByProjectId(projectId);
      if (!balanceSheetData) {
        throw new Error('Balance sheet data not found. Please complete the Balance Sheet section first.');
      }

      return { balanceSheetData };
    } catch (error) {
      throw new Error(`Data validation failed: ${error.message}`);
    }
  }

  async performDepreciationCalculation(projectId, userId, changeReason = 'Depreciation calculation performed') {
    try {
      const startTime = Date.now();
      
      // Validate required data
      const { balanceSheetData } = await this.validateRequiredData(projectId);

      // Create calculation run record
      const calculationRun = await depreciationScheduleRepository.createCalculationRun({
        project_id: projectId,
        run_name: `Depreciation Schedule ${new Date().toISOString()}`,
        calculation_type: 'depreciation_schedule',
        input_data: { balanceSheetData },
        output_data: {},
        status: 'running',
        created_by: userId
      });

      // Call Python script for calculation
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      const { stdout, stderr } = await execAsync(`python3 scripts/calculate_depreciation_schedule.py ${projectId} ${calculationRun.id}`);
      const result = JSON.parse(stdout);
      
      if (!result.success) {
        throw new Error(result.error || 'Python calculation failed');
      }

      // Get the calculated results from database
      const calculationResults = await depreciationScheduleRepository.getByProjectId(projectId);
      
      // Update calculation run with results
      const executionTime = Date.now() - startTime;
      await depreciationScheduleRepository.updateCalculationRun(calculationRun.id, {
        output_data: { 
          total_months: result.total_months,
          summary: {
            total_depreciation: result.total_depreciation,
            final_net_book_value: result.final_net_book_value
          }
        },
        status: 'completed',
        completed_at: new Date(),
        execution_time_ms: executionTime
      });

      // Log audit entry
      await auditService.logChange({
        table_name: 'depreciation_schedule',
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
          total_depreciation: result.total_depreciation,
          final_net_book_value: result.final_net_book_value
        }
      };

    } catch (error) {
      logger.error(`Depreciation calculation failed: ${error.message}`);
      throw error;
    }
  }

  async getDepreciationSchedule(projectId) {
    try {
      const schedule = await depreciationScheduleRepository.getByProjectId(projectId);
      return schedule;
    } catch (error) {
      throw new Error(`Failed to get depreciation schedule: ${error.message}`);
    }
  }

  async getCalculationHistory(projectId) {
    try {
      const history = await depreciationScheduleRepository.getCalculationHistory(projectId);
      return history;
    } catch (error) {
      throw new Error(`Failed to get calculation history: ${error.message}`);
    }
  }

  async restoreCalculationRun(runId, projectId) {
    try {
      // Get the calculation run details
      const run = await depreciationScheduleRepository.getCalculationRun(runId);
      
      if (!run) {
        throw new Error('Calculation run not found');
      }

      if (run.project_id !== projectId) {
        throw new Error('Calculation run does not belong to this project');
      }

      // Get the calculation results for this run
      const calculationResults = await depreciationScheduleRepository.getByCalculationRunId(runId);
      
      if (!calculationResults || calculationResults.length === 0) {
        throw new Error(`No calculation results found for run ${runId}. This run may have been created but the calculations were not saved properly.`);
      }

      // Delete current calculations for the project
      await depreciationScheduleRepository.deleteByProjectId(projectId);

      // Restore the calculations from the selected run
      const restoredCalculations = [];
      for (const calculation of calculationResults) {
        const restoredCalculation = await depreciationScheduleRepository.create({
          project_id: projectId,
          month: calculation.month,
          year: calculation.year,
          asset_value: calculation.asset_value,
          depreciation_method: calculation.depreciation_method,
          depreciation_rate: calculation.depreciation_rate,
          monthly_depreciation: calculation.monthly_depreciation,
          accumulated_depreciation: calculation.accumulated_depreciation,
          net_book_value: calculation.net_book_value,
          calculation_run_id: runId // Link to the original run
        });
        restoredCalculations.push(restoredCalculation);
      }

      // Log the restoration
      await auditService.logChange({
        table_name: 'depreciation_schedule',
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

module.exports = new DepreciationScheduleService(); 