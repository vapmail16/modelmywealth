const workingCapitalRepository = require('../repositories/workingCapitalRepository');
const auditService = require('../services/auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class WorkingCapitalService {
  /**
   * Get working capital data for a project
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Working capital data
   */
  async getWorkingCapitalData(projectId) {
    try {
      const data = await workingCapitalRepository.getByProjectId(projectId);
      return data;
    } catch (error) {
      logger.error(`Error getting working capital data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Save working capital data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Working capital data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved working capital data with audit info
   */
  async saveWorkingCapitalData(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      // Get existing data for change detection
      const existingData = await workingCapitalRepository.getByProjectId(projectId);
      
      // Calculate derived fields
      const processedData = this.calculateDerivedFields(data);
      
      // Detect changes
      const changes = this.detectChanges(existingData, processedData);
      
      // Save data
      const savedData = await workingCapitalRepository.upsert(projectId, processedData, userId, changeReason);
      
      // Log audit trail if changes detected
      if (changes.changesDetected) {
        await auditService.logChange({
          table_name: 'working_capital_data',
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
      logger.error(`Error saving working capital data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields of working capital data
   * @param {string} projectId - Project UUID
   * @param {Object} fieldUpdates - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated working capital data
   */
  async updateWorkingCapitalFields(projectId, fieldUpdates, userId, changeReason = 'Field update') {
    try {
      // Get existing data for change detection
      const existingData = await workingCapitalRepository.getByProjectId(projectId);
      
      if (!existingData) {
        throw new Error('Working capital data not found for project');
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
      const updatedData = await workingCapitalRepository.partialUpdate(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason
      );
      
      // Log audit trail
      await auditService.logChange({
        table_name: 'working_capital_data',
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
      logger.error(`Error updating working capital fields for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for working capital data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const history = await workingCapitalRepository.getAuditHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Error getting audit history for working capital project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics for working capital data
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
      logger.error(`Error getting audit stats for working capital project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete working capital data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async deleteWorkingCapitalData(projectId, userId) {
    try {
      const existingData = await workingCapitalRepository.getByProjectId(projectId);
      
      if (!existingData) {
        return false;
      }
      
      const deleted = await workingCapitalRepository.delete(projectId, userId);
      
      if (deleted) {
        await auditService.logChange({
          table_name: 'working_capital_data',
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
      logger.error(`Error deleting working capital data for project ${projectId}:`, error);
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
    const allFields = [
      'days_receivables', 'days_inventory', 'days_payables', 'cash_cycle',
      'account_receivable_percent', 'inventory_percent', 'other_current_assets_percent', 'accounts_payable_percent'
    ];

    // Check all fields
    allFields.forEach(field => {
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
    // Calculate cash cycle if not provided
    if (data.days_receivables !== undefined && data.days_inventory !== undefined && data.days_payables !== undefined) {
      const daysReceivables = parseFloat(data.days_receivables) || 0;
      const daysInventory = parseFloat(data.days_inventory) || 0;
      const daysPayables = parseFloat(data.days_payables) || 0;
      
      data.cash_cycle = daysReceivables + daysInventory - daysPayables;
    }
    
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

module.exports = new WorkingCapitalService(); 