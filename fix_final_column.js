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

class FinalColumnFixer {
  constructor() {
    this.productionClient = null;
    this.fixLog = [];
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
      return false;
    }
  }

  async disconnect() {
    if (this.productionClient) {
      await this.productionClient.end();
      this.log('Disconnected from production database');
    }
  }

  async addMissingColumn() {
    try {
      this.log('🔧 Adding missing change_reason column...');
      
      // Add the missing column
      const alterQuery = 'ALTER TABLE "data_entry_audit_log" ADD COLUMN "change_reason" text;';
      
      await this.productionClient.query(alterQuery);
      this.log('✅ Successfully added change_reason column');
      
      return true;
      
    } catch (error) {
      this.log(`❌ Error adding column: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async verifyColumnAdded() {
    try {
      this.log('🔍 Verifying column was added...');
      
      const result = await this.productionClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'data_entry_audit_log' 
        AND column_name = 'change_reason';
      `);
      
      if (result.rows.length > 0) {
        this.log('✅ change_reason column verified in production');
        return true;
      } else {
        this.log('❌ change_reason column not found');
        return false;
      }
      
    } catch (error) {
      this.log(`❌ Error verifying column: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runFinalFix() {
    try {
      this.log('🚀 Starting final column fix...');
      
      // Connect to production
      if (!(await this.connectToProduction())) {
        throw new Error('Failed to connect to production database');
      }

      // Add missing column
      const columnAdded = await this.addMissingColumn();
      
      if (columnAdded) {
        // Verify column was added
        const verified = await this.verifyColumnAdded();
        
        if (verified) {
          this.log('🎉 Final column fix completed successfully!');
          this.log('💡 Ready for final data migration attempt');
        } else {
          this.log('⚠️ Column fix completed but verification failed');
        }
        
        return verified;
      } else {
        this.log('❌ Failed to add missing column');
        return false;
      }

    } catch (error) {
      this.log(`💥 Final column fix failed: ${error.message}`, 'ERROR');
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run final fix
async function main() {
  const fixer = new FinalColumnFixer();
  const success = await fixer.runFinalFix();
  
  if (success) {
    console.log('\n🎯 Final Column Fix Summary: SUCCESS');
    console.log('📋 Ready for final migration attempt');
    process.exit(0);
  } else {
    console.log('\n💥 Final Column Fix Summary: FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
