export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  api: {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    enableCache: boolean;
    cacheExpiry: number;
  };
  app: {
    environment: 'development' | 'production' | 'test';
    version: string;
    enableLogging: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
}

class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    const isDevelopment = import.meta.env.DEV;
    
    // Use environment variables with fallbacks
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://vmrvugezqpydlfjcoldl.supabase.co";
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcnZ1Z2V6cXB5ZGxmamNvbGRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTgxNTEsImV4cCI6MjA2OTM5NDE1MX0.gG3F0SxaIoCZoM5FhjB4YfrHwQkVBj9BpK94ldl_gBE";
    
    return {
      supabase: {
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      },
      api: {
        baseURL: `${supabaseUrl}/functions/v1`,
        timeout: 30000,
        retryAttempts: 3,
        enableCache: true,
        cacheExpiry: 5 * 60 * 1000, // 5 minutes
      },
      app: {
        environment: isDevelopment ? 'development' : 'production',
        version: '1.0.0',
        enableLogging: isDevelopment,
        logLevel: isDevelopment ? 'debug' : 'error',
      },
    };
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): AppConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isDevelopment(): boolean {
    return this.config.app.environment === 'development';
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production';
  }

  shouldLog(level: AppConfig['app']['logLevel']): boolean {
    if (!this.config.app.enableLogging) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.app.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }
}

export const configService = new ConfigService();