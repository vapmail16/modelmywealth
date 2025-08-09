const companyRepository = require('../repositories/companyRepository');
const loggerService = require('./logger');
const logger = loggerService.logger;

class CompanyService {
  /**
   * Get company details for a project
   * @param {string} projectId - The project UUID
   * @returns {Object|null} Company details or null if not found
   */
  async getCompanyDetails(projectId) {
    try {
      logger.info('Getting company details', { projectId });
      
      const companyDetails = await companyRepository.getByProjectId(projectId);
      
      if (!companyDetails) {
        logger.info('No company details found', { projectId });
        return null;
      }
      
      logger.info('Company details retrieved successfully', { 
        projectId, 
        version: companyDetails.version 
      });
      
      return companyDetails;
    } catch (error) {
      logger.error('Failed to get company details', { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save company details with smart change detection
   * @param {string} projectId - The project UUID
   * @param {Object} newData - New company data
   * @param {string} userId - User making the change
   * @param {string} changeReason - Reason for the change
   * @returns {Object} Saved company details
   */
  async saveCompanyDetails(projectId, newData, userId, changeReason = 'Data entry update') {
    try {
      logger.info('Saving company details', { 
        projectId, 
        userId, 
        changeReason,
        fieldsProvided: Object.keys(newData)
      });

      // Get current data for comparison
      const currentData = await companyRepository.getByProjectId(projectId);
      
      if (currentData) {
        // Detect what actually changed
        const changes = this.detectChanges(currentData, newData);
        
        logger.info('Change detection completed', {
          projectId,
          currentVersion: currentData.version,
          changedFields: Object.keys(changes),
          changes: changes
        });
        
        // If no changes detected, return current data
        if (Object.keys(changes).length === 0) {
          logger.info('No changes detected, skipping update', { projectId });
          return {
            success: true,
            data: currentData,
            message: 'No changes detected',
            changesDetected: false
          };
        }
        
        // Perform partial update with only changed fields
        const updatedData = await companyRepository.partialUpdate(
          projectId, 
          changes, 
          userId, 
          changeReason
        );
        
        logger.info('Company details updated successfully', {
          projectId,
          oldVersion: currentData.version,
          newVersion: updatedData.version,
          changedFields: Object.keys(changes)
        });
        
        return {
          success: true,
          data: updatedData,
          message: 'Company details updated successfully',
          changesDetected: true,
          changedFields: Object.keys(changes)
        };
      } else {
        // Create new record
        logger.info('Creating new company details record', { projectId });
        
        const createdData = await companyRepository.create(projectId, newData, userId);
        
        logger.info('Company details created successfully', {
          projectId,
          version: createdData.version
        });
        
        return {
          success: true,
          data: createdData,
          message: 'Company details created successfully',
          changesDetected: true,
          isNewRecord: true
        };
      }
    } catch (error) {
      logger.error('Failed to save company details', {
        projectId,
        userId,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Detect what fields actually changed between current and new data
   * @param {Object} currentData - Current data from database
   * @param {Object} newData - New data from user input
   * @returns {Object} Object containing only the changed fields
   */
  detectChanges(currentData, newData) {
    const changes = {};
    
    // List of fields that can be updated
    const updatableFields = [
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
    
    updatableFields.forEach(field => {
      if (newData.hasOwnProperty(field)) {
        const newValue = newData[field];
        const currentValue = currentData[field];
        
        // Handle different data types and null/undefined comparisons
        if (this.valuesAreDifferent(currentValue, newValue)) {
          changes[field] = newValue;
          
          logger.debug('Field change detected', {
            field,
            oldValue: currentValue,
            newValue: newValue,
            oldType: typeof currentValue,
            newType: typeof newValue
          });
        }
      }
    });
    
    return changes;
  }

  /**
   * Compare two values considering null/undefined and type conversions
   * @param {any} currentValue - Current value from database
   * @param {any} newValue - New value from user input
   * @returns {boolean} True if values are different
   */
  valuesAreDifferent(currentValue, newValue) {
    // Handle null/undefined cases
    if (currentValue === null && (newValue === undefined || newValue === '')) {
      return false;
    }
    if (currentValue === undefined && (newValue === null || newValue === '')) {
      return false;
    }
    if ((currentValue === null || currentValue === undefined) && newValue === '') {
      return false;
    }
    if ((newValue === null || newValue === undefined) && currentValue === '') {
      return false;
    }
    
    // Handle number conversions
    if (typeof currentValue === 'number' && typeof newValue === 'string') {
      return currentValue !== parseInt(newValue) && currentValue !== parseFloat(newValue);
    }
    if (typeof newValue === 'number' && typeof currentValue === 'string') {
      return newValue !== parseInt(currentValue) && newValue !== parseFloat(currentValue);
    }
    
    // Handle date conversions
    if (currentValue instanceof Date && typeof newValue === 'string') {
      return currentValue.toISOString().split('T')[0] !== newValue;
    }
    
    // Direct comparison
    return currentValue !== newValue;
  }

  /**
   * Get audit history for company details
   * @param {string} projectId - The project UUID
   * @returns {Array} Audit trail entries
   */
  async getAuditHistory(projectId) {
    try {
      logger.info('Getting audit history for company details', { projectId });
      
      const auditHistory = await companyRepository.getAuditHistory(projectId);
      
      logger.info('Audit history retrieved', { 
        projectId, 
        entryCount: auditHistory.length 
      });
      
      return auditHistory;
    } catch (error) {
      logger.error('Failed to get audit history', {
        projectId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate company details data
   * @param {Object} data - Company details data to validate
   * @returns {Object} Validation result with errors if any
   */
  validateCompanyDetails(data) {
    const errors = {};
    
    // Required field validations
    if (data.company_name !== undefined && data.company_name !== null && data.company_name.length > 255) {
      errors.company_name = 'Company name must be 255 characters or less';
    }
    
    if (data.industry !== undefined && data.industry !== null && data.industry.length > 255) {
      errors.industry = 'Industry must be 255 characters or less';
    }
    
    if (data.employee_count !== undefined && data.employee_count !== null) {
      const empCount = parseInt(data.employee_count);
      if (isNaN(empCount) || empCount < 0) {
        errors.employee_count = 'Employee count must be a positive number';
      }
    }
    
    if (data.founded !== undefined && data.founded !== null) {
      const foundedYear = parseInt(data.founded);
      if (isNaN(foundedYear) || foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
        errors.founded = 'Founded year must be a valid year between 1800 and current year';
      }
    }
    
    if (data.projections_year !== undefined && data.projections_year !== null) {
      const projYear = parseInt(data.projections_year);
      if (isNaN(projYear) || projYear < new Date().getFullYear()) {
        errors.projections_year = 'Projections year must be current year or later';
      }
    }
    
    // URL validation for company website
    if (data.company_website !== undefined && data.company_website !== null && data.company_website !== '') {
      try {
        new URL(data.company_website);
      } catch (e) {
        errors.company_website = 'Company website must be a valid URL';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Format company details for API response
   * @param {Object} companyDetails - Raw company details from database
   * @returns {Object} Formatted company details
   */
  formatForResponse(companyDetails) {
    if (!companyDetails) return null;
    
    return {
      id: companyDetails.id,
      project_id: companyDetails.project_id,
      company_name: companyDetails.company_name,
      industry: companyDetails.industry,
      fiscal_year_end: companyDetails.fiscal_year_end,
      reporting_currency: companyDetails.reporting_currency,
      region: companyDetails.region,
      country: companyDetails.country,
      employee_count: companyDetails.employee_count,
      founded: companyDetails.founded,
      company_website: companyDetails.company_website,
      business_case: companyDetails.business_case,
      notes: companyDetails.notes,
      projection_start_month: companyDetails.projection_start_month,
      projection_start_year: companyDetails.projection_start_year,
      projections_year: companyDetails.projections_year,
      version: companyDetails.version,
      created_at: companyDetails.created_at,
      updated_at: companyDetails.updated_at,
      last_modified: companyDetails.last_modified
    };
  }
}

module.exports = new CompanyService();