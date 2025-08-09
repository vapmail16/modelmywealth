const depreciationScheduleService = require('../services/depreciationScheduleService');
const logger = require('../services/logger').logger;

class DepreciationScheduleController {

  async validateData(req, res) {
    try {
      const { projectId } = req.params;
      const result = await depreciationScheduleService.validateRequiredData(projectId);
      
      res.json({
        success: true,
        message: 'Data validation successful',
        data: result
      });
    } catch (error) {
      logger.error(`Depreciation schedule validation error: ${error.message}`);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async performCalculation(req, res) {
    try {
      const { projectId } = req.params;
      const { change_reason } = req.body;
      const userId = req.user.id;

      const result = await depreciationScheduleService.performDepreciationCalculation(
        projectId, 
        userId, 
        change_reason
      );

      res.json({
        success: true,
        message: 'Depreciation schedule calculated successfully',
        data: result
      });
    } catch (error) {
      logger.error(`Depreciation schedule calculation error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDepreciationSchedule(req, res) {
    try {
      const { projectId } = req.params;
      const schedule = await depreciationScheduleService.getDepreciationSchedule(projectId);
      
      res.json({
        success: true,
        message: 'Depreciation schedule retrieved successfully',
        data: schedule
      });
    } catch (error) {
      logger.error(`Get depreciation schedule error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCalculationHistory(req, res) {
    try {
      const { projectId } = req.params;
      const history = await depreciationScheduleService.getCalculationHistory(projectId);
      
      res.json({
        success: true,
        message: 'Calculation history retrieved successfully',
        data: history
      });
    } catch (error) {
      logger.error(`Get calculation history error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async restoreCalculationRun(req, res) {
    try {
      const { runId } = req.params;
      const { projectId } = req.body;
      
      const result = await depreciationScheduleService.restoreCalculationRun(runId, projectId);
      
      res.json({
        success: true,
        message: 'Calculation run restored successfully',
        data: result
      });
    } catch (error) {
      logger.error(`Restore calculation run error: ${error.message}`);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new DepreciationScheduleController(); 