const growthAssumptionsRepository = require('../repositories/growthAssumptionsRepository');
const auditService = require('../services/auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class GrowthAssumptionsService {
  /**
   * Get growth assumptions data for a project
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Growth assumptions data
   */
  async getGrowthAssumptionsData(projectId) {
    try {
      const data = await growthAssumptionsRepository.getByProjectId(projectId);
      return data;
    } catch (error) {
      logger.error(`Error getting growth assumptions data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Save growth assumptions data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Growth assumptions data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved growth assumptions data with audit info
   */
  async saveGrowthAssumptionsData(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      // Get existing data for change detection
      const existingData = await growthAssumptionsRepository.getByProjectId(projectId);
      
      // Calculate derived fields
      const processedData = this.calculateDerivedFields(data);
      
      // Detect changes
      const changes = this.detectChanges(existingData, processedData);
      
      // Save data
      const savedData = await growthAssumptionsRepository.upsert(projectId, processedData, userId, changeReason);
      
      // Log audit trail if changes detected
      if (changes.changesDetected) {
        await auditService.logChange({
          table_name: 'growth_assumptions_data',
          record_id: savedData.id,
          action: existingData ? 'UPDATE' : 'INSERT',
          old_values: existingData || {},
          new_values: savedData,
          changed_fields: changes.changedFields,
          change_reason: changeReason,
          user_id: userId,
          ip_address: null // Will be passed from controller
        });
      }
      
      return {
        ...savedData,
        audit: {
          changesDetected: changes.changesDetected,
          changedFields: changes.changedFields,
          version: savedData.version,
          isNewRecord: !existingData
        }
      };
    } catch (error) {
      logger.error(`Error saving growth assumptions data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields of growth assumptions data
   * @param {string} projectId - Project UUID
   * @param {Object} fieldUpdates - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated growth assumptions data
   */
  async updateGrowthAssumptionsFields(projectId, fieldUpdates, userId, changeReason = 'Field update') {
    try {
      // Get existing data for change detection
      const existingData = await growthAssumptionsRepository.getByProjectId(projectId);
      
      if (!existingData) {
        throw new Error('Growth assumptions data not found for project');
      }
      
      // Detect changes
      const changes = this.detectChanges(existingData, fieldUpdates);
      
      if (!changes.changesDetected) {
        return {
          ...existingData,
          audit: {
            changesDetected: false,
            changedFields: [],
            version: existingData.version,
            isNewRecord: false
          }
        };
      }
      
      // Update data
      const updatedData = await growthAssumptionsRepository.partialUpdate(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason
      );
      
      // Log audit trail
      await auditService.logChange({
        table_name: 'growth_assumptions_data',
        record_id: updatedData.id,
        action: 'UPDATE',
        old_values: existingData,
        new_values: updatedData,
        changed_fields: changes.changedFields,
        change_reason: changeReason,
        user_id: userId,
        ip_address: null // Will be passed from controller
      });
      
      return {
        ...updatedData,
        audit: {
          changesDetected: true,
          changedFields: changes.changedFields,
          version: updatedData.version,
          isNewRecord: false
        }
      };
    } catch (error) {
      logger.error(`Error updating growth assumptions fields for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for growth assumptions data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const history = await growthAssumptionsRepository.getAuditHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Error getting audit history for growth assumptions project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics for growth assumptions data
   * @param {string} projectId - Project UUID
   * @returns {Object} Audit statistics
   */
  async getAuditStats(projectId) {
    try {
      const history = await this.getAuditHistory(projectId);
      
      const stats = {
        totalChanges: history.length,
        lastModified: history.length > 0 ? history[0].created_at : null,
        changeTypes: {
          INSERT: history.filter(h => h.action === 'INSERT').length,
          UPDATE: history.filter(h => h.action === 'UPDATE').length,
          DELETE: history.filter(h => h.action === 'DELETE').length
        },
        mostChangedFields: this.getMostChangedFields(history)
      };
      
      return stats;
    } catch (error) {
      logger.error(`Error getting audit stats for growth assumptions project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete growth assumptions data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async deleteGrowthAssumptionsData(projectId, userId) {
    try {
      const existingData = await growthAssumptionsRepository.getByProjectId(projectId);
      
      if (!existingData) {
        return false;
      }
      
      const deleted = await growthAssumptionsRepository.delete(projectId, userId);
      
      if (deleted) {
        await auditService.logChange({
          table_name: 'growth_assumptions_data',
          record_id: existingData.id,
          action: 'DELETE',
          old_values: existingData,
          new_values: {},
          changed_fields: Object.keys(existingData),
          change_reason: 'Data deletion',
          user_id: userId,
          ip_address: null
        });
      }
      
      return deleted;
    } catch (error) {
      logger.error(`Error deleting growth assumptions data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Detect changes between old and new data
   * @param {Object} oldData - Existing data
   * @param {Object} newData - New data
   * @returns {Object} Change detection result
   */
  detectChanges(oldData, newData) {
    if (!oldData) {
      return { changesDetected: true, changedFields: Object.keys(newData) };
    }

    const changedFields = [];
    const numericFields = [
      'gr_revenue_1', 'gr_revenue_2', 'gr_revenue_3', 'gr_revenue_4', 'gr_revenue_5',
      'gr_revenue_6', 'gr_revenue_7', 'gr_revenue_8', 'gr_revenue_9', 'gr_revenue_10', 'gr_revenue_11', 'gr_revenue_12',
      'gr_cost_1', 'gr_cost_2', 'gr_cost_3', 'gr_cost_4', 'gr_cost_5',
      'gr_cost_6', 'gr_cost_7', 'gr_cost_8', 'gr_cost_9', 'gr_cost_10', 'gr_cost_11', 'gr_cost_12',
      'gr_cost_oper_1', 'gr_cost_oper_2', 'gr_cost_oper_3', 'gr_cost_oper_4', 'gr_cost_oper_5',
      'gr_cost_oper_6', 'gr_cost_oper_7', 'gr_cost_oper_8', 'gr_cost_oper_9', 'gr_cost_oper_10', 'gr_cost_oper_11', 'gr_cost_oper_12',
      'gr_capex_1', 'gr_capex_2', 'gr_capex_3', 'gr_capex_4', 'gr_capex_5',
      'gr_capex_6', 'gr_capex_7', 'gr_capex_8', 'gr_capex_9', 'gr_capex_10', 'gr_capex_11', 'gr_capex_12'
    ];

    // Check numeric fields
    numericFields.forEach(field => {
      if (newData.hasOwnProperty(field) && newData[field] !== undefined) {
        const oldValue = oldData[field];
        const newValue = newData[field];
        if (this.valuesAreDifferent(oldValue, newValue)) {
          changedFields.push(field);
        }
      }
    });

    return { changesDetected: changedFields.length > 0, changedFields };
  }

  /**
   * Compare values accounting for type differences
   * @param {*} currentValue - Current value
   * @param {*} newValue - New value
   * @returns {boolean} True if values are different
   */
  valuesAreDifferent(currentValue, newValue) {
    // Handle null/undefined/empty string equivalencies
    if (currentValue === null && (newValue === undefined || newValue === '')) return false;
    if (currentValue === undefined && (newValue === null || newValue === '')) return false;
    if ((currentValue === null || currentValue === undefined) && newValue === '') return false;
    if ((newValue === null || newValue === undefined) && currentValue === '') return false;
    
    // Handle string-to-number conversions
    if (typeof currentValue === 'number' && typeof newValue === 'string') {
      return currentValue !== parseInt(newValue) && currentValue !== parseFloat(newValue);
    }
    if (typeof newValue === 'number' && typeof currentValue === 'string') {
      return newValue !== parseInt(currentValue) && newValue !== parseFloat(currentValue);
    }
    
    return currentValue !== newValue;
  }

  /**
   * Calculate derived fields
   * @param {Object} data - Raw data
   * @returns {Object} Data with derived fields
   */
  calculateDerivedFields(data) {
    // Add any calculated fields here if needed
    return data;
  }

  /**
   * Get most changed fields from audit history
   * @param {Array} history - Audit history
   * @returns {Object} Field change statistics
   */
  getMostChangedFields(history) {
    const fieldCounts = {};
    
    history.forEach(entry => {
      if (entry.changed_fields) {
        entry.changed_fields.forEach(field => {
          fieldCounts[field] = (fieldCounts[field] || 0) + 1;
        });
      }
    });
    
    return fieldCounts;
  }
}

module.exports = new GrowthAssumptionsService(); 