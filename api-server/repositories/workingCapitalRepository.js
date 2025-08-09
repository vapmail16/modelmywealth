const DatabaseService = require('../services/database');

class WorkingCapitalRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get working capital data by project ID
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Working capital data
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT * FROM working_capital_data 
        WHERE project_id = $1 
        ORDER BY version DESC 
        LIMIT 1
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get working capital data: ${error.message}`);
    }
  }

  /**
   * Create new working capital data
   * @param {string} projectId - Project UUID
   * @param {Object} data - Working capital data
   * @param {string} userId - User creating the record
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Created working capital data
   */
  async create(projectId, data, userId, changeReason = 'Initial creation') {
    try {
      const query = `
        INSERT INTO working_capital_data (
          project_id, days_receivables, days_inventory, days_payables, cash_cycle,
          account_receivable_percent, inventory_percent, other_current_assets_percent, accounts_payable_percent,
          created_by, updated_by, change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        ) RETURNING *
      `;
      
      const values = [
        projectId,
        data.days_receivables, data.days_inventory, data.days_payables, data.cash_cycle,
        data.account_receivable_percent, data.inventory_percent, data.other_current_assets_percent, data.accounts_payable_percent,
        userId, userId, changeReason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create working capital data: ${error.message}`);
    }
  }

  /**
   * Update working capital data (partial update)
   * @param {string} projectId - Project UUID
   * @param {Object} changes - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated working capital data
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Define allowed fields for update
      const allowedFields = [
        'days_receivables', 'days_inventory', 'days_payables', 'cash_cycle',
        'account_receivable_percent', 'inventory_percent', 'other_current_assets_percent', 'accounts_payable_percent'
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
        UPDATE working_capital_data 
        SET ${updateFields.join(', ')} 
        WHERE project_id = $${paramIndex + 2} 
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Working capital data not found for update');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update working capital data: ${error.message}`);
    }
  }

  /**
   * Upsert working capital data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Working capital data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Upserted working capital data
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
      throw new Error(`Failed to upsert working capital data: ${error.message}`);
    }
  }

  /**
   * Get audit history for working capital data
   * @param {string} projectId - Project UUID
   * @returns {Array} Audit history entries
   */
  async getAuditHistory(projectId) {
    try {
      const query = `
        SELECT 
          id, table_name, action, change_reason, created_at,
          old_values, new_values, changed_fields,
          created_by, ip_address
        FROM data_entry_audit_log 
        WHERE table_name = 'working_capital_data' 
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
   * Delete working capital data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM working_capital_data 
        WHERE project_id = $1 
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete working capital data: ${error.message}`);
    }
  }
}

module.exports = new WorkingCapitalRepository(); 