const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL client
const pool = new Pool({
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: process.env.POSTGRESQL_PORT || 5432,
  database: process.env.POSTGRESQL_DATABASE || "refi_wizard",
  user: process.env.POSTGRESQL_USER || "postgres",
  password: process.env.POSTGRESQL_PASSWORD || "",
});

async function createUserAndProject() {
  try {
    console.log('🚀 Creating user and project with sample data...');

    // Create user
    const userId = '0361174d-2cf0-4f06-ac31-5897644a60d7'; // Use the same ID from the screenshots
    const userEmail = 'vapmail16@gmail.com';
    const userName = 'vikkas';
    
    console.log('👤 Creating user...');
    await pool.query(
      `INSERT INTO profiles (id, email, full_name, user_type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       full_name = EXCLUDED.full_name,
       user_type = EXCLUDED.user_type,
       updated_at = NOW()`,
      [userId, userEmail, userName, 'business']
    );
    console.log('✅ User created successfully');

    // Create company
    const companyId = '052f127f-e08c-4d27-ba4c-fd80d9e4e0c3'; // Use the same ID from screenshots
    console.log('🏢 Creating company...');
    await pool.query(
      `INSERT INTO companies (id, user_id, name, industry, headquarters, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       user_id = EXCLUDED.user_id,
       name = EXCLUDED.name,
       industry = EXCLUDED.industry,
       headquarters = EXCLUDED.headquarters,
       description = EXCLUDED.description,
       updated_at = NOW()`,
      [companyId, userId, 'TFF Fintech', 'Finance', 'London', 'Start p']
    );
    console.log('✅ Company created successfully');

    // Create project
    const projectId = '05632bb7-b506-453d-9ca1-253344e04b6b'; // Use the same ID from screenshots
    console.log('📋 Creating project...');
    await pool.query(
      `INSERT INTO projects (id, name, description, user_id, company_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       user_id = EXCLUDED.user_id,
       company_id = EXCLUDED.company_id,
       updated_at = NOW()`,
      [projectId, 'first project', 'Sample project for testing', userId, companyId]
    );
    console.log('✅ Project created successfully');

    // Create company details
    console.log('🏢 Creating company details...');
    await pool.query(
      `INSERT INTO company_details (id, project_id, company_name, industry, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       company_name = EXCLUDED.company_name,
       industry = EXCLUDED.industry,
       updated_at = NOW()`,
      ['f09a356b-54e6-436a-b987-0481c0526925', projectId, 'Sample Manufacturing Co.', 'Manufacturing']
    );
    console.log('✅ Company details created successfully');

    // Create balance sheet data
    console.log('📊 Creating balance sheet data...');
    await pool.query(
      `INSERT INTO balance_sheet_data (id, project_id, cash, accounts_receivable, inventory, other_current_assets, ppe, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       cash = EXCLUDED.cash,
       accounts_receivable = EXCLUDED.accounts_receivable,
       inventory = EXCLUDED.inventory,
       other_current_assets = EXCLUDED.other_current_assets,
       ppe = EXCLUDED.ppe,
       updated_at = NOW()`,
      ['85e9f6dc-f331-4e67-969f-ff208dbfa794', projectId, 500.00, 800.00, 1200.00, 200.00, 15000.00]
    );
    console.log('✅ Balance sheet data created successfully');

    // Create cash flow data (matching actual table structure)
    console.log('💰 Creating cash flow data...');
    await pool.query(
      `INSERT INTO cash_flow_data (id, project_id, net_income, depreciation, operating_cash_flow, capex, net_cash_flow, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       net_income = EXCLUDED.net_income,
       depreciation = EXCLUDED.depreciation,
       operating_cash_flow = EXCLUDED.operating_cash_flow,
       capex = EXCLUDED.capex,
       net_cash_flow = EXCLUDED.net_cash_flow,
       updated_at = NOW()`,
      ['7333a93d-b367-4065-b71c-45f7953a8020', projectId, 1189.00, 139.00, 1400.00, -2000.00, -600.00]
    );
    console.log('✅ Cash flow data created successfully');

    // Create debt structure data (matching actual table structure)
    console.log('🏦 Creating debt structure data...');
    await pool.query(
      `INSERT INTO debt_structure_data (id, project_id, total_debt, interest_rate, payment_frequency, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       total_debt = EXCLUDED.total_debt,
       interest_rate = EXCLUDED.interest_rate,
       payment_frequency = EXCLUDED.payment_frequency,
       updated_at = NOW()`,
      ['a729421b-45d8-44d5-8c16-c904d2397740', projectId, 50000.00, 0.0500, 'monthly']
    );
    console.log('✅ Debt structure data created successfully');

    // Create profit & loss data
    console.log('💰 Creating profit & loss data...');
    await pool.query(
      `INSERT INTO profit_loss_data (id, project_id, revenue, cogs, operating_expenses, ebitda, depreciation, ebit, interest_expense, pretax_income, taxes, net_income, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       revenue = EXCLUDED.revenue,
       cogs = EXCLUDED.cogs,
       operating_expenses = EXCLUDED.operating_expenses,
       ebitda = EXCLUDED.ebitda,
       depreciation = EXCLUDED.depreciation,
       ebit = EXCLUDED.ebit,
       interest_expense = EXCLUDED.interest_expense,
       pretax_income = EXCLUDED.pretax_income,
       taxes = EXCLUDED.taxes,
       net_income = EXCLUDED.net_income,
       updated_at = NOW()`,
      ['profit-loss-id-1', projectId, 4550.00, -2522.00, -480.00, 1548.00, -139.00, 1409.00, -76.00, 1333.00, -144.00, 1189.00]
    );
    console.log('✅ Profit & loss data created successfully');

    // Create working capital data
    console.log('💼 Creating working capital data...');
    await pool.query(
      `INSERT INTO working_capital_data (id, project_id, account_receivable_percent, inventory_percent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       account_receivable_percent = EXCLUDED.account_receivable_percent,
       inventory_percent = EXCLUDED.inventory_percent,
       updated_at = NOW()`,
      ['working-capital-id-1', projectId, 17.60, 26.40]
    );
    console.log('✅ Working capital data created successfully');

    // Create growth assumptions data
    console.log('📈 Creating growth assumptions data...');
    await pool.query(
      `INSERT INTO growth_assumptions_data (id, project_id, revenue_growth_rate, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       revenue_growth_rate = EXCLUDED.revenue_growth_rate,
       updated_at = NOW()`,
      ['growth-assumptions-id-1', projectId, 10.00]
    );
    console.log('✅ Growth assumptions data created successfully');

    // Create seasonality data
    console.log('📅 Creating seasonality data...');
    await pool.query(
      `INSERT INTO seasonality_data (id, project_id, q1_percent, q2_percent, q3_percent, q4_percent, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       q1_percent = EXCLUDED.q1_percent,
       q2_percent = EXCLUDED.q2_percent,
       q3_percent = EXCLUDED.q3_percent,
       q4_percent = EXCLUDED.q4_percent,
       updated_at = NOW()`,
      ['seasonality-id-1', projectId, 25.00, 25.00, 25.00, 25.00]
    );
    console.log('✅ Seasonality data created successfully');

    // Create debt calculations
    console.log('🧮 Creating debt calculations...');
    await pool.query(
      `INSERT INTO debt_calculations (id, project_id, total_debt, monthly_payment, interest_rate, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       total_debt = EXCLUDED.total_debt,
       monthly_payment = EXCLUDED.monthly_payment,
       interest_rate = EXCLUDED.interest_rate,
       updated_at = NOW()`,
      ['debt-calculations-id-1', projectId, 50000.00, 2500.00, 5.00]
    );
    console.log('✅ Debt calculations created successfully');

    // Create depreciation schedule
    console.log('📉 Creating depreciation schedule...');
    await pool.query(
      `INSERT INTO depreciation_schedule (id, project_id, asset_value, depreciation_rate, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
       project_id = EXCLUDED.project_id,
       asset_value = EXCLUDED.asset_value,
       depreciation_rate = EXCLUDED.depreciation_rate,
       updated_at = NOW()`,
      ['depreciation-schedule-id-1', projectId, 15000.00, 10.00]
    );
    console.log('✅ Depreciation schedule created successfully');

    console.log('\n🎉 User, project, and all data created successfully!');
    console.log(`👤 User: ${userName} (${userEmail})`);
    console.log(`📋 Project: first project`);
    console.log(`🏢 Company: TFF Fintech`);
    console.log(`📊 All financial data mapped to project ID: ${projectId}`);

  } catch (error) {
    console.error('❌ Failed to create user and project:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  createUserAndProject().catch(console.error);
}

module.exports = { createUserAndProject }; 