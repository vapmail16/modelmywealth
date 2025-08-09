const db = require('../services/database');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class ProfitLossRepository {
  async getByProjectId(projectId) {
    try {
      const result = await db.query('SELECT * FROM profit_loss_data WHERE project_id = $1', [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error fetching profit loss data for project ${projectId}:`, error);
      throw error;
    }
  }

  async create(projectId, data, userId) {
    try {
      const fields = ['project_id', 'created_by', 'updated_by', 'change_reason'];
      const placeholders = ['$1', '$2', '$3', '$4'];
      const values = [projectId, userId, userId, data.change_reason || 'Initial creation'];

      let paramIndex = 5;
      for (const key in data) {
        if (data[key] !== undefined && key !== 'change_reason') {
          fields.push(key);
          placeholders.push(`$${paramIndex}`);
          values.push(data[key]);
          paramIndex++;
        }
      }

      const query = `
        INSERT INTO profit_loss_data (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *;
      `;
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error creating profit loss data for project ${projectId}:`, error);
      throw error;
    }
  }

  async partialUpdate(projectId, changes, userId, changeReason) {
    try {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const field in changes) {
        if (changes[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(changes[field]);
          paramIndex++;
        }
      }

      // Always update audit fields
      updateFields.push(`updated_by = $${paramIndex}`);
      values.push(userId);
      paramIndex++;

      updateFields.push(`change_reason = $${paramIndex}`);
      values.push(changeReason || 'Updated via data entry form');
      paramIndex++;

      updateFields.push(`updated_at = NOW()`);
      updateFields.push(`version = COALESCE(profit_loss_data.version, 0) + 1`);

      if (updateFields.length === 4) { // Only audit fields, no actual data changes
        logger.info(`No fields to update for project ${projectId}.`);
        return this.getByProjectId(projectId);
      }

      values.push(projectId); // WHERE clause parameter

      const query = `
        UPDATE profit_loss_data
        SET ${updateFields.join(', ')}
        WHERE project_id = $${paramIndex}
        RETURNING *;
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error partially updating profit loss data for project ${projectId}:`, error);
      throw error;
    }
  }

  async delete(projectId) {
    try {
      const result = await db.query(
        'DELETE FROM profit_loss_data WHERE project_id = $1 RETURNING *',
        [projectId]
      );
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error deleting profit loss data for project ${projectId}:`, error);
      throw error;
    }
  }

  async getAuditHistory(projectId, limit = 50) {
    try {
      const result = await db.query(`
        SELECT * FROM data_entry_audit_log 
        WHERE table_name = 'profit_loss_data' 
        AND new_values->>'project_id' = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [projectId, limit]);
      return result.rows;
    } catch (error) {
      logger.error(`Error fetching audit history for profit loss data project ${projectId}:`, error);
      throw error;
    }
  }
}

module.exports = new ProfitLossRepository();