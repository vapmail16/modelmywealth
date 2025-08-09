const DatabaseService = require('../services/database');

class DebtStructureRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get debt structure data by project ID
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Debt structure data
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT * FROM debt_structure_data 
        WHERE project_id = $1 
        ORDER BY version DESC 
        LIMIT 1
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get debt structure data: ${error.message}`);
    }
  }

  /**
   * Create new debt structure data
   * @param {string} projectId - Project UUID
   * @param {Object} data - Debt structure data
   * @param {string} userId - User creating the record
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Created debt structure data
   */
  async create(projectId, data, userId, changeReason = 'Initial creation') {
    try {
      const query = `
        INSERT INTO debt_structure_data (
          project_id, total_debt, interest_rate, maturity_date, payment_frequency,
          senior_secured_loan_type, additional_loan_senior_secured, bank_base_rate_senior_secured,
          liquidity_premiums_senior_secured, credit_risk_premiums_senior_secured,
          maturity_y_senior_secured, amortization_y_senior_secured, short_term_loan_type,
          additional_loan_short_term, bank_base_rate_short_term, liquidity_premiums_short_term,
          credit_risk_premiums_short_term, maturity_y_short_term, amortization_y_short_term,
          created_by, updated_by, change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *
      `;
      
      const values = [
        projectId,
        data.total_debt,
        data.interest_rate,
        data.maturity_date,
        data.payment_frequency,
        data.senior_secured_loan_type,
        data.additional_loan_senior_secured,
        data.bank_base_rate_senior_secured,
        data.liquidity_premiums_senior_secured,
        data.credit_risk_premiums_senior_secured,
        data.maturity_y_senior_secured,
        data.amortization_y_senior_secured,
        data.short_term_loan_type,
        data.additional_loan_short_term,
        data.bank_base_rate_short_term,
        data.liquidity_premiums_short_term,
        data.credit_risk_premiums_short_term,
        data.maturity_y_short_term,
        data.amortization_y_short_term,
        userId,
        userId,
        changeReason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create debt structure data: ${error.message}`);
    }
  }

  /**
   * Update debt structure data (partial update)
   * @param {string} projectId - Project UUID
   * @param {Object} changes - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated debt structure data
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Define allowed fields for update
      const allowedFields = [
        'total_debt', 'interest_rate', 'maturity_date', 'payment_frequency',
        'senior_secured_loan_type', 'additional_loan_senior_secured', 'bank_base_rate_senior_secured',
        'liquidity_premiums_senior_secured', 'credit_risk_premiums_senior_secured',
        'maturity_y_senior_secured', 'amortization_y_senior_secured', 'short_term_loan_type',
        'additional_loan_short_term', 'bank_base_rate_short_term', 'liquidity_premiums_short_term',
        'credit_risk_premiums_short_term', 'maturity_y_short_term', 'amortization_y_short_term'
      ];

      allowedFields.forEach(field => {
        if (changes.hasOwnProperty(field) && changes[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(changes[field]);
          paramIndex++;
        }
      });

      if (updateFields.length === 0) {
        return await this.getByProjectId(projectId);
      }

      updateFields.push(
        `updated_by = $${paramIndex}`,
        `change_reason = $${paramIndex + 1}`,
        `updated_at = NOW()`,
        `version = COALESCE(version, 0) + 1`
      );
      values.push(userId, changeReason);
      values.push(projectId);

      const query = `
        UPDATE debt_structure_data 
        SET ${updateFields.join(', ')} 
        WHERE project_id = $${paramIndex + 2} 
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Debt structure data not found for update');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update debt structure data: ${error.message}`);
    }
  }

  /**
   * Upsert debt structure data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Debt structure data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Upserted debt structure data
   */
  async upsert(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      const existingData = await this.getByProjectId(projectId);
      
      if (existingData) {
        return await this.partialUpdate(projectId, data, userId, changeReason);
      } else {
        return await this.create(projectId, data, userId, changeReason);
      }
    } catch (error) {
      throw new Error(`Failed to upsert debt structure data: ${error.message}`);
    }
  }

  /**
   * Get audit history for debt structure data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const query = `
        SELECT 
          id, table_name, action, change_reason, created_at,
          old_values, new_values, changed_fields,
          user_id, ip_address
        FROM data_entry_audit_log 
        WHERE table_name = 'debt_structure_data' 
        AND old_values->>'project_id' = $1
        ORDER BY created_at DESC
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get audit history: ${error.message}`);
    }
  }

  /**
   * Delete debt structure data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM debt_structure_data 
        WHERE project_id = $1 
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete debt structure data: ${error.message}`);
    }
  }
}

module.exports = new DebtStructureRepository(); 