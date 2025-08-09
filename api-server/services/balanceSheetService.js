const balanceSheetRepository = require('../repositories/balanceSheetRepository');
const auditService = require('./auditService');
const logger = require('./logger').logger;

class BalanceSheetService {
  /**
   * Get balance sheet data for a project
   * @param {string} projectId - Project UUID
   * @returns {Object} Balance sheet data
   */
  async getBalanceSheetData(projectId) {
    try {
      const data = await balanceSheetRepository.getByProjectId(projectId);
      return data;
    } catch (error) {
      logger.error(`Error getting balance sheet data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Save balance sheet data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Balance sheet data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved balance sheet data with audit info
   */
  async saveBalanceSheetData(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      // Get existing data for change detection
      const existingData = await balanceSheetRepository.getByProjectId(projectId);
      
      // Detect changes
      const changes = this.detectChanges(existingData, data);
      
      // Save data
      const savedData = await balanceSheetRepository.upsert(projectId, data, userId, changeReason);
      
      // Log audit trail if changes detected
      if (changes.changesDetected) {
        await auditService.logChange({
          table_name: 'balance_sheet_data',
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
      logger.error(`Error saving balance sheet data for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Update specific fields of balance sheet data
   * @param {string} projectId - Project UUID
   * @param {Object} fieldUpdates - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated balance sheet data
   */
  async updateBalanceSheetFields(projectId, fieldUpdates, userId, changeReason = 'Field update') {
    try {
      // Get existing data for change detection
      const existingData = await balanceSheetRepository.getByProjectId(projectId);
      
      if (!existingData) {
        throw new Error('Balance sheet data not found for project');
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
      const updatedData = await balanceSheetRepository.partialUpdate(
        projectId, 
        fieldUpdates, 
        userId, 
        changeReason
      );
      
      // Log audit trail
      await auditService.logChange({
        table_name: 'balance_sheet_data',
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
      logger.error(`Error updating balance sheet fields for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit history for balance sheet data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const history = await balanceSheetRepository.getAuditHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Error getting audit history for balance sheet project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get audit statistics for balance sheet data
   * @param {string} projectId - Project UUID
   * @returns {Object} Audit statistics
   */
  async getAuditStats(projectId) {
    try {
      const stats = await auditService.getAuditStats('balance_sheet_data', projectId);
      return stats;
    } catch (error) {
      logger.error(`Error getting audit stats for balance sheet project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Delete balance sheet data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User making the deletion
   * @returns {boolean} Success status
   */
  async deleteBalanceSheetData(projectId, userId) {
    try {
      const existingData = await balanceSheetRepository.getByProjectId(projectId);
      
      if (!existingData) {
        return false;
      }
      
      // Log audit trail before deletion
      await auditService.logChange({
        table_name: 'balance_sheet_data',
        record_id: existingData.id,
        action: 'DELETE',
        old_values: existingData,
        new_values: {},
        changed_fields: Object.keys(existingData),
        change_reason: 'Data deletion',
        user_id: userId,
        ip_address: null // Will be passed from controller
      });
      
      // Delete data
      const deleted = await balanceSheetRepository.delete(projectId, userId);
      return deleted;
    } catch (error) {
      logger.error(`Error deleting balance sheet data for project ${projectId}:`, error);
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
      return {
        changesDetected: true,
        changedFields: Object.keys(newData).filter(key => 
          newData[key] !== undefined && newData[key] !== null
        )
      };
    }

    const changedFields = [];
    const numericFields = [
      'cash', 'accounts_receivable', 'inventory', 'prepaid_expenses', 'other_current_assets',
      'total_current_assets', 'ppe', 'intangible_assets', 'goodwill', 'other_assets',
      'total_assets', 'accounts_payable', 'accrued_expenses', 'short_term_debt',
      'other_current_liabilities', 'total_current_liabilities', 'long_term_debt',
      'other_liabilities', 'total_liabilities', 'common_stock', 'retained_earnings',
      'other_equity', 'total_equity', 'total_liabilities_equity',
      'capital_expenditure_additions', 'asset_depreciated_over_years'
    ];

    for (const field of numericFields) {
      if (newData.hasOwnProperty(field) && newData[field] !== undefined) {
        const oldValue = oldData[field];
        const newValue = newData[field];
        
        // Use proper value comparison that handles type conversions
        if (this.valuesAreDifferent(oldValue, newValue)) {
          changedFields.push(field);
        }
      }
    }

    return {
      changesDetected: changedFields.length > 0,
      changedFields
    };
  }

  /**
   * Compare two values considering null/undefined and type conversions
   * @param {any} currentValue - Current value from database
   * @param {any} newValue - New value from user input
   * @returns {boolean} True if values are different
   */
  valuesAreDifferent(currentValue, newValue) {
    // Handle null/undefined cases
    if (currentValue === null && (newValue === undefined || newValue === '')) {
      return false;
    }
    if (currentValue === undefined && (newValue === null || newValue === '')) {
      return false;
    }
    if ((currentValue === null || currentValue === undefined) && newValue === '') {
      return false;
    }
    if ((newValue === null || newValue === undefined) && currentValue === '') {
      return false;
    }
    
    // Handle number conversions
    if (typeof currentValue === 'number' && typeof newValue === 'string') {
      return currentValue !== parseInt(newValue) && currentValue !== parseFloat(newValue);
    }
    if (typeof newValue === 'number' && typeof currentValue === 'string') {
      return newValue !== parseInt(currentValue) && newValue !== parseFloat(currentValue);
    }
    
    // Direct comparison
    return currentValue !== newValue;
  }

  /**
   * Calculate derived fields for balance sheet
   * @param {Object} data - Balance sheet data
   * @returns {Object} Data with calculated fields
   */
  calculateDerivedFields(data) {
    const calculated = { ...data };
    
    // Calculate total current assets
    const currentAssets = [
      data.cash || 0,
      data.accounts_receivable || 0,
      data.inventory || 0,
      data.prepaid_expenses || 0,
      data.other_current_assets || 0
    ];
    calculated.total_current_assets = currentAssets.reduce((sum, val) => sum + val, 0);
    
    // Calculate total assets
    const allAssets = [
      calculated.total_current_assets,
      data.ppe || 0,
      data.intangible_assets || 0,
      data.goodwill || 0,
      data.other_assets || 0
    ];
    calculated.total_assets = allAssets.reduce((sum, val) => sum + val, 0);
    
    // Calculate total current liabilities
    const currentLiabilities = [
      data.accounts_payable || 0,
      data.accrued_expenses || 0,
      data.short_term_debt || 0,
      data.other_current_liabilities || 0
    ];
    calculated.total_current_liabilities = currentLiabilities.reduce((sum, val) => sum + val, 0);
    
    // Calculate total liabilities
    const allLiabilities = [
      calculated.total_current_liabilities,
      data.long_term_debt || 0,
      data.other_liabilities || 0
    ];
    calculated.total_liabilities = allLiabilities.reduce((sum, val) => sum + val, 0);
    
    // Calculate total equity
    const equityComponents = [
      data.common_stock || 0,
      data.retained_earnings || 0,
      data.other_equity || 0
    ];
    calculated.total_equity = equityComponents.reduce((sum, val) => sum + val, 0);
    
    // Calculate total liabilities and equity
    calculated.total_liabilities_equity = (calculated.total_liabilities || 0) + (calculated.total_equity || 0);
    
    return calculated;
  }
}

module.exports = new BalanceSheetService(); 