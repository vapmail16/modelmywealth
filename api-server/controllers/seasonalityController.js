const seasonalityService = require('../services/seasonalityService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

// Utility function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

class SeasonalityController {
  /**
   * Get seasonality data for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSeasonalityData(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const data = await seasonalityService.getSeasonalityData(projectId);
      
      res.json({
        success: true,
        data: data,
        message: data ? 'Seasonality data retrieved successfully' : 'No seasonality data found'
      });
    } catch (error) {
      logger.error('Error in getSeasonalityData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve seasonality data',
        error: error.message
      });
    }
  }

  /**
   * Save seasonality data (create or update)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveSeasonalityData(req, res) {
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

      const result = await seasonalityService.saveSeasonalityData(
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
          ? 'Seasonality data created successfully'
          : 'Seasonality data updated successfully'
      });
    } catch (error) {
      logger.error('Error in saveSeasonalityData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save seasonality data',
        error: error.message
      });
    }
  }

  /**
   * Update specific fields of seasonality data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateSeasonalityFields(req, res) {
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

      const result = await seasonalityService.updateSeasonalityFields(
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
          ? 'Seasonality fields updated successfully'
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateSeasonalityFields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update seasonality fields',
        error: error.message
      });
    }
  }

  /**
   * Get audit history for seasonality data
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

      const history = await seasonalityService.getAuditHistory(projectId);
      
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
   * Get audit statistics for seasonality data
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

      const stats = await seasonalityService.getAuditStats(projectId);
      
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
   * Delete seasonality data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteSeasonalityData(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const deleted = await seasonalityService.deleteSeasonalityData(projectId, userId);
      
      res.json({
        success: true,
        data: { deleted },
        message: deleted 
          ? 'Seasonality data deleted successfully' 
          : 'No seasonality data found to delete'
      });
    } catch (error) {
      logger.error('Error in deleteSeasonalityData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete seasonality data',
        error: error.message
      });
    }
  }
}

module.exports = new SeasonalityController(); 