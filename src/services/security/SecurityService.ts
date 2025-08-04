import { supabase } from '@/integrations/supabase/client';
import type { SecurityEvent, SessionInfo, SecurityEventType, SecurityConfig } from '@/types/security';

class SecurityService {
  private config: SecurityConfig = {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 3,
    rateLimits: {
      login: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxAttempts: 5,
        blockDurationMs: 30 * 60 * 1000, // 30 minutes
      },
      api: {
        windowMs: 60 * 1000, // 1 minute
        maxAttempts: 100,
        blockDurationMs: 5 * 60 * 1000, // 5 minutes
      },
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  };

  // Session Management
  async trackSession(userId: string): Promise<void> {
    const sessionInfo: Partial<SessionInfo> = {
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      isActive: true,
    };

    // Store session info (you'd implement this in your database)
    localStorage.setItem(`session_${userId}`, JSON.stringify(sessionInfo));
    this.startSessionTimeout(userId);
  }

  async invalidateSession(userId: string, sessionId?: string): Promise<void> {
    if (sessionId) {
      localStorage.removeItem(`session_${userId}_${sessionId}`);
    } else {
      // Invalidate all sessions for user
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`session_${userId}`)) {
          localStorage.removeItem(key);
        }
      });
    }

    await this.logSecurityEvent(userId, 'logout', 'low', {
      reason: sessionId ? 'specific_session' : 'all_sessions',
    });
  }

  private startSessionTimeout(userId: string): void {
    // Clear any existing timeout
    const existingTimeout = localStorage.getItem(`timeout_${userId}`);
    if (existingTimeout) {
      clearTimeout(Number(existingTimeout));
    }

    // Set new timeout
    const timeoutId = setTimeout(async () => {
      await this.handleSessionTimeout(userId);
    }, this.config.sessionTimeout);

    localStorage.setItem(`timeout_${userId}`, timeoutId.toString());
  }

  private async handleSessionTimeout(userId: string): Promise<void> {
    await this.logSecurityEvent(userId, 'session_timeout', 'medium', {
      timeoutDuration: this.config.sessionTimeout,
    });

    // Force logout
    await supabase.auth.signOut();
    
    // Clear session data
    await this.invalidateSession(userId);
    
    // Redirect to login
    window.location.href = '/auth';
  }

  async updateSessionActivity(userId: string): Promise<void> {
    const sessionKey = `session_${userId}`;
    const sessionData = localStorage.getItem(sessionKey);
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      session.lastActivity = new Date().toISOString();
      localStorage.setItem(sessionKey, JSON.stringify(session));
      
      // Reset timeout
      this.startSessionTimeout(userId);
    }
  }

  // Rate Limiting
  async checkRateLimit(type: 'login' | 'api', identifier: string): Promise<boolean> {
    const config = this.config.rateLimits[type];
    const key = `rateLimit_${type}_${identifier}`;
    const now = Date.now();
    
    const stored = localStorage.getItem(key);
    let attempts: number[] = stored ? JSON.parse(stored) : [];
    
    // Remove expired attempts
    attempts = attempts.filter(attempt => now - attempt < config.windowMs);
    
    if (attempts.length >= config.maxAttempts) {
      // Check if still in block period
      const lastAttempt = Math.max(...attempts);
      if (now - lastAttempt < config.blockDurationMs) {
        return false; // Rate limited
      }
      // Block period expired, reset
      attempts = [];
    }
    
    // Add current attempt
    attempts.push(now);
    localStorage.setItem(key, JSON.stringify(attempts));
    
    return true; // Not rate limited
  }

  // Security Event Logging
  async logSecurityEvent(
    userId: string,
    eventType: SecurityEventType,
    severity: SecurityEvent['severity'],
    details?: Record<string, any>
  ): Promise<void> {
    const event: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      eventType,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      details,
      severity,
    };

    // Log to console for development
    console.log(`🛡️ Security Event [${severity.toUpperCase()}]:`, event);

    // Store in localStorage for demo (in production, send to server)
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    events.push(event);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('security_events', JSON.stringify(events));

    // Alert on high/critical events
    if (severity === 'high' || severity === 'critical') {
      this.handleCriticalSecurityEvent(event);
    }
  }

  private handleCriticalSecurityEvent(event: SecurityEvent): void {
    // In production, this would trigger real-time alerts
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
    
    // Could trigger immediate actions like:
    // - Force logout all sessions
    // - Send email alerts
    // - Block IP address
    // - Require password reset
  }

  // Password Policy Validation
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const policy = this.config.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Utility methods
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  }

  // Get security events for monitoring
  getSecurityEvents(userId?: string): SecurityEvent[] {
    const events = JSON.parse(localStorage.getItem('security_events') || '[]');
    return userId ? events.filter((e: SecurityEvent) => e.userId === userId) : events;
  }

  // Update security configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export const securityService = new SecurityService();
export { SecurityService };
