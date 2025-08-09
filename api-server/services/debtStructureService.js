const debtStructureRepository = require('../repositories/debtStructureRepository');
const auditService = require('../services/auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class DebtStructureService {
  /**
   * Get debt structure data for a project
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Debt structure data
   */
  async getDebtStructureData(projectId) {
    try {
      const data = await debtStructureRepository.getByProjectId(projectId);
      return data;
    } catch (error) {
      logger.error(`Error getting debt structure data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Save debt structure data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Debt structure data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved debt structure data with audit info
   */
  async saveDebtStructureData(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      // Get existing data for change detection
      const existingData = await debtStructureRepository.getByProjectId(projectId);
      
      // Calculate derived fields
      const processedData = this.calculateDerivedFields(data);
      
      // Detect changes
      const changes = this.detectChanges(existingData, processedData);
      
      // Save data
      const savedData = await debtStructureRepository.upsert(projectId, processedData, userId, changeReason);
      
      // Log audit trail if changes detected
      if (changes.changesDetected) {
        await auditService.logChange({
          table_name: 'debt_structure_data',
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
      logger.error(`Error saving debt structure data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields of debt structure data
   * @param {string} projectId - Project UUID
   * @param {Object} fieldUpdates - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated debt structure data
   */
  async updateDebtStructureFields(projectId, fieldUpdates, userId, changeReason = 'Field update') {
    try {
      // Get existing data for change detection
      const existingData = await debtStructureRepository.getByProjectId(projectId);
      
      if (!existingData) {
        throw new Error('Debt structure data not found for project');
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
      const updatedData = await debtStructureRepository.partialUpdate(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason
      );
      
      // Log audit trail
      await auditService.logChange({
        table_name: 'debt_structure_data',
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
      logger.error(`Error updating debt structure fields for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for debt structure data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const history = await debtStructureRepository.getAuditHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Error getting audit history for debt structure project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics for debt structure data
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
      logger.error(`Error getting audit stats for debt structure project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete debt structure data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async deleteDebtStructureData(projectId, userId) {
    try {
      const existingData = await debtStructureRepository.getByProjectId(projectId);
      
      if (!existingData) {
        return false;
      }
      
      const deleted = await debtStructureRepository.delete(projectId, userId);
      
      if (deleted) {
        await auditService.logChange({
          table_name: 'debt_structure_data',
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
      logger.error(`Error deleting debt structure data for project ${projectId}:`, error);
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
      'total_debt', 'interest_rate', 'additional_loan_senior_secured', 'bank_base_rate_senior_secured',
      'liquidity_premiums_senior_secured', 'credit_risk_premiums_senior_secured', 'maturity_y_senior_secured',
      'amortization_y_senior_secured', 'additional_loan_short_term', 'bank_base_rate_short_term',
      'liquidity_premiums_short_term', 'credit_risk_premiums_short_term', 'maturity_y_short_term',
      'amortization_y_short_term'
    ];

    const stringFields = [
      'payment_frequency', 'senior_secured_loan_type', 'short_term_loan_type', 'maturity_date'
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

    // Check string fields
    stringFields.forEach(field => {
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

module.exports = new DebtStructureService(); 