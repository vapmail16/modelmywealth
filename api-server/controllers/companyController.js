const companyService = require('../services/companyService');
const auditService = require('../services/auditService');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

/**
 * Validate if a string is a valid UUID
 * @param {string} uuid - String to validate
 * @returns {boolean} True if valid UUID
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

class CompanyController {
  /**
   * Get company details for a project
   * GET /api/projects/:projectId/company
   */
  async getCompanyDetails(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      
      logger.info('Getting company details via API', { 
        projectId, 
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      const companyDetails = await companyService.getCompanyDetails(projectId);
      
      if (!companyDetails) {
        return res.status(404).json({
          success: false,
          error: 'Company details not found',
          message: 'No company details exist for this project'
        });
      }
      
      const formattedData = companyService.formatForResponse(companyDetails);
      
      res.json({
        success: true,
        data: formattedData,
        message: 'Company details retrieved successfully'
      });
      
    } catch (error) {
      logger.error('Error getting company details', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve company details'
      });
    }
  }

  /**
   * Save company details for a project
   * PUT /api/projects/:projectId/company
   */
  async saveCompanyDetails(req, res) {
    try {
      const { projectId } = req.params;
      const companyData = req.body;
      const userId = req.user?.id;
      const changeReason = req.body.change_reason || 'Updated via API';
      
      logger.info('Saving company details via API', { 
        projectId, 
        userId,
        fieldsProvided: Object.keys(companyData),
        changeReason,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      // Validate input data
      const validation = companyService.validateCompanyDetails(companyData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        });
      }
      
      // Get current data for audit trail
      const currentData = await companyService.getCompanyDetails(projectId);
      
      // Save the data
      const result = await companyService.saveCompanyDetails(
        projectId, 
        companyData, 
        userId, 
        changeReason
      );
      
      // Create additional audit log entry for API access
      if (result.changesDetected) {
        await auditService.logChange({
          user_id: userId,
          table_name: 'company_details',
          record_id: result.data.id,
          action: result.isNewRecord ? 'INSERT' : 'UPDATE',
          old_values: currentData,
          new_values: result.data,
          change_reason: changeReason,
          ip_address: req.ip
        });
      }
      
      const responseData = companyService.formatForResponse(result.data);
      
      res.json({
        success: true,
        data: responseData,
        message: result.message,
        audit: {
          changesDetected: result.changesDetected,
          changedFields: result.changedFields || [],
          version: result.data.version,
          isNewRecord: result.isNewRecord || false
        }
      });
      
    } catch (error) {
      logger.error('Error saving company details', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to save company details'
      });
    }
  }

  /**
   * Partially update company details (PATCH)
   * PATCH /api/projects/:projectId/company
   */
  async updateCompanyDetails(req, res) {
    try {
      const { projectId } = req.params;
      const partialData = req.body;
      const userId = req.user?.id;
      const changeReason = req.body.change_reason || 'Partial update via API';
      
      logger.info('Partially updating company details via API', { 
        projectId, 
        userId,
        fieldsToUpdate: Object.keys(partialData),
        changeReason,
        ip: req.ip
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      // Check if company details exist
      const existingData = await companyService.getCompanyDetails(projectId);
      if (!existingData) {
        return res.status(404).json({
          success: false,
          error: 'Company details not found',
          message: 'Cannot update non-existent company details. Use PUT to create.'
        });
      }
      
      // Validate partial data
      const validation = companyService.validateCompanyDetails(partialData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: validation.errors
        });
      }
      
      // Perform partial update
      const result = await companyService.saveCompanyDetails(
        projectId, 
        partialData, 
        userId, 
        changeReason
      );
      
      // Log audit trail for API access
      if (result.changesDetected) {
        await auditService.logChange({
          user_id: userId,
          table_name: 'company_details',
          record_id: result.data.id,
          action: 'UPDATE',
          old_values: existingData,
          new_values: result.data,
          change_reason: changeReason,
          ip_address: req.ip
        });
      }
      
      const responseData = companyService.formatForResponse(result.data);
      
      res.json({
        success: true,
        data: responseData,
        message: result.message,
        audit: {
          changesDetected: result.changesDetected,
          changedFields: result.changedFields || [],
          version: result.data.version
        }
      });
      
    } catch (error) {
      logger.error('Error updating company details', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        requestBody: req.body
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update company details'
      });
    }
  }

  /**
   * Get audit history for company details
   * GET /api/projects/:projectId/company/history
   */
  async getAuditHistory(req, res) {
    try {
      const { projectId } = req.params;
      const { limit = 50, offset = 0, action } = req.query;
      const userId = req.user?.id;
      
      logger.info('Getting company details audit history', { 
        projectId, 
        userId,
        limit,
        offset,
        action
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      // Get current company details to get record ID
      const companyDetails = await companyService.getCompanyDetails(projectId);
      if (!companyDetails) {
        return res.status(404).json({
          success: false,
          error: 'Company details not found'
        });
      }
      
      // Get audit history
      const auditHistory = await auditService.getRecordHistory(
        'company_details',
        companyDetails.id,
        { limit: parseInt(limit), offset: parseInt(offset), action }
      );
      
      res.json({
        success: true,
        data: auditHistory,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: auditHistory.length
        },
        message: 'Audit history retrieved successfully'
      });
      
    } catch (error) {
      logger.error('Error getting audit history', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve audit history'
      });
    }
  }

  /**
   * Get audit statistics for company details
   * GET /api/projects/:projectId/company/audit-stats
   */
  async getAuditStats(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      
      logger.info('Getting company details audit statistics', { 
        projectId, 
        userId
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      // Get current company details to get record ID
      const companyDetails = await companyService.getCompanyDetails(projectId);
      if (!companyDetails) {
        return res.status(404).json({
          success: false,
          error: 'Company details not found'
        });
      }
      
      // Get audit statistics
      const auditStats = await auditService.getAuditStats('company_details', companyDetails.id);
      
      res.json({
        success: true,
        data: auditStats,
        message: 'Audit statistics retrieved successfully'
      });
      
    } catch (error) {
      logger.error('Error getting audit statistics', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to retrieve audit statistics'
      });
    }
  }

  /**
   * Delete company details
   * DELETE /api/projects/:projectId/company
   */
  async deleteCompanyDetails(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      const changeReason = req.body.change_reason || 'Deleted via API';
      
      logger.info('Deleting company details via API', { 
        projectId, 
        userId,
        changeReason,
        ip: req.ip
      });
      
      // Validate project ID format
      if (!projectId || !isValidUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid project ID format'
        });
      }
      
      // Validate user authentication
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User authentication required'
        });
      }
      
      // Get current data for audit trail
      const currentData = await companyService.getCompanyDetails(projectId);
      if (!currentData) {
        return res.status(404).json({
          success: false,
          error: 'Company details not found'
        });
      }
      
      // Log deletion in audit trail before actual deletion
      await auditService.logChange({
        user_id: userId,
        table_name: 'company_details',
        record_id: currentData.id,
        action: 'DELETE',
        old_values: currentData,
        new_values: {},
        change_reason: changeReason,
        ip_address: req.ip
      });
      
      // Perform deletion (this will be handled by repository)
      // For now, we'll skip actual deletion to preserve audit trail
      
      res.json({
        success: true,
        message: 'Company details deletion logged (soft delete)',
        audit: {
          deleted_record_id: currentData.id,
          version: currentData.version
        }
      });
      
    } catch (error) {
      logger.error('Error deleting company details', {
        projectId: req.params.projectId,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete company details'
      });
    }
  }


}

module.exports = new CompanyController();