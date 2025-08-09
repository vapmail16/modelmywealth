const DatabaseService = require('../services/database');

class SeasonalityRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get seasonality data by project ID
   * @param {string} projectId - Project UUID
   * @returns {Object|null} Seasonality data
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT * FROM seasonality_data 
        WHERE project_id = $1 
        ORDER BY version DESC 
        LIMIT 1
      `;
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get seasonality data: ${error.message}`);
    }
  }

  /**
   * Create new seasonality data
   * @param {string} projectId - Project UUID
   * @param {Object} data - Seasonality data
   * @param {string} userId - User creating the record
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Created seasonality data
   */
  async create(projectId, data, userId, changeReason = 'Initial creation') {
    try {
      const query = `
        INSERT INTO seasonality_data (
          project_id, january, february, march, april, may, june,
          july, august, september, october, november, december,
          seasonal_working_capital, seasonality_pattern,
          created_by, updated_by, change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *
      `;
      
      const values = [
        projectId,
        data.january, data.february, data.march, data.april, data.may, data.june,
        data.july, data.august, data.september, data.october, data.november, data.december,
        data.seasonal_working_capital, data.seasonality_pattern,
        userId, userId, changeReason
      ];

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create seasonality data: ${error.message}`);
    }
  }

  /**
   * Update seasonality data (partial update)
   * @param {string} projectId - Project UUID
   * @param {Object} changes - Fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Updated seasonality data
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Define allowed fields for update
      const allowedFields = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december',
        'seasonal_working_capital', 'seasonality_pattern'
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
        UPDATE seasonality_data 
        SET ${updateFields.join(', ')} 
        WHERE project_id = $${paramIndex + 2} 
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Seasonality data not found for update');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update seasonality data: ${error.message}`);
    }
  }

  /**
   * Upsert seasonality data (create or update)
   * @param {string} projectId - Project UUID
   * @param {Object} data - Seasonality data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Upserted seasonality data
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
      throw new Error(`Failed to upsert seasonality data: ${error.message}`);
    }
  }

  /**
   * Get audit history for seasonality data
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
        WHERE table_name = 'seasonality_data' 
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
   * Delete seasonality data
   * @param {string} projectId - Project UUID
   * @param {string} userId - User deleting the record
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM seasonality_data 
        WHERE project_id = $1 
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete seasonality data: ${error.message}`);
    }
  }
}

module.exports = new SeasonalityRepository(); 