const db = require('../services/database');

class ProjectRepository {
  async getUserProjects(userId, companyId = null) {
    let query = "SELECT * FROM projects WHERE user_id = $1";
    let params = [userId];
    
    if (companyId) {
      query += " AND company_id = $2";
      params.push(companyId);
    }
    
    query += " ORDER BY created_at DESC";
    const result = await db.query(query, params);
    return result.rows;
  }

  async getProjectById(projectId, userId) {
    const query = `
      SELECT * FROM projects 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
  }

  async createProject(projectData, userId) {
    const query = `
      INSERT INTO projects (name, description, user_id, company_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(query, [
      projectData.name,
      projectData.description,
      userId,
      projectData.company_id
    ]);
    return result.rows[0];
  }

  async updateProject(projectId, projectData, userId) {
    const query = `
      UPDATE projects 
      SET name = $2, description = $3, updated_at = NOW()
      WHERE id = $1 AND user_id = $4
      RETURNING *
    `;
    const result = await db.query(query, [
      projectId,
      projectData.name,
      projectData.description,
      userId
    ]);
    return result.rows[0];
  }

  async deleteProject(projectId, userId) {
    const query = `
      DELETE FROM projects 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [projectId, userId]);
    return result.rows[0];
  }

  async getProjectData(projectId, userId) {
    // Verify project ownership
    const projectQuery = `
      SELECT * FROM projects WHERE id = $1 AND user_id = $2
    `;
    const projectResult = await db.query(projectQuery, [projectId, userId]);
    
    if (projectResult.rows.length === 0) {
      return null;
    }

    // Fetch all related data
    const [
      companyDetails,
      profitLossData,
      balanceSheetData,
      debtStructureData,
      growthAssumptionsData,
      workingCapitalData,
      seasonalityData,
      cashFlowData
    ] = await Promise.all([
      db.query("SELECT * FROM company_details WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM profit_loss_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM balance_sheet_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM debt_structure_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM growth_assumptions_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM working_capital_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM seasonality_data WHERE project_id = $1", [projectId]),
      db.query("SELECT * FROM cash_flow_data WHERE project_id = $1", [projectId])
    ]);

    return {
      project: projectResult.rows[0],
      companyDetails: companyDetails.rows[0] || null,
      profitLossData: profitLossData.rows[0] || null,
      balanceSheetData: balanceSheetData.rows[0] || null,
      debtStructureData: debtStructureData.rows[0] || null,
      growthAssumptionsData: growthAssumptionsData.rows[0] || null,
      workingCapitalData: workingCapitalData.rows[0] || null,
      seasonalityData: seasonalityData.rows[0] || null,
      cashFlowData: cashFlowData.rows[0] || null
    };
  }

  async updateProjectData(projectId, userId, data) {
    // Verify project ownership
    const projectQuery = `
      SELECT * FROM projects WHERE id = $1 AND user_id = $2
    `;
    const projectResult = await db.query(projectQuery, [projectId, userId]);
    
    if (projectResult.rows.length === 0) {
      return null;
    }

    const updates = [];

    // Update company details - use UPDATE to preserve existing data
    if (data.companyDetails) {
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      // Build dynamic UPDATE query for only provided fields
      if (data.companyDetails.company_name !== undefined) {
        updateFields.push(`company_name = $${paramIndex}`);
        values.push(data.companyDetails.company_name);
        paramIndex++;
      }
      if (data.companyDetails.industry !== undefined) {
        updateFields.push(`industry = $${paramIndex}`);
        values.push(data.companyDetails.industry);
        paramIndex++;
      }
      if (data.companyDetails.fiscal_year_end !== undefined) {
        updateFields.push(`fiscal_year_end = $${paramIndex}`);
        values.push(data.companyDetails.fiscal_year_end);
        paramIndex++;
      }
      if (data.companyDetails.reporting_currency !== undefined) {
        updateFields.push(`reporting_currency = $${paramIndex}`);
        values.push(data.companyDetails.reporting_currency);
        paramIndex++;
      }
      if (data.companyDetails.region !== undefined) {
        updateFields.push(`region = $${paramIndex}`);
        values.push(data.companyDetails.region);
        paramIndex++;
      }
      if (data.companyDetails.country !== undefined) {
        updateFields.push(`country = $${paramIndex}`);
        values.push(data.companyDetails.country);
        paramIndex++;
      }
      if (data.companyDetails.employee_count !== undefined) {
        updateFields.push(`employee_count = $${paramIndex}`);
        values.push(data.companyDetails.employee_count);
        paramIndex++;
      }
      if (data.companyDetails.founded !== undefined) {
        updateFields.push(`founded = $${paramIndex}`);
        values.push(data.companyDetails.founded);
        paramIndex++;
      }
      if (data.companyDetails.company_website !== undefined) {
        updateFields.push(`company_website = $${paramIndex}`);
        values.push(data.companyDetails.company_website);
        paramIndex++;
      }
      if (data.companyDetails.business_case !== undefined) {
        updateFields.push(`business_case = $${paramIndex}`);
        values.push(data.companyDetails.business_case);
        paramIndex++;
      }
      if (data.companyDetails.notes !== undefined) {
        updateFields.push(`notes = $${paramIndex}`);
        values.push(data.companyDetails.notes);
        paramIndex++;
      }
      if (data.companyDetails.projection_start_month !== undefined) {
        updateFields.push(`projection_start_month = $${paramIndex}`);
        values.push(data.companyDetails.projection_start_month);
        paramIndex++;
      }
      if (data.companyDetails.projection_start_year !== undefined) {
        updateFields.push(`projection_start_year = $${paramIndex}`);
        values.push(data.companyDetails.projection_start_year);
        paramIndex++;
      }
      if (data.companyDetails.projections_year !== undefined) {
        updateFields.push(`projections_year = $${paramIndex}`);
        values.push(data.companyDetails.projections_year);
        paramIndex++;
      }

      if (updateFields.length > 0) {
        // Always update audit fields
        updateFields.push(`updated_by = $${paramIndex}`, `change_reason = $${paramIndex + 1}`, `updated_at = NOW()`, `version = COALESCE(version, 0) + 1`);
        values.push(userId, data.companyDetails.change_reason || 'Updated via data entry form');
        values.push(projectId); // WHERE clause parameter

        updates.push(
          db.query(
            `UPDATE company_details SET ${updateFields.join(', ')} WHERE project_id = $${paramIndex + 2}`,
            values
          )
        );
      }
    }

    // Update profit & loss data
    if (data.profitLossData) {
      updates.push(
        db.query(
          `INSERT INTO profit_loss_data (
             project_id, revenue, cogs, operating_expenses, ebitda, depreciation, 
             amortization, ebit, interest_expense, ebt, taxes, net_income, tax_rates,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (project_id) DO UPDATE SET
           revenue = EXCLUDED.revenue,
           cogs = EXCLUDED.cogs,
           operating_expenses = EXCLUDED.operating_expenses,
           ebitda = EXCLUDED.ebitda,
           depreciation = EXCLUDED.depreciation,
           amortization = EXCLUDED.amortization,
           ebit = EXCLUDED.ebit,
           interest_expense = EXCLUDED.interest_expense,
           ebt = EXCLUDED.ebt,
           taxes = EXCLUDED.taxes,
           net_income = EXCLUDED.net_income,
           tax_rates = EXCLUDED.tax_rates,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(profit_loss_data.version, 0) + 1`,
          [
            projectId, 
            data.profitLossData.revenue, 
            data.profitLossData.cogs,
            data.profitLossData.operating_expenses, 
            data.profitLossData.ebitda,
            data.profitLossData.depreciation,
            data.profitLossData.amortization || 0, // Default to 0 if not provided
            data.profitLossData.ebit,
            data.profitLossData.interest_expense,
            data.profitLossData.pretax_income, // Frontend sends pretax_income, maps to ebt
            data.profitLossData.taxes,
            data.profitLossData.net_income,
            data.profitLossData.tax_rates,
            userId, // created_by
            userId, // updated_by
            data.profitLossData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }

    // Update balance sheet data
    if (data.balanceSheetData) {
      updates.push(
        db.query(
          `INSERT INTO balance_sheet_data (
             project_id, cash, accounts_receivable, inventory, prepaid_expenses, other_current_assets,
             total_current_assets, ppe, intangible_assets, goodwill, other_assets, total_assets,
             accounts_payable, accrued_expenses, short_term_debt, other_current_liabilities,
             total_current_liabilities, long_term_debt, other_liabilities, total_liabilities,
             common_stock, retained_earnings, other_equity, total_equity, total_liabilities_equity,
             capital_expenditure_additions, asset_depreciated_over_years,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
           ON CONFLICT (project_id) DO UPDATE SET
           cash = EXCLUDED.cash,
           accounts_receivable = EXCLUDED.accounts_receivable,
           inventory = EXCLUDED.inventory,
           other_current_assets = EXCLUDED.other_current_assets,
           ppe = EXCLUDED.ppe,
           other_assets = EXCLUDED.other_assets,
           total_assets = EXCLUDED.total_assets,
           accounts_payable = EXCLUDED.accounts_payable,
           short_term_debt = EXCLUDED.short_term_debt,
           long_term_debt = EXCLUDED.long_term_debt,
           common_stock = EXCLUDED.common_stock,
           retained_earnings = EXCLUDED.retained_earnings,
           total_liabilities_equity = EXCLUDED.total_liabilities_equity,
           capital_expenditure_additions = EXCLUDED.capital_expenditure_additions,
           asset_depreciated_over_years = EXCLUDED.asset_depreciated_over_years,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(balance_sheet_data.version, 0) + 1`,
          [
            projectId,
            data.balanceSheetData.cash,
            data.balanceSheetData.accounts_receivable,
            data.balanceSheetData.inventory,
            data.balanceSheetData.prepaid_expenses || 0,
            data.balanceSheetData.other_current_assets,
            data.balanceSheetData.total_current_assets || 0,
            data.balanceSheetData.ppe,
            data.balanceSheetData.intangible_assets || 0,
            data.balanceSheetData.goodwill || 0,
            data.balanceSheetData.other_assets,
            data.balanceSheetData.total_assets,
            data.balanceSheetData.accounts_payable_provisions, // Frontend field name maps to accounts_payable
            data.balanceSheetData.accrued_expenses || 0,
            data.balanceSheetData.short_term_debt,
            data.balanceSheetData.other_current_liabilities || 0,
            data.balanceSheetData.total_current_liabilities || 0,
            data.balanceSheetData.other_long_term_debt, // Frontend sends other_long_term_debt, maps to long_term_debt
            data.balanceSheetData.other_liabilities || 0,
            data.balanceSheetData.total_liabilities || 0,
            data.balanceSheetData.equity, // Frontend sends equity, maps to common_stock
            data.balanceSheetData.retained_earnings,
            data.balanceSheetData.other_equity || 0,
            data.balanceSheetData.total_equity || 0,
            data.balanceSheetData.total_liabilities_and_equity,
            data.balanceSheetData.capital_expenditure_additions,
            data.balanceSheetData.asset_depreciated_over_years,
            userId, // created_by
            userId, // updated_by
            data.balanceSheetData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }

    // Add remaining table updates
    await this.updateRemainingTables(projectId, userId, data, updates);
    await this.updateComplexTables(projectId, userId, data, updates);
    
    await Promise.all(updates);
    return this.getProjectData(projectId, userId);
  }

  async updateRemainingTables(projectId, userId, data, updates) {
    // Update debt structure data
    if (data.debtStructureData) {
      updates.push(
        db.query(
          `INSERT INTO debt_structure_data (
             project_id, senior_secured_loan_type, additional_loan_senior_secured, bank_base_rate_senior_secured,
             liquidity_premiums_senior_secured, credit_risk_premiums_senior_secured,
             maturity_y_senior_secured, amortization_y_senior_secured,
             short_term_loan_type, additional_loan_short_term, bank_base_rate_short_term,
             liquidity_premiums_short_term, credit_risk_premiums_short_term,
             maturity_y_short_term, amortization_y_short_term,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
           ON CONFLICT (project_id) DO UPDATE SET
           senior_secured_loan_type = EXCLUDED.senior_secured_loan_type,
           additional_loan_senior_secured = EXCLUDED.additional_loan_senior_secured,
           bank_base_rate_senior_secured = EXCLUDED.bank_base_rate_senior_secured,
           liquidity_premiums_senior_secured = EXCLUDED.liquidity_premiums_senior_secured,
           credit_risk_premiums_senior_secured = EXCLUDED.credit_risk_premiums_senior_secured,
           maturity_y_senior_secured = EXCLUDED.maturity_y_senior_secured,
           amortization_y_senior_secured = EXCLUDED.amortization_y_senior_secured,
           short_term_loan_type = EXCLUDED.short_term_loan_type,
           additional_loan_short_term = EXCLUDED.additional_loan_short_term,
           bank_base_rate_short_term = EXCLUDED.bank_base_rate_short_term,
           liquidity_premiums_short_term = EXCLUDED.liquidity_premiums_short_term,
           credit_risk_premiums_short_term = EXCLUDED.credit_risk_premiums_short_term,
           maturity_y_short_term = EXCLUDED.maturity_y_short_term,
           amortization_y_short_term = EXCLUDED.amortization_y_short_term,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(debt_structure_data.version, 0) + 1`,
          [
            projectId,
            data.debtStructureData.senior_secured_loan_type,
            data.debtStructureData.additional_loan_senior_secured,
            data.debtStructureData.bank_base_rate_senior_secured,
            data.debtStructureData.liquidity_premiums_senior_secured,
            data.debtStructureData.credit_risk_premiums_senior_secured,
            data.debtStructureData.maturity_y_senior_secured,
            data.debtStructureData.amortization_y_senior_secured,
            data.debtStructureData.short_term_loan_type,
            data.debtStructureData.additional_loan_short_term,
            data.debtStructureData.bank_base_rate_short_term,
            data.debtStructureData.liquidity_premiums_short_term,
            data.debtStructureData.credit_risk_premiums_short_term,
            data.debtStructureData.maturity_y_short_term,
            data.debtStructureData.amortization_y_short_term,
            userId, // created_by
            userId, // updated_by
            data.debtStructureData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }

    // Update working capital data
    if (data.workingCapitalData) {
      updates.push(
        db.query(
          `INSERT INTO working_capital_data (
             project_id, account_receivable_percent, inventory_percent, 
             other_current_assets_percent, accounts_payable_percent,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (project_id) DO UPDATE SET
           account_receivable_percent = EXCLUDED.account_receivable_percent,
           inventory_percent = EXCLUDED.inventory_percent,
           other_current_assets_percent = EXCLUDED.other_current_assets_percent,
           accounts_payable_percent = EXCLUDED.accounts_payable_percent,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(working_capital_data.version, 0) + 1`,
          [
            projectId,
            data.workingCapitalData.account_receivable_percent,
            data.workingCapitalData.inventory_percent,
            data.workingCapitalData.other_current_assets_percent,
            data.workingCapitalData.accounts_payable_percent,
            userId, // created_by
            userId, // updated_by
            data.workingCapitalData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }
  }

  async updateComplexTables(projectId, userId, data, updates) {
    // Update growth assumptions data
    if (data.growthAssumptionsData) {
      updates.push(
        db.query(
          `INSERT INTO growth_assumptions_data (
             project_id, 
             gr_revenue_1, gr_revenue_2, gr_revenue_3, gr_revenue_4, gr_revenue_5, gr_revenue_6,
             gr_revenue_7, gr_revenue_8, gr_revenue_9, gr_revenue_10, gr_revenue_11, gr_revenue_12,
             gr_cost_1, gr_cost_2, gr_cost_3, gr_cost_4, gr_cost_5, gr_cost_6,
             gr_cost_7, gr_cost_8, gr_cost_9, gr_cost_10, gr_cost_11, gr_cost_12,
             gr_cost_oper_1, gr_cost_oper_2, gr_cost_oper_3, gr_cost_oper_4, gr_cost_oper_5, gr_cost_oper_6,
             gr_cost_oper_7, gr_cost_oper_8, gr_cost_oper_9, gr_cost_oper_10, gr_cost_oper_11, gr_cost_oper_12,
             gr_capex_1, gr_capex_2, gr_capex_3, gr_capex_4, gr_capex_5, gr_capex_6,
             gr_capex_7, gr_capex_8, gr_capex_9, gr_capex_10, gr_capex_11, gr_capex_12,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52)
           ON CONFLICT (project_id) DO UPDATE SET
           gr_revenue_1 = EXCLUDED.gr_revenue_1, gr_revenue_2 = EXCLUDED.gr_revenue_2, gr_revenue_3 = EXCLUDED.gr_revenue_3,
           gr_revenue_4 = EXCLUDED.gr_revenue_4, gr_revenue_5 = EXCLUDED.gr_revenue_5, gr_revenue_6 = EXCLUDED.gr_revenue_6,
           gr_revenue_7 = EXCLUDED.gr_revenue_7, gr_revenue_8 = EXCLUDED.gr_revenue_8, gr_revenue_9 = EXCLUDED.gr_revenue_9,
           gr_revenue_10 = EXCLUDED.gr_revenue_10, gr_revenue_11 = EXCLUDED.gr_revenue_11, gr_revenue_12 = EXCLUDED.gr_revenue_12,
           gr_cost_1 = EXCLUDED.gr_cost_1, gr_cost_2 = EXCLUDED.gr_cost_2, gr_cost_3 = EXCLUDED.gr_cost_3,
           gr_cost_4 = EXCLUDED.gr_cost_4, gr_cost_5 = EXCLUDED.gr_cost_5, gr_cost_6 = EXCLUDED.gr_cost_6,
           gr_cost_7 = EXCLUDED.gr_cost_7, gr_cost_8 = EXCLUDED.gr_cost_8, gr_cost_9 = EXCLUDED.gr_cost_9,
           gr_cost_10 = EXCLUDED.gr_cost_10, gr_cost_11 = EXCLUDED.gr_cost_11, gr_cost_12 = EXCLUDED.gr_cost_12,
           gr_cost_oper_1 = EXCLUDED.gr_cost_oper_1, gr_cost_oper_2 = EXCLUDED.gr_cost_oper_2, gr_cost_oper_3 = EXCLUDED.gr_cost_oper_3,
           gr_cost_oper_4 = EXCLUDED.gr_cost_oper_4, gr_cost_oper_5 = EXCLUDED.gr_cost_oper_5, gr_cost_oper_6 = EXCLUDED.gr_cost_oper_6,
           gr_cost_oper_7 = EXCLUDED.gr_cost_oper_7, gr_cost_oper_8 = EXCLUDED.gr_cost_oper_8, gr_cost_oper_9 = EXCLUDED.gr_cost_oper_9,
           gr_cost_oper_10 = EXCLUDED.gr_cost_oper_10, gr_cost_oper_11 = EXCLUDED.gr_cost_oper_11, gr_cost_oper_12 = EXCLUDED.gr_cost_oper_12,
           gr_capex_1 = EXCLUDED.gr_capex_1, gr_capex_2 = EXCLUDED.gr_capex_2, gr_capex_3 = EXCLUDED.gr_capex_3,
           gr_capex_4 = EXCLUDED.gr_capex_4, gr_capex_5 = EXCLUDED.gr_capex_5, gr_capex_6 = EXCLUDED.gr_capex_6,
           gr_capex_7 = EXCLUDED.gr_capex_7, gr_capex_8 = EXCLUDED.gr_capex_8, gr_capex_9 = EXCLUDED.gr_capex_9,
           gr_capex_10 = EXCLUDED.gr_capex_10, gr_capex_11 = EXCLUDED.gr_capex_11, gr_capex_12 = EXCLUDED.gr_capex_12,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(growth_assumptions_data.version, 0) + 1`,
          [
            projectId,
            data.growthAssumptionsData.gr_revenue_1, data.growthAssumptionsData.gr_revenue_2, data.growthAssumptionsData.gr_revenue_3,
            data.growthAssumptionsData.gr_revenue_4, data.growthAssumptionsData.gr_revenue_5, data.growthAssumptionsData.gr_revenue_6,
            data.growthAssumptionsData.gr_revenue_7, data.growthAssumptionsData.gr_revenue_8, data.growthAssumptionsData.gr_revenue_9,
            data.growthAssumptionsData.gr_revenue_10, data.growthAssumptionsData.gr_revenue_11, data.growthAssumptionsData.gr_revenue_12,
            data.growthAssumptionsData.gr_cost_1, data.growthAssumptionsData.gr_cost_2, data.growthAssumptionsData.gr_cost_3,
            data.growthAssumptionsData.gr_cost_4, data.growthAssumptionsData.gr_cost_5, data.growthAssumptionsData.gr_cost_6,
            data.growthAssumptionsData.gr_cost_7, data.growthAssumptionsData.gr_cost_8, data.growthAssumptionsData.gr_cost_9,
            data.growthAssumptionsData.gr_cost_10, data.growthAssumptionsData.gr_cost_11, data.growthAssumptionsData.gr_cost_12,
            data.growthAssumptionsData.gr_cost_oper_1, data.growthAssumptionsData.gr_cost_oper_2, data.growthAssumptionsData.gr_cost_oper_3,
            data.growthAssumptionsData.gr_cost_oper_4, data.growthAssumptionsData.gr_cost_oper_5, data.growthAssumptionsData.gr_cost_oper_6,
            data.growthAssumptionsData.gr_cost_oper_7, data.growthAssumptionsData.gr_cost_oper_8, data.growthAssumptionsData.gr_cost_oper_9,
            data.growthAssumptionsData.gr_cost_oper_10, data.growthAssumptionsData.gr_cost_oper_11, data.growthAssumptionsData.gr_cost_oper_12,
            data.growthAssumptionsData.gr_capex_1, data.growthAssumptionsData.gr_capex_2, data.growthAssumptionsData.gr_capex_3,
            data.growthAssumptionsData.gr_capex_4, data.growthAssumptionsData.gr_capex_5, data.growthAssumptionsData.gr_capex_6,
            data.growthAssumptionsData.gr_capex_7, data.growthAssumptionsData.gr_capex_8, data.growthAssumptionsData.gr_capex_9,
            data.growthAssumptionsData.gr_capex_10, data.growthAssumptionsData.gr_capex_11, data.growthAssumptionsData.gr_capex_12,
            userId, // created_by
            userId, // updated_by
            data.growthAssumptionsData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }

    // Update seasonality data
    if (data.seasonalityData) {
      updates.push(
        db.query(
          `INSERT INTO seasonality_data (
             project_id, january, february, march, april, may, june,
             july, august, september, october, november, december,
             seasonal_working_capital, seasonality_pattern,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
           ON CONFLICT (project_id) DO UPDATE SET
           january = EXCLUDED.january, february = EXCLUDED.february, march = EXCLUDED.march,
           april = EXCLUDED.april, may = EXCLUDED.may, june = EXCLUDED.june,
           july = EXCLUDED.july, august = EXCLUDED.august, september = EXCLUDED.september,
           october = EXCLUDED.october, november = EXCLUDED.november, december = EXCLUDED.december,
           seasonal_working_capital = EXCLUDED.seasonal_working_capital,
           seasonality_pattern = EXCLUDED.seasonality_pattern,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(seasonality_data.version, 0) + 1`,
          [
            projectId,
            data.seasonalityData.january, data.seasonalityData.february, data.seasonalityData.march,
            data.seasonalityData.april, data.seasonalityData.may, data.seasonalityData.june,
            data.seasonalityData.july, data.seasonalityData.august, data.seasonalityData.september,
            data.seasonalityData.october, data.seasonalityData.november, data.seasonalityData.december,
            data.seasonalityData.seasonal_working_capital,
            data.seasonalityData.seasonality_pattern,
            userId, // created_by
            userId, // updated_by
            data.seasonalityData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }

    // Update cash flow data (now with audit columns)
    if (data.cashFlowData) {
      updates.push(
        db.query(
          `INSERT INTO cash_flow_data (
             project_id, net_income, depreciation, amortization, changes_in_working_capital,
             operating_cash_flow, capex, acquisitions, investing_cash_flow, debt_issuance,
             debt_repayment, dividends, financing_cash_flow, net_cash_flow,
             capital_expenditures, free_cash_flow, debt_service,
             created_by, updated_by, change_reason
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
           ON CONFLICT (project_id) DO UPDATE SET
           net_income = EXCLUDED.net_income,
           depreciation = EXCLUDED.depreciation,
           amortization = EXCLUDED.amortization,
           changes_in_working_capital = EXCLUDED.changes_in_working_capital,
           operating_cash_flow = EXCLUDED.operating_cash_flow,
           capex = EXCLUDED.capex,
           acquisitions = EXCLUDED.acquisitions,
           investing_cash_flow = EXCLUDED.investing_cash_flow,
           debt_issuance = EXCLUDED.debt_issuance,
           debt_repayment = EXCLUDED.debt_repayment,
           dividends = EXCLUDED.dividends,
           financing_cash_flow = EXCLUDED.financing_cash_flow,
           net_cash_flow = EXCLUDED.net_cash_flow,
           capital_expenditures = EXCLUDED.capital_expenditures,
           free_cash_flow = EXCLUDED.free_cash_flow,
           debt_service = EXCLUDED.debt_service,
           updated_by = EXCLUDED.updated_by,
           change_reason = EXCLUDED.change_reason,
           updated_at = NOW(),
           version = COALESCE(cash_flow_data.version, 0) + 1`,
          [
            projectId,
            data.cashFlowData.net_income || 0,
            data.cashFlowData.depreciation || 0,
            data.cashFlowData.amortization || 0,
            data.cashFlowData.changes_in_working_capital || 0,
            data.cashFlowData.operating_cash_flow,
            data.cashFlowData.capex || 0,
            data.cashFlowData.acquisitions || 0,
            data.cashFlowData.investing_cash_flow || 0,
            data.cashFlowData.debt_issuance || 0,
            data.cashFlowData.debt_repayment || 0,
            data.cashFlowData.dividends || 0,
            data.cashFlowData.financing_cash_flow || 0,
            data.cashFlowData.net_cash_flow || 0,
            data.cashFlowData.capital_expenditures,
            data.cashFlowData.free_cash_flow,
            data.cashFlowData.debt_service,
            userId, // created_by
            userId, // updated_by
            data.cashFlowData.change_reason || 'Updated via data entry form'
          ]
        )
      );
    }
  }
}

module.exports = new ProjectRepository(); 