const DatabaseService = require('../services/database');

class GrowthAssumptionsRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get growth assumptions data by project ID
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Growth assumptions data
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT * FROM growth_assumptions_data 
        WHERE project_id = $1 
        ORDER BY version DESC 
        LIMIT 1
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get growth assumptions data: ${error.message}`);
    }
  }

  /**
   * Create new growth assumptions data
   * @param {string} projectId - Project UUID
   * @param {Object} data - Growth assumptions data
   * @param {string} userId - User creating the record
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Created growth assumptions data
   */
  async create(projectId, data, userId, changeReason = 'Initial creation') {
    try {
      const query = `
        INSERT INTO growth_assumptions_data (
          project_id, gr_revenue_1, gr_revenue_2, gr_revenue_3, gr_revenue_4, gr_revenue_5,
          gr_revenue_6, gr_revenue_7, gr_revenue_8, gr_revenue_9, gr_revenue_10, gr_revenue_11, gr_revenue_12,
          gr_cost_1, gr_cost_2, gr_cost_3, gr_cost_4, gr_cost_5,
          gr_cost_6, gr_cost_7, gr_cost_8, gr_cost_9, gr_cost_10, gr_cost_11, gr_cost_12,
          gr_cost_oper_1, gr_cost_oper_2, gr_cost_oper_3, gr_cost_oper_4, gr_cost_oper_5,
          gr_cost_oper_6, gr_cost_oper_7, gr_cost_oper_8, gr_cost_oper_9, gr_cost_oper_10, gr_cost_oper_11, gr_cost_oper_12,
          gr_capex_1, gr_capex_2, gr_capex_3, gr_capex_4, gr_capex_5,
          gr_capex_6, gr_capex_7, gr_capex_8, gr_capex_9, gr_capex_10, gr_capex_11, gr_capex_12,
          created_by, updated_by, change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40,
          $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60
        ) RETURNING *
      `;
      
      const values = [
        projectId,
        data.gr_revenue_1, data.gr_revenue_2, data.gr_revenue_3, data.gr_revenue_4, data.gr_revenue_5,
        data.gr_revenue_6, data.gr_revenue_7, data.gr_revenue_8, data.gr_revenue_9, data.gr_revenue_10, data.gr_revenue_11, data.gr_revenue_12,
        data.gr_cost_1, data.gr_cost_2, data.gr_cost_3, data.gr_cost_4, data.gr_cost_5,
        data.gr_cost_6, data.gr_cost_7, data.gr_cost_8, data.gr_cost_9, data.gr_cost_10, data.gr_cost_11, data.gr_cost_12,
        data.gr_cost_oper_1, data.gr_cost_oper_2, data.gr_cost_oper_3, data.gr_cost_oper_4, data.gr_cost_oper_5,
        data.gr_cost_oper_6, data.gr_cost_oper_7, data.gr_cost_oper_8, data.gr_cost_oper_9, data.gr_cost_oper_10, data.gr_cost_oper_11, data.gr_cost_oper_12,
        data.gr_capex_1, data.gr_capex_2, data.gr_capex_3, data.gr_capex_4, data.gr_capex_5,
        data.gr_capex_6, data.gr_capex_7, data.gr_capex_8, data.gr_capex_9, data.gr_capex_10, data.gr_capex_11, data.gr_capex_12,
        userId, userId, changeReason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create growth assumptions data: ${error.message}`);
    }
  }

  /**
   * Update growth assumptions data (partial update)
   * @param {string} projectId - Project UUID
   * @param {Object} changes - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated growth assumptions data
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Define allowed fields for update
      const allowedFields = [
        'gr_revenue_1', 'gr_revenue_2', 'gr_revenue_3', 'gr_revenue_4', 'gr_revenue_5',
        'gr_revenue_6', 'gr_revenue_7', 'gr_revenue_8', 'gr_revenue_9', 'gr_revenue_10', 'gr_revenue_11', 'gr_revenue_12',
        'gr_cost_1', 'gr_cost_2', 'gr_cost_3', 'gr_cost_4', 'gr_cost_5',
        'gr_cost_6', 'gr_cost_7', 'gr_cost_8', 'gr_cost_9', 'gr_cost_10', 'gr_cost_11', 'gr_cost_12',
        'gr_cost_oper_1', 'gr_cost_oper_2', 'gr_cost_oper_3', 'gr_cost_oper_4', 'gr_cost_oper_5',
        'gr_cost_oper_6', 'gr_cost_oper_7', 'gr_cost_oper_8', 'gr_cost_oper_9', 'gr_cost_oper_10', 'gr_cost_oper_11', 'gr_cost_oper_12',
        'gr_capex_1', 'gr_capex_2', 'gr_capex_3', 'gr_capex_4', 'gr_capex_5',
        'gr_capex_6', 'gr_capex_7', 'gr_capex_8', 'gr_capex_9', 'gr_capex_10', 'gr_capex_11', 'gr_capex_12'
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
        UPDATE growth_assumptions_data 
        SET ${updateFields.join(', ')} 
        WHERE project_id = $${paramIndex + 2} 
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Growth assumptions data not found for update');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update growth assumptions data: ${error.message}`);
    }
  }

  /**
   * Upsert growth assumptions data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Growth assumptions data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Upserted growth assumptions data
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
      throw new Error(`Failed to upsert growth assumptions data: ${error.message}`);
    }
  }

  /**
   * Get audit history for growth assumptions data
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
        WHERE table_name = 'growth_assumptions_data' 
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
   * Delete growth assumptions data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM growth_assumptions_data 
        WHERE project_id = $1 
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete growth assumptions data: ${error.message}`);
    }
  }
}

module.exports = new GrowthAssumptionsRepository(); 