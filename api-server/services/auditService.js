const DatabaseService = require('./database');
const loggerService = require('./logger');
const logger = loggerService.logger;

class AuditService {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Log a change to the audit trail
   * @param {Object} auditData - Audit data
   * @param {string} auditData.user_id - User who made the change
   * @param {string} auditData.table_name - Table that was changed
   * @param {string} auditData.record_id - ID of the record that was changed
   * @param {string} auditData.action - Action performed (INSERT, UPDATE, DELETE)
   * @param {Object} auditData.old_values - Old values before change
   * @param {Object} auditData.new_values - New values after change
   * @param {string} auditData.change_reason - Reason for the change
   * @param {string} auditData.ip_address - IP address of the user
   * @returns {Object} Audit log entry
   */
  async logChange(auditData) {
    try {
      const query = `
        INSERT INTO data_entry_audit_log (
          created_by,
          table_name,
          record_id,
          action,
          old_values,
          new_values,
          change_reason,
          ip_address
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      // Handle IP address - PostgreSQL inet type doesn't accept 'Unknown'
      const ipAddress = auditData.ip_address && auditData.ip_address !== 'Unknown' 
        ? auditData.ip_address 
        : null;

      const values = [
        auditData.user_id,
        auditData.table_name,
        auditData.record_id,
        auditData.action,
        JSON.stringify(auditData.old_values || {}),
        JSON.stringify(auditData.new_values || {}),
        auditData.change_reason || 'No reason provided',
        ipAddress
      ];
      
      const result = await this.db.query(query, values);
      
      logger.info('Audit log entry created', {
        auditId: result.rows[0].id,
        userId: auditData.user_id,
        tableName: auditData.table_name,
        action: auditData.action
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to create audit log entry', {
        error: error.message,
        auditData
      });
      throw error;
    }
  }

  /**
   * Get audit history for a specific record
   * @param {string} tableName - Name of the table
   * @param {string} recordId - ID of the record
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of entries to return
   * @param {number} options.offset - Number of entries to skip
   * @param {string} options.action - Filter by action type
   * @returns {Array} Audit history entries
   */
  async getRecordHistory(tableName, recordId, options = {}) {
    try {
      const { limit = 50, offset = 0, action } = options;
      
      let query = `
        SELECT 
          dal.*,
          u.email as user_email,
          up.full_name as user_name
        FROM data_entry_audit_log dal
        LEFT JOIN users u ON dal.created_by = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE dal.table_name = $1 AND dal.record_id = $2
      `;
      
      const values = [tableName, recordId];
      let paramIndex = 3;
      
      if (action) {
        query += ` AND dal.action = $${paramIndex}`;
        values.push(action);
        paramIndex++;
      }
      
      query += ` ORDER BY dal.change_timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      values.push(limit, offset);
      
      const result = await this.db.query(query, values);
      
      // Parse JSON fields
      const parsedResults = result.rows.map(row => ({
        ...row,
        old_values: this.safeJSONParse(row.old_values),
        new_values: this.safeJSONParse(row.new_values)
      }));
      
      logger.info('Audit history retrieved', {
        tableName,
        recordId,
        entryCount: parsedResults.length
      });
      
      return parsedResults;
    } catch (error) {
      logger.error('Failed to get record history', {
        tableName,
        recordId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get audit history for a project across all tables
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @returns {Array} Combined audit history
   */
  async getProjectAuditHistory(projectId, options = {}) {
    try {
      const { limit = 100, offset = 0 } = options;
      
      // Get all record IDs for this project across different tables
      const query = `
        SELECT 
          dal.*,
          u.email as user_email,
          up.full_name as user_name
        FROM data_entry_audit_log dal
        LEFT JOIN users u ON dal.created_by = u.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE dal.record_id IN (
          SELECT id::text FROM company_details WHERE project_id = $1
          UNION
          SELECT id::text FROM profit_loss_data WHERE project_id = $1
          UNION
          SELECT id::text FROM balance_sheet_data WHERE project_id = $1
          UNION
          SELECT id::text FROM debt_structure_data WHERE project_id = $1
          UNION
          SELECT id::text FROM growth_assumptions_data WHERE project_id = $1
          UNION
          SELECT id::text FROM working_capital_data WHERE project_id = $1
          UNION
          SELECT id::text FROM seasonality_data WHERE project_id = $1
          UNION
          SELECT id::text FROM cash_flow_data WHERE project_id = $1
        )
        ORDER BY dal.change_timestamp DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await this.db.query(query, [projectId, limit, offset]);
      
      // Parse JSON fields
      const parsedResults = result.rows.map(row => ({
        ...row,
        old_values: this.safeJSONParse(row.old_values),
        new_values: this.safeJSONParse(row.new_values)
      }));
      
      logger.info('Project audit history retrieved', {
        projectId,
        entryCount: parsedResults.length
      });
      
      return parsedResults;
    } catch (error) {
      logger.error('Failed to get project audit history', {
        projectId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get audit statistics for a record or project
   * @param {string} tableName - Table name (optional for project stats)
   * @param {string} recordId - Record ID or project ID
   * @returns {Object} Audit statistics
   */
  async getAuditStats(tableName, recordId) {
    try {
      let query, values;
      
      if (tableName) {
        // Stats for specific record
        query = `
          SELECT 
            action,
            COUNT(*) as count,
            MIN(change_timestamp) as first_change,
            MAX(change_timestamp) as last_change,
            COUNT(DISTINCT created_by) as unique_users
          FROM data_entry_audit_log
          WHERE table_name = $1 AND record_id = $2
          GROUP BY action
        `;
        values = [tableName, recordId];
      } else {
        // Stats for entire project
        query = `
          SELECT 
            table_name,
            action,
            COUNT(*) as count,
            MIN(change_timestamp) as first_change,
            MAX(change_timestamp) as last_change,
            COUNT(DISTINCT created_by) as unique_users
          FROM data_entry_audit_log
          WHERE record_id IN (
            SELECT id::text FROM company_details WHERE project_id = $1
            UNION
            SELECT id::text FROM profit_loss_data WHERE project_id = $1
            UNION
            SELECT id::text FROM balance_sheet_data WHERE project_id = $1
            UNION
            SELECT id::text FROM debt_structure_data WHERE project_id = $1
            UNION
            SELECT id::text FROM growth_assumptions_data WHERE project_id = $1
            UNION
            SELECT id::text FROM working_capital_data WHERE project_id = $1
            UNION
            SELECT id::text FROM seasonality_data WHERE project_id = $1
            UNION
            SELECT id::text FROM cash_flow_data WHERE project_id = $1
          )
          GROUP BY table_name, action
          ORDER BY table_name, action
        `;
        values = [recordId]; // recordId is actually projectId in this case
      }
      
      const result = await this.db.query(query, values);
      
      logger.info('Audit statistics retrieved', {
        tableName,
        recordId,
        statsCount: result.rows.length
      });
      
      return result.rows;
    } catch (error) {
      logger.error('Failed to get audit statistics', {
        tableName,
        recordId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Compare two versions of a record
   * @param {string} tableName - Table name
   * @param {string} recordId - Record ID
   * @param {number} version1 - First version number
   * @param {number} version2 - Second version number
   * @returns {Object} Comparison result
   */
  async compareVersions(tableName, recordId, version1, version2) {
    try {
      const query = `
        SELECT 
          old_values,
          new_values,
          change_timestamp,
          created_by,
          change_reason
        FROM data_entry_audit_log
        WHERE table_name = $1 
        AND record_id = $2
        AND (
          JSON_EXTRACT_PATH_TEXT(new_values, 'version') = $3 OR
          JSON_EXTRACT_PATH_TEXT(new_values, 'version') = $4
        )
        ORDER BY change_timestamp
      `;
      
      const result = await this.db.query(query, [tableName, recordId, version1.toString(), version2.toString()]);
      
      if (result.rows.length < 2) {
        throw new Error('Could not find both versions for comparison');
      }
      
      const v1Data = this.safeJSONParse(result.rows[0].new_values);
      const v2Data = this.safeJSONParse(result.rows[1].new_values);
      
      const differences = this.findDifferences(v1Data, v2Data);
      
      return {
        version1: {
          number: version1,
          data: v1Data,
          timestamp: result.rows[0].created_at,
          user_id: result.rows[0].created_by,
          change_reason: result.rows[0].change_reason
        },
        version2: {
          number: version2,
          data: v2Data,
          timestamp: result.rows[1].change_timestamp,
          user_id: result.rows[1].user_id,
          change_reason: result.rows[1].change_reason
        },
        differences: differences
      };
    } catch (error) {
      logger.error('Failed to compare versions', {
        tableName,
        recordId,
        version1,
        version2,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Safely parse JSON string
   * @param {string} jsonString - JSON string to parse
   * @returns {Object} Parsed object or empty object if parsing fails
   */
  safeJSONParse(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      logger.warn('Failed to parse JSON string', { jsonString });
      return {};
    }
  }

  /**
   * Find differences between two objects
   * @param {Object} obj1 - First object
   * @param {Object} obj2 - Second object
   * @returns {Object} Object containing differences
   */
  findDifferences(obj1, obj2) {
    const differences = {};
    
    // Get all unique keys from both objects
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    
    allKeys.forEach(key => {
      const val1 = obj1[key];
      const val2 = obj2[key];
      
      if (val1 !== val2) {
        differences[key] = {
          from: val1,
          to: val2,
          changed: true
        };
      }
    });
    
    return differences;
  }

  /**
   * Cleanup old audit entries (optional maintenance function)
   * @param {number} daysToKeep - Number of days of audit history to keep
   * @returns {number} Number of entries deleted
   */
  async cleanupOldEntries(daysToKeep = 365) {
    try {
      const query = `
        DELETE FROM data_entry_audit_log
        WHERE change_timestamp < NOW() - INTERVAL '${daysToKeep} days'
        RETURNING id
      `;
      
      const result = await this.db.query(query);
      const deletedCount = result.rows.length;
      
      logger.info('Audit cleanup completed', {
        daysKept: daysToKeep,
        entriesDeleted: deletedCount
      });
      
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup audit entries', {
        daysToKeep,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new AuditService();