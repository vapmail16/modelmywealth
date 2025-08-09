const cashFlowService = require('../services/cashFlowService');
const { logger } = require('../services/logger');

class CashFlowController {
  async getCashFlowData(req, res) {
    try {
      const projectId = req.params.projectId;
      const data = await cashFlowService.getCashFlowData(projectId);
      
      res.json({
        success: true,
        data,
        message: 'Cash flow data retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getCashFlowData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get cash flow data',
        error: error.message
      });
    }
  }

  async saveCashFlowData(req, res) {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
      const { data, changeReason } = req.body;

      // Calculate derived fields
      const enrichedData = cashFlowService.calculateDerivedFields(data);

      const result = await cashFlowService.saveCashFlowData(
        projectId,
        enrichedData,
        userId,
        changeReason
      );

      res.json({
        success: true,
        data: result.data,
        audit: result.audit,
        message: result.audit.changesDetected 
          ? 'Cash flow data updated successfully'
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in saveCashFlowData:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save cash flow data',
        error: error.message
      });
    }
  }

  async updateCashFlowFields(req, res) {
    try {
      const projectId = req.params.projectId;
      const userId = req.user.id;
      const { fieldUpdates, changeReason } = req.body;

      // If the updates include fields that affect derived fields, recalculate them
      const enrichedUpdates = cashFlowService.calculateDerivedFields({
        ...await cashFlowService.getCashFlowData(projectId),
        ...fieldUpdates
      });

      // Only update the fields that were actually changed
      const finalUpdates = {};
      Object.keys(fieldUpdates).forEach(key => {
        finalUpdates[key] = enrichedUpdates[key];
      });

      const result = await cashFlowService.updateCashFlowFields(
        projectId,
        finalUpdates,
        userId,
        changeReason
      );

      res.json({
        success: true,
        data: result.data,
        audit: result.audit,
        message: result.audit.changesDetected 
          ? 'Cash flow fields updated successfully'
          : 'No changes detected'
      });
    } catch (error) {
      logger.error('Error in updateCashFlowFields:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update cash flow fields',
        error: error.message
      });
    }
  }

  async getAuditHistory(req, res) {
    try {
      const projectId = req.params.projectId;
      const auditHistory = await cashFlowService.getAuditHistory(projectId);

      res.json({
        success: true,
        data: auditHistory,
        message: `Retrieved ${auditHistory.length} audit entries`
      });
    } catch (error) {
      logger.error('Error in getAuditHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get audit history',
        error: error.message
      });
    }
  }

  async getAuditStats(req, res) {
    try {
      const projectId = req.params.projectId;
      const auditHistory = await cashFlowService.getAuditHistory(projectId);

      // Calculate statistics
      const stats = {
        totalChanges: auditHistory.length,
        lastModified: auditHistory[0]?.created_at,
        changeTypes: {
          INSERT: 0,
          UPDATE: 0,
          DELETE: 0
        },
        mostChangedFields: {}
      };

      auditHistory.forEach(entry => {
        // Count change types
        stats.changeTypes[entry.action] = (stats.changeTypes[entry.action] || 0) + 1;

        // Count changed fields
        if (entry.changed_fields) {
          entry.changed_fields.forEach(field => {
            stats.mostChangedFields[field] = (stats.mostChangedFields[field] || 0) + 1;
          });
        }
      });

      res.json({
        success: true,
        data: stats,
        message: 'Audit statistics retrieved successfully'
      });
    } catch (error) {
      logger.error('Error in getAuditStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get audit statistics',
        error: error.message
      });
    }
  }
}

module.exports = new CashFlowController();