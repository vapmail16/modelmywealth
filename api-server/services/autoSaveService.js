const db = require('./database');
const loggerService = require('./logger');
const logger = loggerService.logger;

class AutoSaveService {
  constructor() {
    this.pendingSaves = new Map(); // projectId -> { timer, data, section }
    this.debounceDelay = 2000; // 2 seconds
  }

  /**
   * Debounced auto-save for data entry sections
   */
  async autoSave(projectId, section, data, userId) {
    const key = `${projectId}-${section}`;
    
    // Clear existing timer
    if (this.pendingSaves.has(key)) {
      clearTimeout(this.pendingSaves.get(key).timer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.performSave(projectId, section, data, userId);
        this.pendingSaves.delete(key);
      } catch (error) {
        logger.error('Auto-save failed', { projectId, section, error: error.message });
      }
    }, this.debounceDelay);

    // Store pending save
    this.pendingSaves.set(key, { timer, data, section });
  }

  /**
   * Perform the actual save operation
   */
  async performSave(projectId, section, data, userId) {
    const startTime = Date.now();
    
    try {
      logger.info('Performing auto-save', { projectId, section, userId });

      // Get table name from section
      const tableName = this.getTableName(section);
      
      // Check if record exists
      const existingRecord = await this.getExistingRecord(projectId, tableName);
      
      let result;
      if (existingRecord) {
        // Update existing record
        result = await this.updateRecord(projectId, tableName, data, userId);
      } else {
        // Create new record
        result = await this.createRecord(projectId, tableName, data, userId);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Auto-save completed', { 
        projectId, 
        section, 
        executionTime,
        recordId: result.id 
      });

      return result;
    } catch (error) {
      logger.error('Auto-save error', { 
        projectId, 
        section, 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  /**
   * Get table name from section
   */
  getTableName(section) {
    const tableMap = {
      'company-details': 'company_details',
      'profit-loss': 'profit_loss_data',
      'balance-sheet': 'balance_sheet_data',
      'debt-structure': 'debt_structure_data',
      'growth-assumptions': 'growth_assumptions_data',
      'working-capital': 'working_capital_data',
      'seasonality': 'seasonality_data',
      'cash-flow': 'cash_flow_data'
    };
    
    return tableMap[section] || section;
  }

  /**
   * Get existing record for project and table
   */
  async getExistingRecord(projectId, tableName) {
    const query = `SELECT * FROM ${tableName} WHERE project_id = $1 LIMIT 1`;
    const result = await db.query(query, [projectId]);
    return result.rows[0] || null;
  }

  /**
   * Create new record
   */
  async createRecord(projectId, tableName, data, userId) {
    const fields = Object.keys(data).filter(key => data[key] !== null && data[key] !== undefined);
    const values = fields.map(field => data[field]);
    const placeholders = fields.map((_, index) => `$${index + 3}`); // +3 for project_id, created_by, updated_by
    
    const query = `
      INSERT INTO ${tableName} (project_id, created_by, updated_by, ${fields.join(', ')})
      VALUES ($1, $2, $2, ${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await db.query(query, [projectId, userId, ...values]);
    return result.rows[0];
  }

  /**
   * Update existing record
   */
  async updateRecord(projectId, tableName, data, userId) {
    const fields = Object.keys(data).filter(key => data[key] !== null && data[key] !== undefined);
    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', '); // +3 for project_id, updated_by, and the field itself
    
    const query = `
      UPDATE ${tableName} 
      SET updated_by = $2, last_modified = NOW(), version = version + 1, ${setClause}
      WHERE project_id = $1
      RETURNING *
    `;
    
    const values = fields.map(field => data[field]);
    const result = await db.query(query, [projectId, userId, ...values]);
    return result.rows[0];
  }

  /**
   * Get audit history for a section
   */
  async getAuditHistory(projectId, section, limit = 50) {
    const tableName = this.getTableName(section);
    
    const query = `
      SELECT 
        al.*,
        u.email as user_email
      FROM data_entry_audit_log al
      LEFT JOIN users u ON al.created_by = u.id
      WHERE al.project_id = $1 AND al.table_name = $2
      ORDER BY al.created_at DESC
      LIMIT $3
    `;
    
    const result = await db.query(query, [projectId, tableName, limit]);
    return result.rows;
  }

  /**
   * Get change history for a specific field
   */
  async getFieldHistory(projectId, section, fieldName, limit = 20) {
    const tableName = this.getTableName(section);
    
    const query = `
      SELECT 
        al.created_at,
        al.old_values->$3 as old_value,
        al.new_values->$3 as new_value,
        al.created_by,
        u.email as user_email
      FROM data_entry_audit_log al
      LEFT JOIN users u ON al.created_by = u.id
      WHERE al.project_id = $1 
        AND al.table_name = $2 
        AND al.changed_fields @> ARRAY[$3]
      ORDER BY al.created_at DESC
      LIMIT $4
    `;
    
    const result = await db.query(query, [projectId, tableName, fieldName, limit]);
    return result.rows;
  }

  /**
   * Cancel pending saves for a project
   */
  cancelPendingSaves(projectId) {
    for (const [key, save] of this.pendingSaves.entries()) {
      if (key.startsWith(projectId)) {
        clearTimeout(save.timer);
        this.pendingSaves.delete(key);
      }
    }
  }

  /**
   * Force save immediately (bypass debouncing)
   */
  async forceSave(projectId, section, data, userId) {
    // Cancel any pending saves for this section
    const key = `${projectId}-${section}`;
    if (this.pendingSaves.has(key)) {
      clearTimeout(this.pendingSaves.get(key).timer);
      this.pendingSaves.delete(key);
    }
    
    // Perform save immediately
    return await this.performSave(projectId, section, data, userId);
  }
}

module.exports = new AutoSaveService(); 