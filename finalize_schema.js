import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configurations
const productionConfig = {
  host: 'database-ck6f73nl9l.tcp-proxy-2212.dcdeploy.cloud',
  port: 30391,
  database: 'database-db',
  user: 'XteJIz',
  password: 'j_)fYQxDVs'
};

class SchemaFinalizer {
  constructor() {
    this.productionClient = null;
    this.finalizeLog = [];
    this.errors = [];
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    this.finalizeLog.push(logEntry);
  }

  async connectToProduction() {
    try {
      this.log('Connecting to production database...');
      this.productionClient = new Client(productionConfig);
      await this.productionClient.connect();
      this.log('✅ Connected to production database');
      return true;
    } catch (error) {
      this.log(`❌ Connection failed: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async disconnect() {
    if (this.productionClient) {
      await this.productionClient.end();
      this.log('Disconnected from production database');
    }
  }

  async createRemainingTables() {
    try {
      this.log('🔧 Creating remaining problematic tables...');

      // Create data_entry_audit_log table (handles ARRAY type)
      const auditLogSQL = `
        CREATE TABLE "data_entry_audit_log" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "table_name" character varying(255) NOT NULL,
          "record_id" uuid NOT NULL,
          "action" character varying(50) NOT NULL,
          "old_values" jsonb,
          "new_values" jsonb,
          "changed_fields" text[],
          "created_at" timestamp with time zone DEFAULT now(),
          "created_by" uuid,
          PRIMARY KEY ("id")
        );
      `;
      
      try {
        await this.productionClient.query(auditLogSQL);
        this.log('  ✅ Created data_entry_audit_log table');
      } catch (error) {
        if (error.message.includes('already exists')) {
          this.log('  ⚠️ data_entry_audit_log table already exists');
        } else {
          throw error;
        }
      }

      // Create role_capabilities table (handles reserved keyword USER)
      const roleCapabilitiesSQL = `
        CREATE TABLE "role_capabilities" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "role_name" character varying(100) NOT NULL,
          "capability" character varying(100) NOT NULL,
          "created_at" timestamp with time zone DEFAULT now(),
          "created_by" uuid,
          PRIMARY KEY ("id")
        );
      `;
      
      try {
        await this.productionClient.query(roleCapabilitiesSQL);
        this.log('  ✅ Created role_capabilities table');
      } catch (error) {
        if (error.message.includes('already exists')) {
          this.log('  ⚠️ role_capabilities table already exists');
        } else {
          throw error;
        }
      }

      // Create user_roles table (handles reserved keyword USER)
      const userRolesSQL = `
        CREATE TABLE "user_roles" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "role_name" character varying(100) NOT NULL,
          "created_at" timestamp with time zone DEFAULT now(),
          "created_by" uuid,
          PRIMARY KEY ("id")
        );
      `;
      
      try {
        await this.productionClient.query(userRolesSQL);
        this.log('  ✅ Created user_roles table');
      } catch (error) {
        if (error.message.includes('already exists')) {
          this.log('  ⚠️ user_roles table already exists');
        } else {
          throw error;
        }
      }

      this.log('✅ All remaining tables created successfully');
      return true;

    } catch (error) {
      this.log(`❌ Error creating remaining tables: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async verifyAllTables() {
    try {
      this.log('🔍 Verifying all tables exist in production...');
      
      const result = await this.productionClient.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `);
      
      const tableCount = parseInt(result.rows[0].table_count);
      this.log(`📊 Production database now has ${tableCount} tables`);
      
      if (tableCount >= 25) { // Allow for some flexibility
        this.log('✅ Sufficient tables created for data migration');
        return true;
      } else {
        this.log('⚠️ Some tables may still be missing');
        return false;
      }

    } catch (error) {
      this.log(`❌ Error verifying tables: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runFinalization() {
    try {
      this.log('🚀 Starting schema finalization...');
      
      // Connect to production
      if (!(await this.connectToProduction())) {
        throw new Error('Failed to connect to production database');
      }

      // Create remaining tables
      const tablesCreated = await this.createRemainingTables();
      
      // Verify all tables
      const verificationPassed = await this.verifyAllTables();

      // Save finalization log
      const logPath = path.join(__dirname, `schema_finalization_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
      fs.writeFileSync(logPath, this.finalizeLog.join('\n'));
      this.log(`📝 Finalization log saved to: ${logPath}`);

      if (tablesCreated && verificationPassed) {
        this.log('🎉 Schema finalization completed successfully!');
        this.log('💡 Ready for data migration');
      } else {
        this.log('⚠️ Schema finalization completed with issues');
      }

      return tablesCreated && verificationPassed;

    } catch (error) {
      this.log(`💥 Schema finalization failed: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run finalization
async function main() {
  const finalizer = new SchemaFinalizer();
  const success = await finalizer.runFinalization();
  
  if (success) {
    console.log('\n🎯 Schema Finalization Summary: SUCCESS');
    console.log('📋 Ready to run data migration script');
    process.exit(0);
  } else {
    console.log('\n💥 Schema Finalization Summary: FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
