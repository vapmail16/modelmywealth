const DatabaseService = require('../services/database');

class CompanyRepository {
  constructor() {
    this.db = DatabaseService;
  }

  /**
   * Get company details by project ID
   * @param {string} projectId - The project UUID
   * @returns {Object|null} Company details or null if not found
   */
  async getByProjectId(projectId) {
    try {
      const query = `
        SELECT 
          id,
          project_id,
          company_name,
          industry,
          fiscal_year_end,
          reporting_currency,
          region,
          country,
          employee_count,
          founded,
          company_website,
          business_case,
          notes,
          projection_start_month,
          projection_start_year,
          projections_year,
          version,
          created_by,
          updated_by,
          change_reason,
          created_at,
          updated_at,
          last_modified
        FROM company_details 
        WHERE project_id = $1
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get company details: ${error.message}`);
    }
  }

  /**
   * Create new company details record
   * @param {string} projectId - The project UUID
   * @param {Object} data - Company details data
   * @param {string} userId - User who created this record
   * @returns {Object} Created company details
   */
  async create(projectId, data, userId) {
    try {
      const query = `
        INSERT INTO company_details (
          project_id,
          company_name,
          industry,
          fiscal_year_end,
          reporting_currency,
          region,
          country,
          employee_count,
          founded,
          company_website,
          business_case,
          notes,
          projection_start_month,
          projection_start_year,
          projections_year,
          created_by,
          updated_by,
          change_reason
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        )
        RETURNING *
      `;
      
      const values = [
        projectId,
        data.company_name || null,
        data.industry || null,
        data.fiscal_year_end || null,
        data.reporting_currency || null,
        data.region || null,
        data.country || null,
        data.employee_count || null,
        data.founded || null,
        data.company_website || null,
        data.business_case || null,
        data.notes || null,
        data.projection_start_month || null,
        data.projection_start_year || null,
        data.projections_year || null,
        userId,
        userId,
        data.change_reason || 'Initial creation'
      ];
      
      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create company details: ${error.message}`);
    }
  }

  /**
   * Partial update - only updates provided fields, preserves others
   * @param {string} projectId - The project UUID
   * @param {Object} changes - Only the fields to update
   * @param {string} userId - User making the change
   * @param {string} changeReason - Why this change was made
   * @returns {Object} Updated company details
   */
  async partialUpdate(projectId, changes, userId, changeReason = 'Updated via API') {
    try {
      // Build dynamic query for only provided fields
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Add only the fields that are actually provided (not undefined)
      const allowedFields = [
        'company_name',
        'industry', 
        'fiscal_year_end',
        'reporting_currency',
        'region',
        'country',
        'employee_count',
        'founded',
        'company_website',
        'business_case',
        'notes',
        'projection_start_month',
        'projection_start_year',
        'projections_year'
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
        UPDATE company_details 
        SET ${updateFields.join(', ')}
        WHERE project_id = $${paramIndex + 2}
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Company details not found for update');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update company details: ${error.message}`);
    }
  }

  /**
   * Upsert - Create if doesn't exist, update if exists
   * @param {string} projectId - The project UUID
   * @param {Object} data - Company details data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Why this change was made
   * @returns {Object} Company details (created or updated)
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
      throw new Error(`Failed to upsert company details: ${error.message}`);
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
        WHERE dal.table_name = 'company_details' 
        AND dal.record_id = (
          SELECT id FROM company_details WHERE project_id = $1
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
   * Delete company details (soft delete via audit trail)
   * @param {string} projectId - The project UUID
   * @param {string} userId - User making the deletion
   * @returns {boolean} Success status
   */
  async delete(projectId, userId) {
    try {
      const query = `
        DELETE FROM company_details 
        WHERE project_id = $1
        RETURNING id
      `;
      
      const result = await this.db.query(query, [projectId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete company details: ${error.message}`);
    }
  }
}

module.exports = new CompanyRepository();