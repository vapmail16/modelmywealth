export const DATABASE_CONFIG = {
  USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE === "true",
  USE_POSTGRESQL: import.meta.env.VITE_USE_POSTGRESQL === "true",
  POSTGRESQL: {
    host: import.meta.env.VITE_POSTGRESQL_HOST || "localhost",
    port: parseInt(import.meta.env.VITE_POSTGRESQL_PORT || "5432"),
    database: import.meta.env.VITE_POSTGRESQL_DATABASE || "refi_wizard",
    user: import.meta.env.VITE_POSTGRESQL_USER || "postgres",
    password: import.meta.env.VITE_POSTGRESQL_PASSWORD || "",
  },
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  get currentDatabase() {
    if (this.USE_POSTGRESQL) return "postgresql";
    if (this.USE_SUPABASE) return "supabase";
    return "postgresql"; // Default to PostgreSQL since we're using it
  }
};

export const isPostgreSQL = () => DATABASE_CONFIG.currentDatabase === "postgresql";
export const isSupabase = () => DATABASE_CONFIG.currentDatabase === "supabase";

console.log("🔍 Database Config Debug:");
console.log("VITE_USE_SUPABASE:", import.meta.env.VITE_USE_SUPABASE);
console.log("VITE_USE_POSTGRESQL:", import.meta.env.VITE_USE_POSTGRESQL);
console.log("USE_SUPABASE:", DATABASE_CONFIG.USE_SUPABASE);
console.log("USE_POSTGRESQL:", DATABASE_CONFIG.USE_POSTGRESQL);
console.log("Current Database:", DATABASE_CONFIG.currentDatabase);
console.log("isPostgreSQL():", isPostgreSQL());
console.log("isSupabase():", isSupabase());
