const profitLossRepository = require('../repositories/profitLossRepository');
const auditService = require('./auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class ProfitLossService {
  async getProfitLossData(projectId) {
    return await profitLossRepository.getByProjectId(projectId);
  }

  async saveProfitLossData(projectId, newData, userId, changeReason) {
    let currentData = await profitLossRepository.getByProjectId(projectId);
    let result;
    let changesDetected = false;
    let changedFields = [];
    let isNewRecord = false;

    if (currentData) {
      // Detect changes for audit logging
      const { changes, fieldsChanged } = this.detectChanges(currentData, newData);
      changedFields = fieldsChanged;

      if (Object.keys(changes).length > 0) {
        changesDetected = true;
        result = await profitLossRepository.partialUpdate(projectId, changes, userId, changeReason);
      } else {
        result = currentData; // No actual changes, return current data
      }
    } else {
      // No existing record, create a new one
      isNewRecord = true;
      result = await profitLossRepository.create(projectId, newData, userId);
      changesDetected = true; // New record is a change
      changedFields = Object.keys(newData);
    }

    // Log audit if changes were detected or it's a new record
    if (changesDetected) {
      const oldValues = currentData ? currentData : {};
      const newValues = result ? result : newData;
      await auditService.logChange({
        user_id: userId,
        table_name: 'profit_loss_data',
        record_id: result?.id || null,
        action: isNewRecord ? 'INSERT' : 'UPDATE',
        old_values: oldValues,
        new_values: newValues,
        changed_fields: changedFields,
        change_reason: changeReason || (isNewRecord ? 'Initial creation' : 'Updated via data entry form')
      });
    }

    return {
      data: result,
      audit: {
        changesDetected,
        changedFields,
        version: result?.version,
        isNewRecord
      }
    };
  }

  async deleteProfitLossData(projectId, userId, changeReason) {
    const currentData = await profitLossRepository.getByProjectId(projectId);
    if (!currentData) {
      return { data: null, audit: { changesDetected: false } };
    }

    const result = await profitLossRepository.delete(projectId);
    
    // Log audit for deletion
    await auditService.logChange({
      user_id: userId,
      table_name: 'profit_loss_data',
      record_id: currentData.id,
      action: 'DELETE',
      old_values: currentData,
      new_values: {},
      changed_fields: Object.keys(currentData),
      change_reason: changeReason || 'Deleted via data entry form'
    });

    return {
      data: result,
      audit: {
        changesDetected: true,
        changedFields: Object.keys(currentData),
        version: currentData.version,
        isNewRecord: false
      }
    };
  }

  async getAuditHistory(projectId, limit = 50) {
    return await profitLossRepository.getAuditHistory(projectId, limit);
  }

  detectChanges(current, updated) {
    const changes = {};
    const fieldsChanged = [];
    
    // P&L specific fields to check
    const fieldsToCheck = [
      'revenue', 'cogs', 'operating_expenses', 'ebitda', 'depreciation', 
      'amortization', 'ebit', 'interest_expense', 'ebt', 'tax_rates', 
      'taxes', 'net_income'
    ];

    for (const key of fieldsToCheck) {
      if (updated[key] !== undefined) {
        // Handle numeric fields - convert to numbers for comparison
        const currentValue = current[key] !== null && current[key] !== undefined ? Number(current[key]) : 0;
        const updatedValue = updated[key] !== null && updated[key] !== undefined ? Number(updated[key]) : 0;

        if (updatedValue !== currentValue) {
          changes[key] = updated[key];
          fieldsChanged.push(key);
        }
      }
    }

    return { changes, fieldsChanged };
  }

  // Business logic: Calculate derived fields
  calculateDerivedFields(data) {
    const revenue = Number(data.revenue) || 0;
    const cogs = Number(data.cogs) || 0;
    const operating_expenses = Number(data.operating_expenses) || 0;
    const depreciation = Number(data.depreciation) || 0;
    const amortization = Number(data.amortization) || 0;
    const interest_expense = Number(data.interest_expense) || 0;
    const tax_rates = Number(data.tax_rates) || 0;

    // Calculate derived values (using standard financial formulas)
    const gross_profit = revenue - cogs;
    const ebitda = gross_profit - operating_expenses;
    const ebit = ebitda - depreciation - amortization;
    const ebt = ebit - interest_expense;
    const taxes = ebt * (tax_rates / 100);
    const net_income = ebt - taxes;

    return {
      ...data,
      // Don't overwrite if user provided explicit values
      ...(data.gross_profit === undefined && { gross_profit }),
      ...(data.ebitda === undefined && { ebitda }),
      ...(data.ebit === undefined && { ebit }),
      ...(data.ebt === undefined && { ebt }),
      ...(data.taxes === undefined && { taxes }),
      ...(data.net_income === undefined && { net_income })
    };
  }
}

module.exports = new ProfitLossService();