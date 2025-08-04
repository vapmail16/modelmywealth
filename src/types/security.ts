// Security related types and interfaces

export interface SessionInfo {
  sessionId: string;
  userId: string;
  createdAt: string;
  lastActivity: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: SecurityEventType;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export type SecurityEventType = 
  | 'login_success'
  | 'login_failed'
  | 'login_blocked'
  | 'logout'
  | 'session_timeout'
  | 'suspicious_activity'
  | 'multiple_failed_attempts'
  | 'unauthorized_access'
  | 'data_access'
  | 'permission_denied';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Max attempts per window
  blockDurationMs: number; // How long to block after exceeding limit
}

export interface SecurityConfig {
  sessionTimeout: number; // in milliseconds
  maxConcurrentSessions: number;
  rateLimits: {
    login: RateLimitConfig;
    api: RateLimitConfig;
  };
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
}

export interface EncryptedField {
  encryptedValue: string;
  algorithm: string;
  iv: string;
}

export interface DataMaskingConfig {
  [key: string]: {
    maskType: 'partial' | 'full' | 'none';
    visibleChars?: number;
    replacement?: string;
  };
}