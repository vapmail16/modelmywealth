const debtCalculationService = require('../services/debtCalculationService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class DebtCalculationController {

  async performDebtCalculation(req, res) {
    try {
      const { projectId } = req.params;
      const { change_reason } = req.body;
      const userId = req.user?.id;

      logger.info(`Performing debt calculation for project: ${projectId}`);

      const result = await debtCalculationService.performDebtCalculation(
        projectId, 
        userId, 
        change_reason
      );

      res.status(200).json({
        success: true,
        message: 'Debt calculation completed successfully',
        data: result
      });

    } catch (error) {
      logger.error(`Debt calculation controller error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }

  async getDebtCalculations(req, res) {
    try {
      const { projectId } = req.params;

      logger.info(`Getting debt calculations for project: ${projectId}`);

      const calculations = await debtCalculationService.getDebtCalculations(projectId);

      res.status(200).json({
        success: true,
        message: 'Debt calculations retrieved successfully',
        data: calculations
      });

    } catch (error) {
      logger.error(`Get debt calculations controller error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }

  async getCalculationHistory(req, res) {
    try {
      const { projectId } = req.params;

      logger.info(`Getting calculation history for project: ${projectId}`);

      const history = await debtCalculationService.getCalculationHistory(projectId);

      res.status(200).json({
        success: true,
        message: 'Calculation history retrieved successfully',
        data: history
      });

    } catch (error) {
      logger.error(`Get calculation history controller error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }

  async restoreCalculationRun(req, res) {
    try {
      const { runId } = req.params;
      const { projectId } = req.body;

      logger.info(`Restoring calculation run: ${runId} for project: ${projectId}`);

      const result = await debtCalculationService.restoreCalculationRun(runId, projectId);

      res.status(200).json({
        success: true,
        message: 'Calculation run restored successfully',
        data: result
      });

    } catch (error) {
      logger.error(`Restore calculation run controller error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
        error: error.message
      });
    }
  }

  async validateCalculationData(req, res) {
    try {
      const { projectId } = req.params;

      logger.info(`Validating calculation data for project: ${projectId}`);

      const validationResult = await debtCalculationService.validateRequiredData(projectId);

      res.status(200).json({
        success: true,
        message: 'Data validation completed successfully',
        data: {
          debtStructureData: validationResult.debtStructureData,
          balanceSheetData: validationResult.balanceSheetData,
          isValid: true
        }
      });

    } catch (error) {
      logger.error(`Data validation controller error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message,
        data: {
          isValid: false,
          missingFields: error.message
        },
        error: error.message
      });
    }
  }
}

module.exports = new DebtCalculationController(); 