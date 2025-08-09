const profitLossRepository = require('../repositories/profitLossRepository');
const auditService = require('./auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class ProfitLossService {
  async getProfitLossData(projectId) {
    return await profitLossRepository.getByProjectId(projectId);
  }

  async saveProfitLossData(projectId, newData, userId, changeReason, ipAddress = null) {
    let currentData = await profitLossRepository.getByProjectId(projectId);
    let result;
    let changesDetected = false;
    let changedFields = [];
    let isNewRecord = false;

    if (currentData) {
      const { changes, fieldsChanged } = this.detectChanges(currentData, newData);
      changedFields = fieldsChanged;

      if (Object.keys(changes).length > 0) {
        changesDetected = true;
        result = await profitLossRepository.partialUpdate(projectId, changes, userId, changeReason);
      } else {
        result = currentData;
      }
    } else {
      isNewRecord = true;
      result = await profitLossRepository.create(projectId, newData, userId);
      changesDetected = true;
      changedFields = Object.keys(newData);
    }

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
        change_reason: changeReason || (isNewRecord ? 'Initial creation' : 'Updated via data entry form'),
        ip_address: ipAddress
      });
    }

    return {
      data: result,
      audit: { changesDetected, changedFields, version: result?.version, isNewRecord }
    };
  }

  detectChanges(current, updated) {
    const changes = {};
    const fieldsChanged = [];
    
    const fieldsToCheck = ['revenue', 'cogs', 'operating_expenses', 'ebitda', 'depreciation', 'amortization', 'ebit', 'interest_expense', 'ebt', 'tax_rates', 'taxes', 'net_income'];

    for (const key of fieldsToCheck) {
      if (updated[key] !== undefined) {
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

  calculateDerivedFields(data) {
    const revenue = Number(data.revenue) || 0;
    const cogs = Number(data.cogs) || 0;
    const operating_expenses = Number(data.operating_expenses) || 0;
    const depreciation = Number(data.depreciation) || 0;
    const amortization = Number(data.amortization) || 0;
    const interest_expense = Number(data.interest_expense) || 0;
    const tax_rates = Number(data.tax_rates) || 0;

    const gross_profit = revenue - cogs;
    const ebitda = gross_profit - operating_expenses;
    const ebit = ebitda - depreciation - amortization;
    const ebt = ebit - interest_expense;
    const taxes = ebt * (tax_rates / 100);
    const net_income = ebt - taxes;

    return {
      ...data,
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
