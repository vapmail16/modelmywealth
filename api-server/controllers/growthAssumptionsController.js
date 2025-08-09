const growthAssumptionsService = require('../services/growthAssumptionsService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

// Utility function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

class GrowthAssumptionsController {
  /**
   * Get growth assumptions data for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getGrowthAssumptionsData(req, res) {
    try {
      const { projectId } = req.params;
      
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const data = await growthAssumptionsService.getGrowthAssumptionsData(projectId);
      
      res.json({
        success: true,
        data: data,
        message: data ? 'Growth assumptions data retrieved successfully' : 'No growth assumptions data found'
      });
    } catch (error) {
      logger.error('Error in getGrowthAssumptionsData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve growth assumptions data',
        error: error.message
      });
    }
  }

  /**
   * Save growth assumptions data (create or update)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveGrowthAssumptionsData(req, res) {
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

      const result = await growthAssumptionsService.saveGrowthAssumptionsData(
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
          ? 'Growth assumptions data created successfully'
          : 'Growth assumptions data updated successfully'
      });
    } catch (error) {
      logger.error('Error in saveGrowthAssumptionsData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save growth assumptions data',
        error: error.message
      });
    }
  }

  /**
   * Update specific fields of growth assumptions data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateGrowthAssumptionsFields(req, res) {
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

      const result = await growthAssumptionsService.updateGrowthAssumptionsFields(
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
          ? 'Growth assumptions fields updated successfully'
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateGrowthAssumptionsFields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update growth assumptions fields',
        error: error.message
      });
    }
  }

  /**
   * Get audit history for growth assumptions data
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

      const history = await growthAssumptionsService.getAuditHistory(projectId);
      
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
   * Get audit statistics for growth assumptions data
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

      const stats = await growthAssumptionsService.getAuditStats(projectId);
      
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
   * Delete growth assumptions data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteGrowthAssumptionsData(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;

      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid project ID is required'
        });
      }

      const deleted = await growthAssumptionsService.deleteGrowthAssumptionsData(projectId, userId);
      
      res.json({
        success: true,
        data: { deleted },
        message: deleted 
          ? 'Growth assumptions data deleted successfully' 
          : 'No growth assumptions data found to delete'
      });
    } catch (error) {
      logger.error('Error in deleteGrowthAssumptionsData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete growth assumptions data',
        error: error.message
      });
    }
  }
}

module.exports = new GrowthAssumptionsController(); 