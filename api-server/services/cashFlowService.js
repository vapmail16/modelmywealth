const cashFlowRepository = require('../repositories/cashFlowRepository');
const auditService = require('./auditService');
const { logger } = require('../services/logger');

class CashFlowService {
  async getCashFlowData(projectId) {
    try {
      return await cashFlowRepository.getByProjectId(projectId);
    } catch (error) {
      logger.error('Error in getCashFlowData:', error);
      throw error;
    }
  }

  async saveCashFlowData(projectId, data, userId, changeReason) {
    try {
      const existingData = await cashFlowRepository.getByProjectId(projectId);
      const changes = this.detectChanges(existingData, data);

      if (!changes.changesDetected) {
        return {
          data: existingData,
          audit: {
            changesDetected: false,
            version: existingData?.version || 1,
            isNewRecord: false
          }
        };
      }

      const updatedData = {
        ...data,
        project_id: projectId,
        created_by: existingData ? existingData.created_by : userId,
        updated_by: userId,
        change_reason: changeReason
      };

      const result = await cashFlowRepository.upsert(updatedData);

      // Log to audit trail
      await auditService.logChange({
        table_name: 'cash_flow_data',
        record_id: result.id,
        action: existingData ? 'UPDATE' : 'INSERT',
        old_values: existingData || {},
        new_values: result,
        changed_fields: changes.changedFields,
        change_reason: changeReason,
        user_id: userId,
        ip_address: null
      });

      return {
        data: result,
        audit: {
          changesDetected: true,
          changedFields: changes.changedFields,
          version: result.version,
          isNewRecord: !existingData
        }
      };
    } catch (error) {
      logger.error('Error in saveCashFlowData:', error);
      throw error;
    }
  }

  async updateCashFlowFields(projectId, fieldUpdates, userId, changeReason) {
    try {
      const existingData = await cashFlowRepository.getByProjectId(projectId);
      if (!existingData) {
        throw new Error('Cash flow data not found');
      }

      const changes = this.detectChanges(existingData, fieldUpdates);
      if (!changes.changesDetected) {
        return {
          data: existingData,
          audit: {
            changesDetected: false,
            version: existingData.version,
            isNewRecord: false
          }
        };
      }

      const result = await cashFlowRepository.partialUpdate(
        projectId,
        fieldUpdates,
        userId,
        changeReason
      );

      // Log to audit trail
      await auditService.logChange({
        table_name: 'cash_flow_data',
        record_id: result.id,
        action: 'UPDATE',
        old_values: existingData,
        new_values: result,
        changed_fields: changes.changedFields,
        change_reason: changeReason,
        user_id: userId,
        ip_address: null
      });

      return {
        data: result,
        audit: {
          changesDetected: true,
          changedFields: changes.changedFields,
          version: result.version,
          isNewRecord: false
        }
      };
    } catch (error) {
      logger.error('Error in updateCashFlowFields:', error);
      throw error;
    }
  }

  async getAuditHistory(projectId) {
    try {
      return await cashFlowRepository.getAuditHistory(projectId);
    } catch (error) {
      logger.error('Error in getAuditHistory:', error);
      throw error;
    }
  }

  detectChanges(existingData, newData) {
    const changedFields = [];
    let changesDetected = false;

    // If no existing data, all fields in new data are changes
    if (!existingData) {
      changesDetected = true;
      changedFields.push(...Object.keys(newData));
      return { changesDetected, changedFields };
    }

    // Compare each field in newData with existingData
    Object.keys(newData).forEach(field => {
      if (this.valuesAreDifferent(existingData[field], newData[field])) {
        changesDetected = true;
        changedFields.push(field);
      }
    });

    return { changesDetected, changedFields };
  }

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

  calculateDerivedFields(data) {
    // Calculate operating cash flow
    data.operating_cash_flow = (
      parseFloat(data.net_income || 0) +
      parseFloat(data.depreciation || 0) +
      parseFloat(data.amortization || 0) +
      parseFloat(data.changes_in_working_capital || 0)
    ).toFixed(2);

    // Calculate investing cash flow
    data.investing_cash_flow = (
      -parseFloat(data.capex || 0) +
      -parseFloat(data.acquisitions || 0)
    ).toFixed(2);

    // Calculate financing cash flow
    data.financing_cash_flow = (
      parseFloat(data.debt_issuance || 0) +
      -parseFloat(data.debt_repayment || 0) +
      -parseFloat(data.dividends || 0)
    ).toFixed(2);

    // Calculate net cash flow
    data.net_cash_flow = (
      parseFloat(data.operating_cash_flow || 0) +
      parseFloat(data.investing_cash_flow || 0) +
      parseFloat(data.financing_cash_flow || 0)
    ).toFixed(2);

    // Calculate free cash flow
    data.free_cash_flow = (
      parseFloat(data.operating_cash_flow || 0) +
      -parseFloat(data.capital_expenditures || 0)
    ).toFixed(2);

    return data;
  }
}

module.exports = new CashFlowService();