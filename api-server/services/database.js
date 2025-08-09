const { Pool } = require("pg");

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      host: process.env.POSTGRESQL_HOST || "localhost",
      port: process.env.POSTGRESQL_PORT || 5432,
      database: process.env.POSTGRESQL_DATABASE || "refi_wizard",
      user: process.env.POSTGRESQL_USER || "postgres",
      password: process.env.POSTGRESQL_PASSWORD || "",
    });
  }

  async query(text, params) {
    try {
      const result = await this.pool.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getClient() {
    return this.pool.connect();
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = new DatabaseService(); 