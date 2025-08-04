import { configService } from '../config/ConfigService';

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
  source?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>,
    source?: string
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      source,
    };
  }

  private sanitizeContext(context?: Record<string, any>): Record<string, any> | undefined {
    if (!context) return undefined;
    
    // Remove sensitive data
    const sanitized = { ...context };
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'authorization'];
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private shouldLog(level: LogEntry['level']): boolean {
    return configService.shouldLog(level);
  }

  debug(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context, source);
    this.addLog(entry);
    
    if (configService.isDevelopment()) {
      console.log(`🐛 [${source || 'APP'}] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context, source);
    this.addLog(entry);
    
    if (configService.isDevelopment()) {
      console.log(`ℹ️ [${source || 'APP'}] ${message}`, context || '');
    }
  }

  warn(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context, source);
    this.addLog(entry);
    
    console.warn(`⚠️ [${source || 'APP'}] ${message}`, context || '');
  }

  error(message: string, context?: Record<string, any>, source?: string): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, context, source);
    this.addLog(entry);
    
    console.error(`❌ [${source || 'APP'}] ${message}`, context || '');
  }

  getLogs(level?: LogEntry['level'], source?: string): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (source) {
      filteredLogs = filteredLogs.filter(log => log.source === source);
    }
    
    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new LoggingService();
