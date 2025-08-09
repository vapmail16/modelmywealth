const debtStructureService = require('../services/debtStructureService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

class DebtStructureController {
  /**
   * Get debt structure data for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDebtStructureData(req, res) {
    try {
      const { projectId } = req.params;
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      const data = await debtStructureService.getDebtStructureData(projectId);
      
      res.json({
        success: true,
        data: data,
        message: data ? 'Debt structure data retrieved successfully' : 'No debt structure data found'
      });
    } catch (error) {
      logger.error('Error in getDebtStructureData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve debt structure data'
      });
    }
  }

  /**
   * Save debt structure data (create or update)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveDebtStructureData(req, res) {
    try {
      const { projectId } = req.params;
      const data = req.body;
      const userId = req.user.id;
      const changeReason = req.body.change_reason || 'Data entry update';
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      // Validate required data
      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Missing data',
          message: 'Debt structure data is required'
        });
      }
      
      // Remove change_reason from data object to avoid conflicts
      const { change_reason, ...debtStructureData } = data;
      
      const result = await debtStructureService.saveDebtStructureData(
        projectId,
        debtStructureData,
        userId,
        changeReason
      );
      
      res.json({
        success: true,
        data: result,
        audit: result.audit,
        message: result.audit.isNewRecord 
          ? 'Debt structure data created successfully' 
          : 'Debt structure data updated successfully'
      });
    } catch (error) {
      logger.error('Error in saveDebtStructureData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to save debt structure data'
      });
    }
  }

  /**
   * Update specific fields of debt structure data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateDebtStructureFields(req, res) {
    try {
      const { projectId } = req.params;
      const fieldUpdates = req.body;
      const userId = req.user.id;
      const changeReason = req.body.change_reason || 'Field update';
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      // Validate field updates
      if (!fieldUpdates || Object.keys(fieldUpdates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Missing field updates',
          message: 'At least one field must be provided for update'
        });
      }
      
      // Remove change_reason from fieldUpdates to avoid conflicts
      const { change_reason, ...updates } = fieldUpdates;
      
      const result = await debtStructureService.updateDebtStructureFields(
        projectId,
        updates,
        userId,
        changeReason
      );
      
      res.json({
        success: true,
        data: result,
        audit: result.audit,
        message: result.audit.changesDetected 
          ? 'Debt structure fields updated successfully' 
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateDebtStructureFields:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update debt structure fields'
      });
    }
  }

  /**
   * Get audit history for debt structure data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAuditHistory(req, res) {
    try {
      const { projectId } = req.params;
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      const history = await debtStructureService.getAuditHistory(projectId);
      
      res.json({
        success: true,
        data: history,
        message: 'Audit history retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAuditHistory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve audit history'
      });
    }
  }

  /**
   * Get audit statistics for debt structure data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAuditStats(req, res) {
    try {
      const { projectId } = req.params;
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      const stats = await debtStructureService.getAuditStats(projectId);
      
      res.json({
        success: true,
        data: stats,
        message: 'Audit statistics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAuditStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve audit statistics'
      });
    }
  }

  /**
   * Delete debt structure data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteDebtStructureData(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user.id;
      
      // Validate project ID
      if (!isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format',
          message: 'Project ID must be a valid UUID'
        });
      }
      
      const deleted = await debtStructureService.deleteDebtStructureData(projectId, userId);
      
      if (deleted) {
        res.json({
          success: true,
          message: 'Debt structure data deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Debt structure data not found'
        });
      }
    } catch (error) {
      logger.error('Error in deleteDebtStructureData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete debt structure data'
      });
    }
  }
}

module.exports = new DebtStructureController(); 