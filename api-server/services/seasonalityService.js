const seasonalityRepository = require('../repositories/seasonalityRepository');
const auditService = require('../services/auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class SeasonalityService {
  /**
   * Get seasonality data for a project
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Seasonality data
   */
  async getSeasonalityData(projectId) {
    try {
      const data = await seasonalityRepository.getByProjectId(projectId);
      return data;
    } catch (error) {
      logger.error(`Error getting seasonality data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Save seasonality data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Seasonality data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved seasonality data with audit info
   */
  async saveSeasonalityData(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      // Get existing data for change detection
      const existingData = await seasonalityRepository.getByProjectId(projectId);
      
      // Calculate derived fields
      const processedData = this.calculateDerivedFields(data);
      
      // Detect changes
      const changes = this.detectChanges(existingData, processedData);
      
      // Save data
      const savedData = await seasonalityRepository.upsert(projectId, processedData, userId, changeReason);
      
      // Log audit trail if changes detected
      if (changes.changesDetected) {
        await auditService.logChange({
          table_name: 'seasonality_data',
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
      logger.error(`Error saving seasonality data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields of seasonality data
   * @param {string} projectId - Project UUID
   * @param {Object} fieldUpdates - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated seasonality data
   */
  async updateSeasonalityFields(projectId, fieldUpdates, userId, changeReason = 'Field update') {
    try {
      // Get existing data for change detection
      const existingData = await seasonalityRepository.getByProjectId(projectId);
      
      if (!existingData) {
        throw new Error('Seasonality data not found for project');
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
      const updatedData = await seasonalityRepository.partialUpdate(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason
      );
      
      // Log audit trail
      await auditService.logChange({
        table_name: 'seasonality_data',
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
      logger.error(`Error updating seasonality fields for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for seasonality data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const history = await seasonalityRepository.getAuditHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Error getting audit history for seasonality project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics for seasonality data
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
      logger.error(`Error getting audit stats for seasonality project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete seasonality data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async deleteSeasonalityData(projectId, userId) {
    try {
      const existingData = await seasonalityRepository.getByProjectId(projectId);
      
      if (!existingData) {
        return false;
      }
      
      const deleted = await seasonalityRepository.delete(projectId, userId);
      
      if (deleted) {
        await auditService.logChange({
          table_name: 'seasonality_data',
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
      logger.error(`Error deleting seasonality data for project ${projectId}:`, error);
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
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december',
      'seasonal_working_capital', 'seasonality_pattern'
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
    // Calculate total seasonality percentage if all months are provided
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december'];
    
    let totalPercentage = 0;
    let validMonths = 0;
    
    months.forEach(month => {
      if (data[month] !== undefined && data[month] !== null && data[month] !== '') {
        const percentage = parseFloat(data[month]);
        if (!isNaN(percentage)) {
          totalPercentage += percentage;
          validMonths++;
        }
      }
    });
    
    // If we have all 12 months, validate total is close to 100%
    if (validMonths === 12 && Math.abs(totalPercentage - 100) > 1) {
      logger.warn(`Seasonality percentages sum to ${totalPercentage}%, expected close to 100%`);
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

module.exports = new SeasonalityService(); 