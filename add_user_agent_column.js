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

class UserAgentColumnAdder {
  constructor() {
    this.productionClient = null;
    this.log = [];
  }

  async logMessage(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    this.log.push(logEntry);
  }

  async connectToProduction() {
    try {
      this.logMessage('Connecting to production database...');
      this.productionClient = new Client(productionConfig);
      await this.productionClient.connect();
      this.logMessage('✅ Connected to production database');
      return true;
    } catch (error) {
      this.logMessage(`❌ Connection failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async disconnect() {
    if (this.productionClient) {
      await this.productionClient.end();
      this.logMessage('Disconnected from production database');
    }
  }

  async addUserAgentColumn() {
    try {
      this.logMessage('🔧 Adding missing user_agent column...');
      
      // Add the missing column
      const alterQuery = 'ALTER TABLE "data_entry_audit_log" ADD COLUMN "user_agent" text;';
      
      await this.productionClient.query(alterQuery);
      this.logMessage('✅ Successfully added user_agent column');
      
      return true;
      
    } catch (error) {
      this.logMessage(`❌ Error adding column: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async verifyColumnAdded() {
    try {
      this.logMessage('🔍 Verifying user_agent column was added...');
      
      const result = await this.productionClient.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'data_entry_audit_log' 
        AND column_name = 'user_agent';
      `);
      
      if (result.rows.length > 0) {
        this.logMessage('✅ user_agent column verified in production');
        return true;
      } else {
        this.logMessage('❌ user_agent column not found');
        return false;
      }
      
    } catch (error) {
      this.logMessage(`❌ Error verifying column: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async runColumnAddition() {
    try {
      this.logMessage('🚀 Starting user_agent column addition...');
      
      // Connect to production
      if (!(await this.connectToProduction())) {
        throw new Error('Failed to connect to production database');
      }

      // Add missing column
      const columnAdded = await this.addUserAgentColumn();
      
      if (columnAdded) {
        // Verify column was added
        const verified = await this.verifyColumnAdded();
        
        if (verified) {
          this.logMessage('🎉 user_agent column addition completed successfully!');
          this.logMessage('💡 Ready for final data migration attempt');
        } else {
          this.logMessage('⚠️ Column addition completed but verification failed');
        }
        
        return verified;
      } else {
        this.logMessage('❌ Failed to add user_agent column');
        return false;
      }

    } catch (error) {
      this.logMessage(`💥 user_agent column addition failed: ${error.message}`, 'ERROR');
      return false;
    } finally {
      await this.disconnect();
    }
  }
}

// Run column addition
async function main() {
  const adder = new UserAgentColumnAdder();
  const success = await adder.runColumnAddition();
  
  if (success) {
    console.log('\n🎯 User Agent Column Addition Summary: SUCCESS');
    console.log('📋 Ready for final migration attempt');
    process.exit(0);
  } else {
    console.log('\n💥 User Agent Column Addition Summary: FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
