const DatabaseService = require('../services/database');

class BalanceSheetRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get balance sheet data by project ID
   * @param {string} projectId - The project UUID
   * @returns {Object|null} Balance sheet data or null if not found
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT 
          id,
          project_id,
          cash,
          accounts_receivable,
          inventory,
          prepaid_expenses,
          other_current_assets,
          total_current_assets,
          ppe,
          intangible_assets,
          goodwill,
          other_assets,
          total_assets,
          accounts_payable,
          accrued_expenses,
          short_term_debt,
          other_current_liabilities,
          total_current_liabilities,
          long_term_debt,
          other_liabilities,
          total_liabilities,
          common_stock,
          retained_earnings,
          other_equity,
          total_equity,
          total_liabilities_equity,
          capital_expenditure_additions,
          asset_depreciated_over_years,
          senior_secured,
          debt_tranche1,
          version,
          created_by,
          updated_by,
          change_reason,
          created_at,
          updated_at,
          last_modified
        FROM balance_sheet_data 
        WHERE project_id = $1
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get balance sheet data: ${error.message}`);
    }
  }

  /**
   * Create new balance sheet data record
   * @param {string} projectId - The project UUID
   * @param {Object} data - Balance sheet data
   * @param {string} userId - User who created this record
   * @returns {Object} Created balance sheet data
   */
  async create(projectId, data, userId) {
    try {
      const query = `
        INSERT INTO balance_sheet_data (
          project_id,
          cash,
          accounts_receivable,
          inventory,
          prepaid_expenses,
          other_current_assets,
          total_current_assets,
          ppe,
          intangible_assets,
          goodwill,
          other_assets,
          total_assets,
          accounts_payable,
          accrued_expenses,
          short_term_debt,
          other_current_liabilities,
          total_current_liabilities,
          long_term_debt,
          other_liabilities,
          total_liabilities,
          common_stock,
          retained_earnings,
          other_equity,
          total_equity,
          total_liabilities_equity,
          capital_expenditure_additions,
          asset_depreciated_over_years,
          senior_secured,
          debt_tranche1,
          created_by,
          updated_by,
          change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
        RETURNING *
      `;
      
      const values = [
        projectId,
        data.cash || null,
        data.accounts_receivable || null,
        data.inventory || null,
        data.prepaid_expenses || null,
        data.other_current_assets || null,
        data.total_current_assets || null,
        data.ppe || null,
        data.intangible_assets || null,
        data.goodwill || null,
        data.other_assets || null,
        data.total_assets || null,
        data.accounts_payable || null,
        data.accrued_expenses || null,
        data.short_term_debt || null,
        data.other_current_liabilities || null,
        data.total_current_liabilities || null,
        data.long_term_debt || null,
        data.other_liabilities || null,
        data.total_liabilities || null,
        data.common_stock || null,
        data.retained_earnings || null,
        data.other_equity || null,
        data.total_equity || null,
        data.total_liabilities_equity || null,
        data.capital_expenditure_additions || null,
        data.asset_depreciated_over_years || null,
        data.senior_secured || null,
        data.debt_tranche1 || null,
        userId,
        userId,
        data.change_reason || 'Initial creation'
      ];
      
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create balance sheet data: ${error.message}`);
    }
  }

  /**
   * Partial update - only updates provided fields, preserves others
   * @param {string} projectId - The project UUID
   * @param {Object} changes - Only the fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Why this change was made
   * @returns {Object} Updated balance sheet data
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      // Build dynamic query for only provided fields
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Add only the fields that are actually provided (not undefined)
      const allowedFields = [
        'cash',
        'accounts_receivable',
        'inventory',
        'prepaid_expenses',
        'other_current_assets',
        'total_current_assets',
        'ppe',
        'intangible_assets',
        'goodwill',
        'other_assets',
        'total_assets',
        'accounts_payable',
        'accrued_expenses',
        'short_term_debt',
        'other_current_liabilities',
        'total_current_liabilities',
        'long_term_debt',
        'other_liabilities',
        'total_liabilities',
        'common_stock',
        'retained_earnings',
        'other_equity',
        'total_equity',
        'total_liabilities_equity',
        'capital_expenditure_additions',
        'asset_depreciated_over_years',
        'senior_secured',
        'debt_tranche1'
      ];

      allowedFields.forEach(field => {
        if (changes.hasOwnProperty(field) && changes[field] !== undefined) {
          updateFields.push(`${field} = $${paramIndex}`);
          values.push(changes[field]);
          paramIndex++;
        }
      });

      // If no fields to update, return current data
      if (updateFields.length === 0) {
        return await this.getByProjectId(projectId);
      }

      // Always add audit fields
      updateFields.push(
        `updated_by = $${paramIndex}`,
        `change_reason = $${paramIndex + 1}`,
        `updated_at = NOW()`,
        `version = COALESCE(version, 0) + 1`
      );
      values.push(userId, changeReason);
      values.push(projectId); // WHERE clause parameter

      const query = `
        UPDATE balance_sheet_data 
        SET ${updateFields.join(', ')}
        WHERE project_id = $${paramIndex + 2}
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Balance sheet data not found for update');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update balance sheet data: ${error.message}`);
    }
  }

  /**
   * Upsert - Create if doesn't exist, update if exists
   * @param {string} projectId - The project UUID
   * @param {Object} data - Balance sheet data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Why this change was made
   * @returns {Object} Balance sheet data (created or updated)
   */
  async upsert(projectId, data, userId, changeReason = 'Data entry update') {
    try {
      const existing = await this.getByProjectId(projectId);
      
      if (existing) {
        return await this.partialUpdate(projectId, data, userId, changeReason);
      } else {
        return await this.create(projectId, data, userId);
      }
    } catch (error) {
      throw new Error(`Failed to upsert balance sheet data: ${error.message}`);
    }
  }

  /**
   * Get version history for audit trail
   * @param {string} projectId - The project UUID
   * @returns {Array} Array of audit log entries
   */
  async getAuditHistory(projectId) {
    try {
      const query = `
        SELECT 
          dal.*,
          u.email as user_email
        FROM data_entry_audit_log dal
        LEFT JOIN users u ON dal.user_id = u.id
        WHERE dal.table_name = 'balance_sheet_data' 
        AND dal.record_id = (
          SELECT id FROM balance_sheet_data WHERE project_id = $1
        )
        ORDER BY dal.change_timestamp DESC
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get audit history: ${error.message}`);
    }
  }

  /**
   * Delete balance sheet data (soft delete via audit trail)
   * @param {string} projectId - The project UUID
   * @param {string} userId - User making the deletion
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM balance_sheet_data 
        WHERE project_id = $1
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete balance sheet data: ${error.message}`);
    }
  }
}

module.exports = new BalanceSheetRepository(); 