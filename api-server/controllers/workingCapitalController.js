const workingCapitalService = require('../services/workingCapitalService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

// Utility function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

class WorkingCapitalController {
  /**
   * Get working capital data for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getWorkingCapitalData(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const data = await workingCapitalService.getWorkingCapitalData(projectId);
      
      res.json({
        success: true,
        data: data,
        message: data ? 'Working capital data retrieved successfully' : 'No working capital data found'
      });
    } catch (error) {
      logger.error('Error in getWorkingCapitalData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve working capital data',
        error: error.message
      });
    }
  }

  /**
   * Save working capital data (create or update)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveWorkingCapitalData(req, res) {
    try {
      const { projectId } = req.params;
      const { data, changeReason } = req.body;
      const userId = req.user.id;
      const ipAddress = req.ip;

      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      if (!data || typeof data !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Valid data object is required'
        });
      }

      const result = await workingCapitalService.saveWorkingCapitalData(
        projectId, 
        data, 
        userId, 
        changeReason || 'Data entry update'
      );

      res.json({
        success: true,
        data: result,
        audit: result.audit,
        message: result.audit.isNewRecord
          ? 'Working capital data created successfully'
          : 'Working capital data updated successfully'
      });
    } catch (error) {
      logger.error('Error in saveWorkingCapitalData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save working capital data',
        error: error.message
      });
    }
  }

  /**
   * Update specific fields of working capital data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateWorkingCapitalFields(req, res) {
    try {
      const { projectId } = req.params;
      const { fieldUpdates, changeReason } = req.body;
      const userId = req.user.id;
      const ipAddress = req.ip;

      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      if (!fieldUpdates || typeof fieldUpdates !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Valid field updates object is required'
        });
      }

      const result = await workingCapitalService.updateWorkingCapitalFields(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason || 'Field update'
      );

      res.json({
        success: true,
        data: result,
        audit: result.audit,
        message: result.audit.changesDetected
          ? 'Working capital fields updated successfully'
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateWorkingCapitalFields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update working capital fields',
        error: error.message
      });
    }
  }

  /**
   * Get audit history for working capital data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAuditHistory(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const history = await workingCapitalService.getAuditHistory(projectId);
      
      res.json({
        success: true,
        data: history,
        message: `Retrieved ${history.length} audit entries`
      });
    } catch (error) {
      logger.error('Error in getAuditHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit history',
        error: error.message
      });
    }
  }

  /**
   * Get audit statistics for working capital data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAuditStats(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const stats = await workingCapitalService.getAuditStats(projectId);
      
      res.json({
        success: true,
        data: stats,
        message: 'Audit statistics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAuditStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit statistics',
        error: error.message
      });
    }
  }

  /**
   * Delete working capital data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteWorkingCapitalData(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const deleted = await workingCapitalService.deleteWorkingCapitalData(projectId, userId);
      
      res.json({
        success: true,
        data: { deleted },
        message: deleted 
          ? 'Working capital data deleted successfully' 
          : 'No working capital data found to delete'
      });
    } catch (error) {
      logger.error('Error in deleteWorkingCapitalData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete working capital data',
        error: error.message
      });
    }
  }
}

module.exports = new WorkingCapitalController(); 