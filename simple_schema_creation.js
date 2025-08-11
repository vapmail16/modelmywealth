import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configurations
const localConfig = {
  host: 'localhost',
  port: 5432,
  database: 'refi_wizard',
  user: 'postgres',
  password: ''
};

const productionConfig = {
  host: 'database-ck6f73nl9l.tcp-proxy-2212.dcdeploy.cloud',
  port: 30391,
  database: 'database-db',
  user: 'XteJIz',
  password: 'j_)fYQxDVs'
};

class SimpleSchemaCreator {
  constructor() {
    this.localClient = null;
    this.productionClient = null;
    this.schemaLog = [];
    this.errors = [];
  }

  async log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${type}] ${message}`;
    console.log(logEntry);
    this.schemaLog.push(logEntry);
  }

  async connectClients() {
    try {
      this.log('Connecting to local database...');
      this.localClient = new Client(localConfig);
      await this.localClient.connect();
      this.log('✅ Connected to local database');

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

  async disconnectClients() {
    if (this.localClient) {
      await this.localClient.end();
      this.log('Disconnected from local database');
    }
    if (this.productionClient) {
      await this.productionClient.end();
      this.log('Disconnected from production database');
    }
  }

  async getTableList(client) {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await client.query(query);
    return result.rows.map(row => row.table_name);
  }

  async getTableSchema(client, tableName) {
    const query = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await client.query(query, [tableName]);
    return result.rows;
  }

  async createTableInProduction(tableName) {
    try {
      this.log(`  🏗️ Creating table: ${tableName}`);
      
      const columns = await this.getTableSchema(this.localClient, tableName);
      
      let createSQL = `CREATE TABLE "${tableName}" (\n`;
      
      // Add columns
      const columnDefs = columns.map(col => {
        let def = `  "${col.column_name}" ${col.data_type}`;
        
        if (col.character_maximum_length) {
          def += `(${col.character_maximum_length})`;
        }
        
        if (col.is_nullable === 'NO') {
          def += ' NOT NULL';
        }
        
        if (col.column_default && col.column_default !== 'NULL') {
          def += ` DEFAULT ${col.column_default}`;
        }
        
        return def;
      });
      
      createSQL += columnDefs.join(',\n');
      createSQL += '\n);';
      
      // Execute the CREATE TABLE statement
      await this.productionClient.query(createSQL);
      this.log(`    ✅ Successfully created table: ${tableName}`);
      
      return true;
      
    } catch (error) {
      this.log(`    ❌ Error creating table ${tableName}: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    }
  }

  async createAllTables() {
    this.log('🏗️ Creating all tables in production...');
    
    const localTables = await this.getTableList(this.localClient);
    this.log(`Found ${localTables.length} tables to create`);
    
    let successCount = 0;
    
    for (const tableName of localTables) {
      const success = await this.createTableInProduction(tableName);
      if (success) successCount++;
    }
    
    this.log(`📊 Table creation completed: ${successCount}/${localTables.length} tables created successfully`);
    
    return successCount === localTables.length;
  }

  async runSchemaCreation() {
    try {
      this.log('🚀 Starting production database schema creation...');
      
      // Connect to databases
      if (!(await this.connectClients())) {
        throw new Error('Failed to connect to databases');
      }

      // Create all tables
      const schemaSuccess = await this.createAllTables();

      // Save schema creation log
      const logPath = path.join(__dirname, `simple_schema_creation_log_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
      fs.writeFileSync(logPath, this.schemaLog.join('\n'));
      this.log(`📝 Schema creation log saved to: ${logPath}`);

      if (schemaSuccess) {
        this.log('🎉 Schema creation completed successfully!');
        this.log('💡 Next step: Run the data migration script');
      } else {
        this.log('⚠️ Schema creation completed with errors. Check the log file for details.');
      }

      return schemaSuccess;

    } catch (error) {
      this.log(`💥 Schema creation failed: ${error.message}`, 'ERROR');
      this.errors.push(error);
      return false;
    } finally {
      await this.disconnectClients();
    }
  }
}

// Run schema creation
async function main() {
  const schemaCreator = new SimpleSchemaCreator();
  const success = await schemaCreator.runSchemaCreation();
  
  if (success) {
    console.log('\n🎯 Schema Creation Summary: SUCCESS');
    console.log('📋 Next: Run migrate_to_production.js to migrate data');
    process.exit(0);
  } else {
    console.log('\n💥 Schema Creation Summary: FAILED');
    process.exit(1);
  }
}

main().catch(console.error);
