const DatabaseService = require('../services/database');

class ConsolidatedRepository {
    constructor() {
        this.db = DatabaseService;
    }

    // Monthly Consolidated Methods
    async getMonthlyConsolidatedByProjectId(projectId, calculationRunId = null) {
        try {
            let query = `
                SELECT * FROM monthly_consolidated 
                WHERE project_id = $1
            `;
            let params = [projectId];

            if (calculationRunId) {
                query += ` AND calculation_run_id = $2`;
                params.push(calculationRunId);
                query += ` ORDER BY month, year`;
            } else {
                query += ` ORDER BY calculation_run_id DESC, month, year`;
            }

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting monthly consolidated data:', error);
            throw error;
        }
    }

    async createMonthlyConsolidated(data) {
        try {
            const query = `
                INSERT INTO monthly_consolidated (
                    project_id, month, year, month_name, revenue, cost_of_goods_sold, gross_profit,
                    operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                    income_tax_expense, net_income, cash, accounts_receivable, inventory,
                    other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                    senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                    net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                    repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                data.project_id, data.month, data.year, data.month_name,
                data.revenue, data.cost_of_goods_sold, data.gross_profit,
                data.operating_expenses, data.ebitda, data.depreciation,
                data.interest_expense, data.net_income_before_tax, data.income_tax_expense,
                data.net_income, data.cash, data.accounts_receivable, data.inventory,
                data.other_current_assets, data.ppe_net, data.other_assets, data.total_assets,
                data.accounts_payable, data.senior_secured, data.debt_tranche1, data.equity,
                data.retained_earning, data.total_equity_liability, data.net_cash_operating,
                data.capital_expenditures, data.net_cash_investing, data.proceeds_debt,
                data.repayment_debt, data.net_cash_financing, data.net_cash_flow, data.calculation_run_id
            ]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating monthly consolidated data:', error);
            throw error;
        }
    }

    async deleteMonthlyConsolidatedByProjectId(projectId) {
        try {
            const query = `DELETE FROM monthly_consolidated WHERE project_id = $1`;
            await this.db.query(query, [projectId]);
        } catch (error) {
            console.error('Error deleting monthly consolidated data:', error);
            throw error;
        }
    }

    async getMonthlyCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.created_at, cr.status, cr.run_description as description
                FROM calculation_runs cr
                INNER JOIN monthly_consolidated mc ON cr.id = mc.calculation_run_id
                WHERE mc.project_id = $1
                ORDER BY cr.created_at DESC
            `;
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting monthly calculation history:', error);
            throw error;
        }
    }

    // Quarterly Consolidated Methods
    async getQuarterlyConsolidatedByProjectId(projectId, calculationRunId = null) {
        try {
            let query = `
                SELECT * FROM quarterly_consolidated 
                WHERE project_id = $1
            `;
            let params = [projectId];

            if (calculationRunId) {
                query += ` AND calculation_run_id = $2`;
                params.push(calculationRunId);
                query += ` ORDER BY year, quarter`;
            } else {
                query += ` ORDER BY calculation_run_id DESC, year, quarter`;
            }

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting quarterly consolidated data:', error);
            throw error;
        }
    }

    async createQuarterlyConsolidated(data) {
        try {
            const query = `
                INSERT INTO quarterly_consolidated (
                    project_id, quarter, year, quarter_name, revenue, cost_of_goods_sold, gross_profit,
                    operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                    income_tax_expense, net_income, cash, accounts_receivable, inventory,
                    other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                    senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                    net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                    repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                data.project_id, data.quarter, data.year, data.quarter_name,
                data.revenue, data.cost_of_goods_sold, data.gross_profit,
                data.operating_expenses, data.ebitda, data.depreciation,
                data.interest_expense, data.net_income_before_tax, data.income_tax_expense,
                data.net_income, data.cash, data.accounts_receivable, data.inventory,
                data.other_current_assets, data.ppe_net, data.other_assets, data.total_assets,
                data.accounts_payable, data.senior_secured, data.debt_tranche1, data.equity,
                data.retained_earning, data.total_equity_liability, data.net_cash_operating,
                data.capital_expenditures, data.net_cash_investing, data.proceeds_debt,
                data.repayment_debt, data.net_cash_financing, data.net_cash_flow, data.calculation_run_id
            ]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating quarterly consolidated data:', error);
            throw error;
        }
    }

    async deleteQuarterlyConsolidatedByProjectId(projectId) {
        try {
            const query = `DELETE FROM quarterly_consolidated WHERE project_id = $1`;
            await this.db.query(query, [projectId]);
        } catch (error) {
            console.error('Error deleting quarterly consolidated data:', error);
            throw error;
        }
    }

    async getQuarterlyCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.created_at, cr.status, cr.run_description as description
                FROM calculation_runs cr
                INNER JOIN quarterly_consolidated qc ON cr.id = qc.calculation_run_id
                WHERE qc.project_id = $1
                ORDER BY cr.created_at DESC
            `;
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting quarterly calculation history:', error);
            throw error;
        }
    }

    // Yearly Consolidated Methods
    async getYearlyConsolidatedByProjectId(projectId, calculationRunId = null) {
        try {
            let query = `
                SELECT * FROM yearly_consolidated 
                WHERE project_id = $1
            `;
            let params = [projectId];

            if (calculationRunId) {
                query += ` AND calculation_run_id = $2`;
                params.push(calculationRunId);
                query += ` ORDER BY year`;
            } else {
                query += ` ORDER BY calculation_run_id DESC, year`;
            }

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error getting yearly consolidated data:', error);
            throw error;
        }
    }

    async createYearlyConsolidated(data) {
        try {
            const query = `
                INSERT INTO yearly_consolidated (
                    project_id, year, revenue, cost_of_goods_sold, gross_profit,
                    operating_expenses, ebitda, depreciation, interest_expense, net_income_before_tax,
                    income_tax_expense, net_income, cash, accounts_receivable, inventory,
                    other_current_assets, ppe_net, other_assets, total_assets, accounts_payable,
                    senior_secured, debt_tranche1, equity, retained_earning, total_equity_liability,
                    net_cash_operating, capital_expenditures, net_cash_investing, proceeds_debt,
                    repayment_debt, net_cash_financing, net_cash_flow, calculation_run_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                data.project_id, data.year,
                data.revenue, data.cost_of_goods_sold, data.gross_profit,
                data.operating_expenses, data.ebitda, data.depreciation,
                data.interest_expense, data.net_income_before_tax, data.income_tax_expense,
                data.net_income, data.cash, data.accounts_receivable, data.inventory,
                data.other_current_assets, data.ppe_net, data.other_assets, data.total_assets,
                data.accounts_payable, data.senior_secured, data.debt_tranche1, data.equity,
                data.retained_earning, data.total_equity_liability, data.net_cash_operating,
                data.capital_expenditures, data.net_cash_investing, data.proceeds_debt,
                data.repayment_debt, data.net_cash_financing, data.net_cash_flow, data.calculation_run_id
            ]);
            
            return result.rows[0];
        } catch (error) {
            console.error('Error creating yearly consolidated data:', error);
            throw error;
        }
    }

    async deleteYearlyConsolidatedByProjectId(projectId) {
        try {
            const query = `DELETE FROM yearly_consolidated WHERE project_id = $1`;
            await this.db.query(query, [projectId]);
        } catch (error) {
            console.error('Error deleting yearly consolidated data:', error);
            throw error;
        }
    }

    async getYearlyCalculationHistory(projectId) {
        try {
            const query = `
                SELECT DISTINCT cr.id, cr.created_at, cr.status, cr.run_description as description
                FROM calculation_runs cr
                INNER JOIN yearly_consolidated yc ON cr.id = yc.calculation_run_id
                WHERE yc.project_id = $1
                ORDER BY cr.created_at DESC
            `;
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting yearly calculation history:', error);
            throw error;
        }
    }

    // Generic calculation run methods
    async getCalculationRun(runId) {
        try {
            const query = `SELECT * FROM calculation_runs WHERE id = $1`;
            const result = await this.db.query(query, [runId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting calculation run:', error);
            throw error;
        }
    }

    async createCalculationRun(data) {
        try {
            const query = `
                INSERT INTO calculation_runs (project_id, run_name, calculation_type, status, run_description, input_data)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await this.db.query(query, [
                data.project_id, 
                data.run_name || `${data.type} calculation`, 
                data.type, 
                data.status, 
                data.description,
                data.input_data || {}
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating calculation run:', error);
            throw error;
        }
    }

    async updateCalculationRun(runId, data) {
        try {
            const query = `
                UPDATE calculation_runs 
                SET status = $1, run_description = $2, completed_at = NOW()
                WHERE id = $3
                RETURNING *
            `;
            const result = await this.db.query(query, [data.status, data.description, runId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating calculation run:', error);
            throw error;
        }
    }

    // Additional methods for validation
    async getDebtCalculationsByProjectId(projectId) {
        try {
            const query = `SELECT * FROM debt_calculations WHERE project_id = $1 ORDER BY month`;
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting debt calculations:', error);
            throw error;
        }
    }

    async getDepreciationScheduleByProjectId(projectId) {
        try {
            const query = `SELECT * FROM depreciation_schedule WHERE project_id = $1 ORDER BY month`;
            const result = await this.db.query(query, [projectId]);
            return result.rows;
        } catch (error) {
            console.error('Error getting depreciation schedule:', error);
            throw error;
        }
    }
}

module.exports = new ConsolidatedRepository(); 