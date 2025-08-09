const DatabaseService = require('../services/database');

class DebtCalculationRepository {
  constructor() {
    this.db = DatabaseService;
  }

  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT 
          id, project_id, month, year, opening_balance, payment, 
          interest_payment, principal_payment, closing_balance, cumulative_interest,
          created_at, updated_at
        FROM debt_calculations 
        WHERE project_id = $1 
        ORDER BY year, month
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get debt calculations: ${error.message}`);
    }
  }

  async create(data) {
    try {
      const query = `
        INSERT INTO debt_calculations (
          project_id, month, year, opening_balance, payment, 
          interest_payment, principal_payment, closing_balance, cumulative_interest
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        data.project_id, data.month, data.year, data.opening_balance, data.payment,
        data.interest_payment, data.principal_payment, data.closing_balance, data.cumulative_interest
      ];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create debt calculation: ${error.message}`);
    }
  }

  async deleteByProjectId(projectId) {
    try {
      const query = 'DELETE FROM debt_calculations WHERE project_id = $1';
      await this.db.query(query, [projectId]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete debt calculations: ${error.message}`);
    }
  }

  async getCalculationHistory(projectId) {
    try {
      const query = `
        SELECT 
          id, project_id, run_name, calculation_type, input_data, output_data,
          status, created_at, created_by, completed_at, execution_time_ms, error_message
        FROM calculation_runs 
        WHERE project_id = $1 AND calculation_type = 'debt_calculation'
        ORDER BY created_at DESC
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get calculation history: ${error.message}`);
    }
  }

  async getCalculationRun(runId) {
    try {
      const query = `
        SELECT 
          id, project_id, run_name, calculation_type, input_data, output_data,
          status, created_at, created_by, completed_at, execution_time_ms, error_message
        FROM calculation_runs 
        WHERE id = $1
      `;
      const result = await this.db.query(query, [runId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get calculation run: ${error.message}`);
    }
  }

  async getByCalculationRunId(runId) {
    try {
      const query = `
        SELECT 
          id, project_id, month, year, opening_balance, payment, interest_payment, 
          principal_payment, closing_balance, cumulative_interest, created_at, updated_at
        FROM debt_calculations 
        WHERE calculation_run_id = $1
        ORDER BY month
      `;
      const result = await this.db.query(query, [runId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get calculations by run ID: ${error.message}`);
    }
  }

  async createCalculationRun(data) {
    try {
      const query = `
        INSERT INTO calculation_runs (
          project_id, run_name, calculation_type, input_data, output_data,
          status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        data.project_id, data.run_name, data.calculation_type, 
        JSON.stringify(data.input_data), JSON.stringify(data.output_data),
        data.status, data.created_by
      ];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create calculation run: ${error.message}`);
    }
  }

  async updateCalculationRun(id, data) {
    try {
      const query = `
        UPDATE calculation_runs 
        SET output_data = $1, status = $2, completed_at = $3, execution_time_ms = $4
        WHERE id = $5
        RETURNING *
      `;
      const values = [
        JSON.stringify(data.output_data), data.status, data.completed_at, 
        data.execution_time_ms, id
      ];
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update calculation run: ${error.message}`);
    }
  }
}

module.exports = new DebtCalculationRepository(); 