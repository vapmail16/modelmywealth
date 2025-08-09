const db = require('./database');
const loggerService = require('./logger');
const logger = loggerService.logger;

class CalculationPersistenceService {
  /**
   * Create a new calculation run
   */
  async createCalculationRun(projectId, calculationType, inputData, userId, runName = null) {
    const startTime = Date.now();
    
    try {
      const query = `
        INSERT INTO calculation_runs (
          project_id, 
          calculation_type, 
          input_data, 
          created_by, 
          run_name,
          status
        ) VALUES ($1, $2, $3, $4, $5, 'running')
        RETURNING *
      `;
      
      const result = await db.query(query, [
        projectId, 
        calculationType, 
        JSON.stringify(inputData), 
        userId,
        runName || `${calculationType}_run_${new Date().toISOString()}`
      ]);
      
      const runId = result.rows[0].id;
      logger.info('Calculation run created', { 
        runId, 
        projectId, 
        calculationType, 
        userId 
      });
      
      return { runId, startTime };
    } catch (error) {
      logger.error('Failed to create calculation run', { 
        projectId, 
        calculationType, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Complete a calculation run with results
   */
  async completeCalculationRun(runId, outputData, executionTime = null) {
    try {
      const query = `
        UPDATE calculation_runs 
        SET 
          output_data = $2,
          status = 'completed',
          completed_at = NOW(),
          execution_time_ms = $3
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [
        runId, 
        JSON.stringify(outputData), 
        executionTime || Date.now()
      ]);
      
      logger.info('Calculation run completed', { 
        runId, 
        executionTime: result.rows[0].execution_time_ms 
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to complete calculation run', { 
        runId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Fail a calculation run
   */
  async failCalculationRun(runId, errorMessage) {
    try {
      const query = `
        UPDATE calculation_runs 
        SET 
          status = 'failed',
          completed_at = NOW(),
          error_message = $2
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await db.query(query, [runId, errorMessage]);
      
      logger.error('Calculation run failed', { 
        runId, 
        errorMessage 
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to mark calculation run as failed', { 
        runId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save calculation iteration
   */
  async saveIteration(runId, iterationNumber, inputChanges, outputChanges, userId) {
    try {
      const query = `
        INSERT INTO calculation_iterations (
          calculation_run_id,
          iteration_number,
          input_changes,
          output_changes,
          created_by
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await db.query(query, [
        runId,
        iterationNumber,
        JSON.stringify(inputChanges),
        JSON.stringify(outputChanges),
        userId
      ]);
      
      logger.info('Calculation iteration saved', { 
        runId, 
        iterationNumber 
      });
      
      return result.rows[0];
    } catch (error) {
      logger.error('Failed to save calculation iteration', { 
        runId, 
        iterationNumber, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Save calculation schedules (monthly/quarterly/yearly data)
   */
  async saveCalculationSchedules(runId, schedules) {
    try {
      const values = [];
      const placeholders = [];
      let placeholderIndex = 1;
      
      schedules.forEach(schedule => {
        values.push(
          runId,
          schedule.type,
          schedule.month || null,
          schedule.year || null,
          JSON.stringify(schedule.data)
        );
        
        placeholders.push(`($${placeholderIndex}, $${placeholderIndex + 1}, $${placeholderIndex + 2}, $${placeholderIndex + 3}, $${placeholderIndex + 4})`);
        placeholderIndex += 5;
      });
      
      const query = `
        INSERT INTO calculation_schedules (
          calculation_run_id,
          schedule_type,
          month_number,
          year_number,
          schedule_data
        ) VALUES ${placeholders.join(', ')}
        RETURNING *
      `;
      
      const result = await db.query(query, values);
      
      logger.info('Calculation schedules saved', { 
        runId, 
        scheduleCount: schedules.length 
      });
      
      return result.rows;
    } catch (error) {
      logger.error('Failed to save calculation schedules', { 
        runId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get calculation run history for a project
   */
  async getCalculationHistory(projectId, limit = 10) {
    try {
      const query = `
        SELECT 
          cr.*,
          u.email as user_email,
          COUNT(ci.id) as iteration_count
        FROM calculation_runs cr
        LEFT JOIN users u ON cr.created_by = u.id
        LEFT JOIN calculation_iterations ci ON cr.id = ci.calculation_run_id
        WHERE cr.project_id = $1
        GROUP BY cr.id, u.email
        ORDER BY cr.created_at DESC
        LIMIT $2
      `;
      
      const result = await db.query(query, [projectId, limit]);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get calculation history', { 
        projectId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get specific calculation run with details
   */
  async getCalculationRun(runId) {
    try {
      // Get run details
      const runQuery = `
        SELECT 
          cr.*,
          u.email as user_email
        FROM calculation_runs cr
        LEFT JOIN users u ON cr.created_by = u.id
        WHERE cr.id = $1
      `;
      
      const runResult = await db.query(runQuery, [runId]);
      if (runResult.rows.length === 0) {
        throw new Error('Calculation run not found');
      }
      
      const run = runResult.rows[0];
      
      // Get iterations
      const iterationsQuery = `
        SELECT * FROM calculation_iterations 
        WHERE calculation_run_id = $1 
        ORDER BY iteration_number
      `;
      
      const iterationsResult = await db.query(iterationsQuery, [runId]);
      
      // Get schedules
      const schedulesQuery = `
        SELECT * FROM calculation_schedules 
        WHERE calculation_run_id = $1 
        ORDER BY year_number, month_number
      `;
      
      const schedulesResult = await db.query(schedulesQuery, [runId]);
      
      return {
        ...run,
        iterations: iterationsResult.rows,
        schedules: schedulesResult.rows
      };
    } catch (error) {
      logger.error('Failed to get calculation run', { 
        runId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Compare two calculation runs
   */
  async compareCalculationRuns(runId1, runId2) {
    try {
      const run1 = await this.getCalculationRun(runId1);
      const run2 = await this.getCalculationRun(runId2);
      
      // Compare input data
      const inputChanges = this.compareJsonData(run1.input_data, run2.input_data);
      
      // Compare output data
      const outputChanges = this.compareJsonData(run1.output_data, run2.output_data);
      
      return {
        run1: { id: run1.id, created_at: run1.created_at, user_email: run1.user_email },
        run2: { id: run2.id, created_at: run2.created_at, user_email: run2.user_email },
        inputChanges,
        outputChanges,
        executionTimeDiff: run2.execution_time_ms - run1.execution_time_ms
      };
    } catch (error) {
      logger.error('Failed to compare calculation runs', { 
        runId1, 
        runId2, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Compare JSON data and return differences
   */
  compareJsonData(data1, data2) {
    const changes = {};
    
    if (!data1 || !data2) {
      return changes;
    }
    
    const keys1 = Object.keys(data1);
    const keys2 = Object.keys(data2);
    const allKeys = [...new Set([...keys1, ...keys2])];
    
    allKeys.forEach(key => {
      const value1 = data1[key];
      const value2 = data2[key];
      
      if (value1 !== value2) {
        changes[key] = {
          from: value1,
          to: value2,
          type: value1 === undefined ? 'added' : value2 === undefined ? 'removed' : 'changed'
        };
      }
    });
    
    return changes;
  }

  /**
   * Clean old calculation runs (keep last 10)
   */
  async cleanOldRuns() {
    try {
      const query = `
        DELETE FROM calculation_runs 
        WHERE id NOT IN (
          SELECT id FROM calculation_runs 
          ORDER BY created_at DESC 
          LIMIT 10
        )
      `;
      
      const result = await db.query(query);
      
      logger.info('Cleaned old calculation runs', { 
        deletedCount: result.rowCount 
      });
      
      return result.rowCount;
    } catch (error) {
      logger.error('Failed to clean old calculation runs', { 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = new CalculationPersistenceService(); 