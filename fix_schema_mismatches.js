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

class SchemaMismatchFixer {
  constructor() {
    this.productionClient = null;
    this.fixLog = [];
    this.errors = [];
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    this.fixLog.push(logEntry);
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

  async fixDataEntryAuditLog() {
    try {
      this.log('🔧 Fixing data_entry_audit_log table...');
      
      // Add missing columns
      const alterQueries = [
        'ALTER TABLE "data_entry_audit_log" ADD COLUMN "project_id" uuid;',
        'ALTER TABLE "data_entry_audit_log" ADD COLUMN "user_id" uuid;',
        'ALTER TABLE "data_entry_audit_log" ADD COLUMN "session_id" uuid;',
        'ALTER TABLE "data_entry_audit_log" ADD COLUMN "ip_address" character varying(45);'
      ];
      
      for (const query of alterQueries) {
        try {
          await this.productionClient.query(query);
          this.log('  ✅ Added missing column');
        } catch (error) {
          if (error.message.includes('already exists')) {
            this.log('  ⚠️ Column already exists');
          } else {
            throw error;
          }
        }
      }
      
      this.log('✅ data_entry_audit_log table fixed');
      return true;
      
    } catch (error) {
      this.log(`❌ Error fixing data_entry_audit_log: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async fixRoleCapabilities() {
    try {
      this.log('🔧 Fixing role_capabilities table...');
      
      // Drop and recreate with correct schema
      await this.productionClient.query('DROP TABLE IF EXISTS "role_capabilities";');
      
      const createSQL = `
        CREATE TABLE "role_capabilities" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "role" character varying(100) NOT NULL,
          "user_type" character varying(100) NOT NULL,
          "capability" character varying(100) NOT NULL,
          "created_at" timestamp with time zone DEFAULT now(),
          "created_by" uuid,
          PRIMARY KEY ("id")
        );
      `;
      
      await this.productionClient.query(createSQL);
      this.log('✅ role_capabilities table recreated with correct schema');
      return true;
      
    } catch (error) {
      this.log(`❌ Error fixing role_capabilities: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async fixUserRoles() {
    try {
      this.log('🔧 Fixing user_roles table...');
      
      // Drop and recreate with correct schema
      await this.productionClient.query('DROP TABLE IF EXISTS "user_roles";');
      
      const createSQL = `
        CREATE TABLE "user_roles" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "user_id" uuid NOT NULL,
          "role" character varying(100) NOT NULL,
          "user_type" character varying(100) NOT NULL,
          "created_at" timestamp with time zone DEFAULT now(),
          "created_by" uuid,
          PRIMARY KEY ("id")
        );
      `;
      
      await this.productionClient.query(createSQL);
      this.log('✅ user_roles table recreated with correct schema');
      return true;
      
    } catch (error) {
      this.log(`❌ Error fixing user_roles: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async fixAllMismatches() {
    try {
      this.log('🔧 Fixing all schema mismatches...');
      
      let successCount = 0;
      
      if (await this.fixDataEntryAuditLog()) successCount++;
      if (await this.fixRoleCapabilities()) successCount++;
      if (await this.fixUserRoles()) successCount++;
      
      this.log(`📊 Schema fixes completed: ${successCount}/3 successful`);
      return successCount === 3;
      
    } catch (error) {
      this.log(`❌ Error fixing schema mismatches: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runSchemaFixes() {
    try {
      this.log('🚀 Starting schema mismatch fixes...');
      
      // Connect to production
      if (!(await this.connectToProduction())) {
        throw new Error('Failed to connect to production database');
      }

      // Fix all mismatches
      const fixesSuccess = await this.fixAllMismatches();

      // Save fix log
      const logPath = path.join(__dirname, `schema_fixes_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
      fs.writeFileSync(logPath, this.fixLog.join('\n'));
      this.log(`📝 Schema fixes log saved to: ${logPath}`);

      if (fixesSuccess) {
        this.log('🎉 All schema mismatches fixed successfully!');
        this.log('💡 Ready to retry data migration');
      } else {
        this.log('⚠️ Some schema fixes failed');
      }

      return fixesSuccess;

    } catch (error) {
      this.log(`💥 Schema fixes failed: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run schema fixes
async function main() {
  const fixer = new SchemaMismatchFixer();
  const success = await fixer.runSchemaFixes();
  
  if (success) {
    console.log('\n🎯 Schema Fixes Summary: SUCCESS');
    console.log('📋 Ready to retry data migration');
    process.exit(0);
  } else {
    console.log('\n💥 Schema Fixes Summary: FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
