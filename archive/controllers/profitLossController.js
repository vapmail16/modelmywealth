const profitLossService = require('../services/profitLossService');
const auditService = require('../services/auditService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

class ProfitLossController {
  async getProfitLossData(req, res) {
    const projectId = req.params.projectId;
    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
      const profitLossData = await profitLossService.getProfitLossData(projectId);
      if (!profitLossData) {
        return res.status(404).json({ 
          success: false, 
          message: 'Profit & Loss data not found for this project.' 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: profitLossData, 
        message: 'Profit & Loss data retrieved successfully' 
      });
    } catch (error) {
      logger.error('Error getting profit loss data', { 
        projectId, 
        userId: req.user?.id, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to retrieve Profit & Loss data' 
      });
    }
  }

  async saveProfitLossData(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user?.id;
    const { change_reason, ...profitLossData } = req.body;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }

    try {
      // Calculate derived fields if needed
      const dataWithCalculations = profitLossService.calculateDerivedFields(profitLossData);
      
      const { data, audit } = await profitLossService.saveProfitLossData(
        projectId, 
        dataWithCalculations, 
        userId, 
        change_reason
      );

      res.status(200).json({ 
        success: true, 
        data, 
        message: audit.changesDetected ? 'Profit & Loss data saved successfully' : 'No changes detected', 
        audit 
      });
    } catch (error) {
      logger.error('Error saving profit loss data', { 
        projectId, 
        userId, 
        requestBody: req.body, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to save Profit & Loss data' 
      });
    }
  }

  async updateProfitLossData(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user?.id;
    const { change_reason, ...updates } = req.body;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }

    try {
      // For PATCH requests, we do partial updates without calculations
      const { data, audit } = await profitLossService.saveProfitLossData(
        projectId, 
        updates, 
        userId, 
        change_reason || 'Partial update via API'
      );

      res.status(200).json({ 
        success: true, 
        data, 
        message: audit.changesDetected ? 'Profit & Loss data updated successfully' : 'No changes detected', 
        audit 
      });
    } catch (error) {
      logger.error('Error updating profit loss data', { 
        projectId, 
        userId, 
        updates, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to update Profit & Loss data' 
      });
    }
  }

  async getAuditHistory(req, res) {
    const projectId = req.params.projectId;
    const limit = parseInt(req.query.limit) || 50;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
      const auditHistory = await profitLossService.getAuditHistory(projectId, limit);
      res.status(200).json({ 
        success: true, 
        data: auditHistory, 
        message: 'Audit history retrieved successfully' 
      });
    } catch (error) {
      logger.error('Error getting profit loss audit history', { 
        projectId, 
        userId: req.user?.id, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to retrieve audit history' 
      });
    }
  }

  async getAuditStats(req, res) {
    const projectId = req.params.projectId;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    try {
      const stats = await auditService.getAuditStats('profit_loss_data', projectId);
      res.status(200).json({ 
        success: true, 
        data: stats, 
        message: 'Audit statistics retrieved successfully' 
      });
    } catch (error) {
      logger.error('Error getting profit loss audit stats', { 
        projectId, 
        userId: req.user?.id, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to retrieve audit statistics' 
      });
    }
  }

  async deleteProfitLossData(req, res) {
    const projectId = req.params.projectId;
    const userId = req.user?.id;
    const { change_reason } = req.body;

    if (!projectId || !isValidUUID(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found' });
    }

    try {
      const { data, audit } = await profitLossService.deleteProfitLossData(
        projectId, 
        userId, 
        change_reason || 'Deleted via API'
      );

      if (!data) {
        return res.status(404).json({ 
          success: false, 
          message: 'No Profit & Loss data found to delete' 
        });
      }

      res.status(200).json({ 
        success: true, 
        data, 
        message: 'Profit & Loss data deleted successfully', 
        audit 
      });
    } catch (error) {
      logger.error('Error deleting profit loss data', { 
        projectId, 
        userId, 
        error: error.message, 
        stack: error.stack 
      });
      res.status(500).json({ 
        success: false, 
        error: 'Internal server error', 
        message: 'Failed to delete Profit & Loss data' 
      });
    }
  }
}

module.exports = new ProfitLossController();