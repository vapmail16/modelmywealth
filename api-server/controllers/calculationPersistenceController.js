const calculationPersistenceService = require('../services/calculationPersistenceService');
const { asyncHandler } = require('../middleware/errorHandler');
const loggerService = require('../services/logger');
const logger = loggerService.logger;

class CalculationPersistenceController {
  /**
   * Create a new calculation run
   */
  createCalculationRun = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { calculationType, inputData, runName } = req.body;
    const userId = req.user.id;

    logger.info('Create calculation run request received', { 
      projectId, 
      calculationType, 
      userId,
      runName 
    });

    const { runId, startTime } = await calculationPersistenceService.createCalculationRun(
      projectId, 
      calculationType, 
      inputData, 
      userId, 
      runName
    );

    res.json({
      success: true,
      message: 'Calculation run created',
      data: {
        runId,
        calculationType,
        status: 'running',
        startTime
      }
    });
  });

  /**
   * Complete a calculation run
   */
  completeCalculationRun = asyncHandler(async (req, res) => {
    const { runId } = req.params;
    const { outputData, executionTime } = req.body;

    logger.info('Complete calculation run request received', { 
      runId, 
      hasOutputData: !!outputData 
    });

    const result = await calculationPersistenceService.completeCalculationRun(
      runId, 
      outputData, 
      executionTime
    );

    res.json({
      success: true,
      message: 'Calculation run completed',
      data: {
        runId,
        status: result.status,
        executionTime: result.execution_time_ms,
        completedAt: result.completed_at
      }
    });
  });

  /**
   * Fail a calculation run
   */
  failCalculationRun = asyncHandler(async (req, res) => {
    const { runId } = req.params;
    const { errorMessage } = req.body;

    logger.info('Fail calculation run request received', { 
      runId, 
      errorMessage 
    });

    const result = await calculationPersistenceService.failCalculationRun(runId, errorMessage);

    res.json({
      success: true,
      message: 'Calculation run marked as failed',
      data: {
        runId,
        status: result.status,
        errorMessage: result.error_message
      }
    });
  });

  /**
   * Save calculation iteration
   */
  saveIteration = asyncHandler(async (req, res) => {
    const { runId } = req.params;
    const { iterationNumber, inputChanges, outputChanges } = req.body;
    const userId = req.user.id;

    logger.info('Save iteration request received', { 
      runId, 
      iterationNumber, 
      userId 
    });

    const result = await calculationPersistenceService.saveIteration(
      runId, 
      iterationNumber, 
      inputChanges, 
      outputChanges, 
      userId
    );

    res.json({
      success: true,
      message: 'Iteration saved successfully',
      data: {
        runId,
        iterationNumber,
        iterationId: result.id
      }
    });
  });

  /**
   * Save calculation schedules
   */
  saveSchedules = asyncHandler(async (req, res) => {
    const { runId } = req.params;
    const { schedules } = req.body;

    logger.info('Save schedules request received', { 
      runId, 
      scheduleCount: schedules?.length 
    });

    const result = await calculationPersistenceService.saveCalculationSchedules(runId, schedules);

    res.json({
      success: true,
      message: 'Schedules saved successfully',
      data: {
        runId,
        savedCount: result.length,
        schedules: result
      }
    });
  });

  /**
   * Get calculation history for a project
   */
  getCalculationHistory = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { limit = 10 } = req.query;

    logger.info('Get calculation history request received', { 
      projectId, 
      limit 
    });

    const history = await calculationPersistenceService.getCalculationHistory(
      projectId, 
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        projectId,
        history,
        totalCount: history.length
      }
    });
  });

  /**
   * Get specific calculation run
   */
  getCalculationRun = asyncHandler(async (req, res) => {
    const { runId } = req.params;

    logger.info('Get calculation run request received', { runId });

    const run = await calculationPersistenceService.getCalculationRun(runId);

    res.json({
      success: true,
      data: run
    });
  });

  /**
   * Compare two calculation runs
   */
  compareCalculationRuns = asyncHandler(async (req, res) => {
    const { runId1, runId2 } = req.params;

    logger.info('Compare calculation runs request received', { runId1, runId2 });

    const comparison = await calculationPersistenceService.compareCalculationRuns(runId1, runId2);

    res.json({
      success: true,
      data: comparison
    });
  });

  /**
   * Clean old calculation runs
   */
  cleanOldRuns = asyncHandler(async (req, res) => {
    logger.info('Clean old runs request received');

    const deletedCount = await calculationPersistenceService.cleanOldRuns();

    res.json({
      success: true,
      message: 'Old calculation runs cleaned',
      data: {
        deletedCount
      }
    });
  });

  /**
   * Get calculation run statistics
   */
  getCalculationStats = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    logger.info('Get calculation stats request received', { projectId });

    // Get basic stats from calculation runs
    const statsQuery = `
      SELECT 
        COUNT(*) as total_runs,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_runs,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running_runs,
        AVG(execution_time_ms) as avg_execution_time,
        MAX(created_at) as last_run_date
      FROM calculation_runs 
      WHERE project_id = $1
    `;

    const db = require('../services/database');
    const result = await db.query(statsQuery, [projectId]);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        projectId,
        stats: {
          totalRuns: parseInt(stats.total_runs) || 0,
          completedRuns: parseInt(stats.completed_runs) || 0,
          failedRuns: parseInt(stats.failed_runs) || 0,
          runningRuns: parseInt(stats.running_runs) || 0,
          avgExecutionTime: parseFloat(stats.avg_execution_time) || 0,
          lastRunDate: stats.last_run_date
        }
      }
    });
  });
}

module.exports = new CalculationPersistenceController(); 