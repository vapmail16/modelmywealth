const DatabaseService = require('../services/database');

class KpiRepository {
    constructor() {
        this.db = DatabaseService;
    }

    // Monthly KPIs
    async getMonthlyKpisByProjectId(projectId, calculationRunId = null) {
        try {
            let query, params;
            
            if (calculationRunId) {
                query = `
                    SELECT * FROM monthly_kpis 
                    WHERE project_id = $1 AND calculation_run_id = $2 
                    ORDER BY year, month
                `;
                params = [projectId, calculationRunId];
            } else {
                query = `
                    SELECT mk.* FROM monthly_kpis mk
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM monthly_kpis 
                        WHERE project_id = $1 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON mk.calculation_run_id = latest.calculation_run_id
                    WHERE mk.project_id = $1 
                    ORDER BY mk.year, mk.month
                `;
                params = [projectId];
            }
            
            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    async getMonthlyKpiCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.calculation_type, cr.run_description as description, 
                       cr.run_name, cr.status, cr.created_at, cr.completed_at,
                       COUNT(mk.id) as record_count
                FROM calculation_runs cr
                LEFT JOIN monthly_kpis mk ON cr.id = mk.calculation_run_id
                WHERE cr.project_id = $1 AND cr.calculation_type = 'monthly_kpis'
                GROUP BY cr.id, cr.calculation_type, cr.run_description, cr.run_name, cr.status, cr.created_at, cr.completed_at
                ORDER BY cr.created_at DESC
            `;
            
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    // Quarterly KPIs
    async getQuarterlyKpisByProjectId(projectId, calculationRunId = null) {
        try {
            let query, params;
            
            if (calculationRunId) {
                query = `
                    SELECT * FROM quarterly_kpis 
                    WHERE project_id = $1 AND calculation_run_id = $2 
                    ORDER BY year, quarter
                `;
                params = [projectId, calculationRunId];
            } else {
                query = `
                    SELECT qk.* FROM quarterly_kpis qk
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM quarterly_kpis 
                        WHERE project_id = $1 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON qk.calculation_run_id = latest.calculation_run_id
                    WHERE qk.project_id = $1 
                    ORDER BY qk.year, qk.quarter
                `;
                params = [projectId];
            }
            
            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    async getQuarterlyKpiCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.calculation_type, cr.run_description as description, 
                       cr.run_name, cr.status, cr.created_at, cr.completed_at,
                       COUNT(qk.id) as record_count
                FROM calculation_runs cr
                LEFT JOIN quarterly_kpis qk ON cr.id = qk.calculation_run_id
                WHERE cr.project_id = $1 AND cr.calculation_type = 'quarterly_kpis'
                GROUP BY cr.id, cr.calculation_type, cr.run_description, cr.run_name, cr.status, cr.created_at, cr.completed_at
                ORDER BY cr.created_at DESC
            `;
            
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    // Yearly KPIs
    async getYearlyKpisByProjectId(projectId, calculationRunId = null) {
        try {
            let query, params;
            
            if (calculationRunId) {
                query = `
                    SELECT * FROM yearly_kpis 
                    WHERE project_id = $1 AND calculation_run_id = $2 
                    ORDER BY year
                `;
                params = [projectId, calculationRunId];
            } else {
                query = `
                    SELECT yk.* FROM yearly_kpis yk
                    INNER JOIN (
                        SELECT calculation_run_id 
                        FROM yearly_kpis 
                        WHERE project_id = $1 
                        ORDER BY calculation_run_id DESC 
                        LIMIT 1
                    ) latest ON yk.calculation_run_id = latest.calculation_run_id
                    WHERE yk.project_id = $1 
                    ORDER BY yk.year
                `;
                params = [projectId];
            }
            
            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    async getYearlyKpiCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.calculation_type, cr.run_description as description, 
                       cr.run_name, cr.status, cr.created_at, cr.completed_at,
                       COUNT(yk.id) as record_count
                FROM calculation_runs cr
                LEFT JOIN yearly_kpis yk ON cr.id = yk.calculation_run_id
                WHERE cr.project_id = $1 AND cr.calculation_type = 'yearly_kpis'
                GROUP BY cr.id, cr.calculation_type, cr.run_description, cr.run_name, cr.status, cr.created_at, cr.completed_at
                ORDER BY cr.created_at DESC
            `;
            
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    // Calculation Run Management
    async createCalculationRun(data) {
        try {
            const query = `
                INSERT INTO calculation_runs (
                    project_id, calculation_type, status, run_description, 
                    run_name, input_data, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
                RETURNING *
            `;
            
            const values = [
                data.project_id,
                data.calculation_type,
                data.status,
                data.description,
                data.run_name,
                JSON.stringify(data.input_data)
            ];
            
            const result = await this.db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    async updateCalculationRun(id, data) {
        try {
            const query = `
                UPDATE calculation_runs 
                SET status = $1, run_description = $2, completed_at = NOW()
                WHERE id = $3
                RETURNING *
            `;
            
            const values = [data.status, data.description, id];
            const result = await this.db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    async getCalculationRunById(id) {
        try {
            const query = `SELECT * FROM calculation_runs WHERE id = $1`;
            const result = await this.db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }

    // Delete operations
    async deleteKpisByProjectId(projectId) {
        try {
            await this.db.query('DELETE FROM monthly_kpis WHERE project_id = $1', [projectId]);
            await this.db.query('DELETE FROM quarterly_kpis WHERE project_id = $1', [projectId]);
            await this.db.query('DELETE FROM yearly_kpis WHERE project_id = $1', [projectId]);
        } catch (error) {
            throw new Error(`Database query error: ${error.message}`);
        }
    }
}

module.exports = new KpiRepository(); 