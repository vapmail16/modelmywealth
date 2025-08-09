const { Pool } = require('pg');
require('dotenv').config();

// Use the existing Supabase configuration from the project
const SUPABASE_URL = "https://vmrvugezqpydlfjcoldl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnZ1Z2V6cXB5ZGxmamNvbGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTgxNTEsImV4cCI6MjA2OTM5NDE1MX0.gG3F0SxaIoCZoM5FhjB4YfrHwQkVBj9BpK94ldl_gBE";

// Create Supabase client using the project's configuration
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PostgreSQL client
const pool = new Pool({
  host: process.env.POSTGRESQL_HOST || "localhost",
  port: process.env.POSTGRESQL_PORT || 5432,
  database: process.env.POSTGRESQL_DATABASE || "refi_wizard",
  user: process.env.POSTGRESQL_USER || "postgres",
  password: process.env.POSTGRESQL_PASSWORD || "",
});

async function migrateData() {
  try {
    console.log('🚀 Starting migration from Supabase to PostgreSQL...');
    console.log(`📊 Using Supabase URL: ${SUPABASE_URL}`);

    // First, let's check what data actually exists
    console.log('\n🔍 Checking existing data in Supabase...');
    
    // Check companies table
    console.log('🏢 Checking companies table...');
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*');

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
    } else {
      console.log(`✅ Found ${companies?.length || 0} companies:`, companies);
    }

    // Migrate companies first (if they exist)
    if (companies && companies.length > 0) {
      console.log('\n🏢 Migrating companies...');
      for (const company of companies) {
        await pool.query(
          `INSERT INTO companies (id, user_id, name, industry, headquarters, description, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           name = EXCLUDED.name,
           industry = EXCLUDED.industry,
           headquarters = EXCLUDED.headquarters,
           description = EXCLUDED.description,
           updated_at = EXCLUDED.updated_at`,
          [company.id, company.user_id, company.name, company.industry, company.headquarters, company.description, company.created_at, company.updated_at]
        );
      }
      console.log(`✅ Migrated ${companies.length} companies`);
    }

    // Check projects table
    console.log('\n📋 Checking projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');

    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log(`✅ Found ${projects?.length || 0} projects:`, projects);
    }

    // Migrate projects
    if (projects && projects.length > 0) {
      console.log('\n📋 Migrating projects...');
      for (const project of projects) {
        await pool.query(
          `INSERT INTO projects (id, name, description, user_id, company_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           user_id = EXCLUDED.user_id,
           company_id = EXCLUDED.company_id,
           updated_at = EXCLUDED.updated_at`,
          [project.id, project.name, project.description, project.user_id, project.company_id, project.created_at, project.updated_at]
        );
      }
      console.log(`✅ Migrated ${projects.length} projects`);
    }

    // Migrate company details
    console.log('\n🏢 Migrating company details...');
    const { data: companyDetails, error: companyError } = await supabase
      .from('company_details')
      .select('*');

    if (companyError) {
      console.error('❌ Error fetching company details:', companyError);
    } else {
      console.log(`✅ Found ${companyDetails?.length || 0} company details:`, companyDetails);
    }

    if (companyDetails && companyDetails.length > 0) {
      for (const company of companyDetails) {
        await pool.query(
          `INSERT INTO company_details (id, project_id, user_id, company_name, industry, region, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
           project_id = EXCLUDED.project_id,
           user_id = EXCLUDED.user_id,
           company_name = EXCLUDED.company_name,
           industry = EXCLUDED.industry,
           region = EXCLUDED.region,
           updated_at = EXCLUDED.updated_at`,
          [company.id, company.project_id, company.user_id, company.company_name, company.industry, company.region, company.created_at, company.updated_at]
        );
      }
      console.log(`✅ Migrated ${companyDetails.length} company details`);
    }

    // Migrate balance sheet data
    console.log('\n📊 Migrating balance sheet data...');
    const { data: balanceSheetData, error: bsError } = await supabase
      .from('balance_sheet_data')
      .select('*');

    if (bsError) {
      console.error('❌ Error fetching balance sheet data:', bsError);
    } else {
      console.log(`✅ Found ${balanceSheetData?.length || 0} balance sheet records:`, balanceSheetData);
    }

    if (balanceSheetData && balanceSheetData.length > 0) {
      for (const bs of balanceSheetData) {
        await pool.query(
          `INSERT INTO balance_sheet_data (id, project_id, user_id, cash, accounts_receivable, inventory, other_current_assets, ppe, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET
           project_id = EXCLUDED.project_id,
           user_id = EXCLUDED.user_id,
           cash = EXCLUDED.cash,
           accounts_receivable = EXCLUDED.accounts_receivable,
           inventory = EXCLUDED.inventory,
           other_current_assets = EXCLUDED.other_current_assets,
           ppe = EXCLUDED.ppe,
           updated_at = EXCLUDED.updated_at`,
          [bs.id, bs.project_id, bs.user_id, bs.cash, bs.accounts_receivable, bs.inventory, bs.other_current_assets, bs.ppe, bs.created_at, bs.updated_at]
        );
      }
      console.log(`✅ Migrated ${balanceSheetData.length} balance sheet records`);
    }

    // Migrate cash flow data
    console.log('\n💰 Migrating cash flow data...');
    const { data: cashFlowData, error: cfError } = await supabase
      .from('cash_flow_data')
      .select('*');

    if (cfError) {
      console.error('❌ Error fetching cash flow data:', cfError);
    } else {
      console.log(`✅ Found ${cashFlowData?.length || 0} cash flow records:`, cashFlowData);
    }

    if (cashFlowData && cashFlowData.length > 0) {
      for (const cf of cashFlowData) {
        await pool.query(
          `INSERT INTO cash_flow_data (id, project_id, user_id, operating_cash_flow, capital_expenditures, free_cash_flow, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (id) DO UPDATE SET
           project_id = EXCLUDED.project_id,
           user_id = EXCLUDED.user_id,
           operating_cash_flow = EXCLUDED.operating_cash_flow,
           capital_expenditures = EXCLUDED.capital_expenditures,
           free_cash_flow = EXCLUDED.free_cash_flow,
           updated_at = EXCLUDED.updated_at`,
          [cf.id, cf.project_id, cf.user_id, cf.operating_cash_flow, cf.capital_expenditures, cf.free_cash_flow, cf.created_at, cf.updated_at]
        );
      }
      console.log(`✅ Migrated ${cashFlowData.length} cash flow records`);
    }

    // Migrate debt structure data
    console.log('\n🏦 Migrating debt structure data...');
    const { data: debtStructureData, error: dsError } = await supabase
      .from('debt_structure_data')
      .select('*');

    if (dsError) {
      console.error('❌ Error fetching debt structure data:', dsError);
    } else {
      console.log(`✅ Found ${debtStructureData?.length || 0} debt structure records:`, debtStructureData);
    }

    if (debtStructureData && debtStructureData.length > 0) {
      for (const ds of debtStructureData) {
        await pool.query(
          `INSERT INTO debt_structure_data (id, project_id, user_id, senior_secured_loan_type, additional_loan_senior_secured, bank_base_rate_senior_secured, liquidity_premiums_senior_secured, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (id) DO UPDATE SET
           project_id = EXCLUDED.project_id,
           user_id = EXCLUDED.user_id,
           senior_secured_loan_type = EXCLUDED.senior_secured_loan_type,
           additional_loan_senior_secured = EXCLUDED.additional_loan_senior_secured,
           bank_base_rate_senior_secured = EXCLUDED.bank_base_rate_senior_secured,
           liquidity_premiums_senior_secured = EXCLUDED.liquidity_premiums_senior_secured,
           updated_at = EXCLUDED.updated_at`,
          [ds.id, ds.project_id, ds.user_id, ds.senior_secured_loan_type, ds.additional_loan_senior_secured, ds.bank_base_rate_senior_secured, ds.liquidity_premiums_senior_secured, ds.created_at, ds.updated_at]
        );
      }
      console.log(`✅ Migrated ${debtStructureData.length} debt structure records`);
    }

    // Migrate other data tables...
    const tables = [
      'profit_loss_data',
      'working_capital_data', 
      'growth_assumptions_data',
      'seasonality_data',
      'debt_calculations',
      'depreciation_schedule'
    ];

    for (const table of tables) {
      console.log(`\n📋 Migrating ${table}...`);
      const { data, error } = await supabase.from(table).select('*');
      
      if (error) {
        console.warn(`⚠️ Failed to fetch ${table}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} records in ${table}:`, data);
        // For simplicity, we'll use a generic approach for other tables
        for (const record of data) {
          const columns = Object.keys(record).filter(key => key !== 'id');
          const values = Object.values(record);
          const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
          const setClause = columns.map((col, index) => `${col} = EXCLUDED.${col}`).join(', ');
          
          await pool.query(
            `INSERT INTO ${table} (${Object.keys(record).join(', ')})
             VALUES (${placeholders})
             ON CONFLICT (id) DO UPDATE SET ${setClause}`,
            values
          );
        }
        console.log(`✅ Migrated ${data.length} ${table} records`);
      } else {
        console.log(`ℹ️ No data found in ${table}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData }; 