const autoSaveService = require('../services/autoSaveService');
const { asyncHandler } = require('../middleware/errorHandler');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class AutoSaveController {
  /**
   * Auto-save data for a section
   */
  autoSave = asyncHandler(async (req, res) => {
    const { projectId, section } = req.params;
    const { data } = req.body;
    const userId = req.user.id;

    logger.info('Auto-save request received', { 
      projectId, 
      section, 
      userId,
      dataKeys: Object.keys(data || {})
    });

    const result = await autoSaveService.autoSave(projectId, section, data, userId);

    res.json({
      success: true,
      message: 'Auto-save initiated',
      data: {
        section,
        status: 'pending',
        estimatedTime: '2 seconds'
      }
    });
  });

  /**
   * Force save data immediately
   */
  forceSave = asyncHandler(async (req, res) => {
    const { projectId, section } = req.params;
    const { data } = req.body;
    const userId = req.user.id;

    logger.info('Force save request received', { 
      projectId, 
      section, 
      userId 
    });

    const result = await autoSaveService.forceSave(projectId, section, data, userId);

    res.json({
      success: true,
      message: 'Data saved successfully',
      data: {
        section,
        recordId: result.id,
        version: result.version,
        lastModified: result.last_modified
      }
    });
  });

  /**
   * Get audit history for a section
   */
  getAuditHistory = asyncHandler(async (req, res) => {
    const { projectId, section } = req.params;
    const { limit = 50 } = req.query;

    logger.info('Audit history request received', { 
      projectId, 
      section, 
      limit 
    });

    const history = await autoSaveService.getAuditHistory(projectId, section, parseInt(limit));

    res.json({
      success: true,
      data: {
        section,
        history,
        totalCount: history.length
      }
    });
  });

  /**
   * Get field change history
   */
  getFieldHistory = asyncHandler(async (req, res) => {
    const { projectId, section, fieldName } = req.params;
    const { limit = 20 } = req.query;

    logger.info('Field history request received', { 
      projectId, 
      section, 
      fieldName, 
      limit 
    });

    const history = await autoSaveService.getFieldHistory(projectId, section, fieldName, parseInt(limit));

    res.json({
      success: true,
      data: {
        section,
        fieldName,
        history,
        totalCount: history.length
      }
    });
  });

  /**
   * Cancel pending saves for a project
   */
  cancelPendingSaves = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    logger.info('Cancel pending saves request received', { projectId });

    autoSaveService.cancelPendingSaves(projectId);

    res.json({
      success: true,
      message: 'Pending saves cancelled',
      data: {
        projectId,
        cancelled: true
      }
    });
  });

  /**
   * Get save status for a section
   */
  getSaveStatus = asyncHandler(async (req, res) => {
    const { projectId, section } = req.params;
    const key = `${projectId}-${section}`;
    
    const pendingSave = autoSaveService.pendingSaves.get(key);
    
    res.json({
      success: true,
      data: {
        section,
        hasPendingSave: !!pendingSave,
        estimatedTimeRemaining: pendingSave ? 
          Math.max(0, autoSaveService.debounceDelay - (Date.now() - pendingSave.timer._idleStart)) : 0
      }
    });
  });
}

module.exports = new AutoSaveController(); 