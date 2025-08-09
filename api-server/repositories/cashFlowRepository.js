const DatabaseService = require('../services/database');

class CashFlowRepository {
  constructor() {
    this.db = DatabaseService;
  }

  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT *
        FROM cash_flow_data
        WHERE project_id = $1
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get cash flow data: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const {
        project_id, net_income, depreciation, amortization, changes_in_working_capital,
        operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
        debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
        free_cash_flow, debt_service, created_by, change_reason
      } = data;

      const query = `
        INSERT INTO cash_flow_data (
          project_id, net_income, depreciation, amortization, changes_in_working_capital,
          operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
          debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
          free_cash_flow, debt_service, created_by, change_reason
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        RETURNING *
      `;

      const values = [
        project_id, net_income, depreciation, amortization, changes_in_working_capital,
        operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
        debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
        free_cash_flow, debt_service, created_by, change_reason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create cash flow data: ${error.message}`);
    }
  }

  async partialUpdate(projectId, updates, userId, changeReason) {
    try {
      const setClause = [];
      const values = [projectId];
      let paramCount = 2;

      Object.entries(updates).forEach(([key, value]) => {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });

      // Add updated_by and change_reason
      setClause.push(`updated_by = $${paramCount}`);
      values.push(userId);
      paramCount++;
      setClause.push(`change_reason = $${paramCount}`);
      values.push(changeReason);
      paramCount++;
      setClause.push('version = version + 1');

      const query = `
        UPDATE cash_flow_data
        SET ${setClause.join(', ')}
        WHERE project_id = $1
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update cash flow data: ${error.message}`);
    }
  }

  async upsert(data) {
    try {
      const {
        project_id, net_income, depreciation, amortization, changes_in_working_capital,
        operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
        debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
        free_cash_flow, debt_service, created_by, updated_by, change_reason
      } = data;

      const query = `
        INSERT INTO cash_flow_data (
          project_id, net_income, depreciation, amortization, changes_in_working_capital,
          operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
          debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
          free_cash_flow, debt_service, created_by, updated_by, change_reason
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        ON CONFLICT (project_id)
        DO UPDATE SET
          net_income = EXCLUDED.net_income,
          depreciation = EXCLUDED.depreciation,
          amortization = EXCLUDED.amortization,
          changes_in_working_capital = EXCLUDED.changes_in_working_capital,
          operating_cash_flow = EXCLUDED.operating_cash_flow,
          capex = EXCLUDED.capex,
          acquisitions = EXCLUDED.acquisitions,
          investing_cash_flow = EXCLUDED.investing_cash_flow,
          debt_issuance = EXCLUDED.debt_issuance,
          debt_repayment = EXCLUDED.debt_repayment,
          dividends = EXCLUDED.dividends,
          financing_cash_flow = EXCLUDED.financing_cash_flow,
          net_cash_flow = EXCLUDED.net_cash_flow,
          capital_expenditures = EXCLUDED.capital_expenditures,
          free_cash_flow = EXCLUDED.free_cash_flow,
          debt_service = EXCLUDED.debt_service,
          updated_by = EXCLUDED.updated_by,
          change_reason = EXCLUDED.change_reason,
          version = cash_flow_data.version + 1
        RETURNING *
      `;

      const values = [
        project_id, net_income, depreciation, amortization, changes_in_working_capital,
        operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
        debt_repayment, dividends, financing_cash_flow, net_cash_flow, capital_expenditures,
        free_cash_flow, debt_service, created_by, updated_by, change_reason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to upsert cash flow data: ${error.message}`);
    }
  }

  async getAuditHistory(projectId) {
    try {
      const query = `
        SELECT 
          id, table_name, action, change_reason, created_at,
          old_values, new_values, changed_fields,
          created_by, ip_address
        FROM data_entry_audit_log 
        WHERE table_name = 'cash_flow_data' 
        AND old_values->>'project_id' = $1
        ORDER BY created_at DESC
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get audit history: ${error.message}`);
    }
  }

  async delete(projectId) {
    try {
      const query = `
        DELETE FROM cash_flow_data
        WHERE project_id = $1
        RETURNING *
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to delete cash flow data: ${error.message}`);
    }
  }
}

module.exports = new CashFlowRepository();