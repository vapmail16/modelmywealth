const balanceSheetService = require('../services/balanceSheetService');
const logger = require('../services/logger').logger;

// Utility function to validate UUID
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

class BalanceSheetController {
  /**
   * Get balance sheet data for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBalanceSheetData(req, res) {
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
      
      const data = await balanceSheetService.getBalanceSheetData(projectId);
      
      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Balance sheet data not found',
          message: 'No balance sheet data found for this project'
        });
      }
      
      res.json({
        success: true,
        data,
        message: 'Balance sheet data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getBalanceSheetData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve balance sheet data'
      });
    }
  }

  /**
   * Save balance sheet data (create or update)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async saveBalanceSheetData(req, res) {
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
      
      // Validate required fields
      if (!data) {
        return res.status(400).json({
          success: false,
          error: 'Missing data',
          message: 'Balance sheet data is required'
        });
      }
      
      // Remove change_reason from data object to avoid conflicts
      const { change_reason, ...balanceSheetData } = data;
      
      const result = await balanceSheetService.saveBalanceSheetData(
        projectId,
        balanceSheetData,
        userId,
        changeReason
      );
      
      res.json({
        success: true,
        data: result,
        audit: result.audit,
        message: result.audit.isNewRecord 
          ? 'Balance sheet data created successfully' 
          : 'Balance sheet data updated successfully'
      });
    } catch (error) {
      logger.error('Error in saveBalanceSheetData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to save balance sheet data'
      });
    }
  }

  /**
   * Update specific fields of balance sheet data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateBalanceSheetFields(req, res) {
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
      
      const result = await balanceSheetService.updateBalanceSheetFields(
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
          ? 'Balance sheet fields updated successfully' 
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateBalanceSheetFields:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update balance sheet fields'
      });
    }
  }

  /**
   * Get audit history for balance sheet data
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
      
      const history = await balanceSheetService.getAuditHistory(projectId);
      
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
   * Get audit statistics for balance sheet data
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
      
      const stats = await balanceSheetService.getAuditStats(projectId);
      
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
   * Delete balance sheet data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteBalanceSheetData(req, res) {
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
      
      const deleted = await balanceSheetService.deleteBalanceSheetData(projectId, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Balance sheet data not found',
          message: 'No balance sheet data found to delete'
        });
      }
      
      res.json({
        success: true,
        message: 'Balance sheet data deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteBalanceSheetData:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete balance sheet data'
      });
    }
  }
}

module.exports = new BalanceSheetController(); 