import { httpClient } from '@/services/http/client';
import { notificationService } from '@/services/api/NotificationService';
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

    // Store session info locally for immediate access
    localStorage.setItem(`session_${userId}`, JSON.stringify(sessionInfo));
    
    // Create session via API
    await this.createSession(userId, `session_${Date.now()}`);
    
    this.startSessionTimeout(userId);
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

    // Send security notification
    await this.sendSecurityNotification(userId, 'session_timeout', {
      timeoutDuration: this.config.sessionTimeout / 60000 // Convert to minutes
    });

    // Force logout - only auth operations are allowed direct Supabase access
    const { supabase } = await import('@/integrations/supabase/client');
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

  // Rate Limiting - uses API layer
  async checkRateLimit(type: 'login' | 'api', identifier: string): Promise<boolean> {
    try {
      const config = this.config.rateLimits[type];
      const response = await httpClient.post('/security-management/rate-limit', {
        identifier,
        limit_type: type,
        max_attempts: config.maxAttempts,
        window_ms: config.windowMs,
      });

      return response.data?.success && !response.data?.blocked;
    } catch (error) {
      console.error('Rate limit check failed, falling back to local check:', error);
      return this.checkRateLimitLocally(type, identifier);
    }
  }

  private checkRateLimitLocally(type: 'login' | 'api', identifier: string): boolean {
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

  // Security Event Logging - uses API layer
  async logSecurityEvent(
    userId: string,
    eventType: SecurityEventType,
    severity: SecurityEvent['severity'],
    details?: Record<string, any>
  ): Promise<void> {
    try {
      await httpClient.post('/security-management/log-event', {
        user_id: userId,
        event_type: eventType,
        severity,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        details,
      });
    } catch (error) {
      // Fallback to local storage if API call fails
      console.error('Failed to log security event to API, storing locally:', error);
      this.logSecurityEventLocally(userId, eventType, severity, details);
    }
  }

  private async logSecurityEventLocally(
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

    // Store in localStorage for demo
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
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
  }

  // Session management methods - use API layer
  async createSession(userId: string, sessionToken: string): Promise<void> {
    try {
      await httpClient.post('/security-management/session-management', {
        action: 'create',
        user_id: userId,
        session_token: sessionToken,
      });
    } catch (error) {
      console.error('Failed to create session via API:', error);
    }
  }

  async invalidateSession(userId: string, sessionId?: string): Promise<void> {
    try {
      if (sessionId) {
        await httpClient.post('/security-management/session-management', {
          action: 'invalidate',
          user_id: userId,
          session_token: sessionId,
        });
      } else {
        await httpClient.post('/security-management/session-management', {
          action: 'invalidate_all',
          user_id: userId,
        });
      }
    } catch (error) {
      console.error('Failed to invalidate session via API:', error);
    }

    // Also clear local session data
    if (sessionId) {
      localStorage.removeItem(`session_${userId}_${sessionId}`);
    } else {
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

  // Get security events for monitoring - uses API layer
  async getSecurityEvents(userId?: string): Promise<SecurityEvent[]> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('user_id', userId);
      params.append('limit', '100');

      const response = await httpClient.get(`/security-management/security-events?${params.toString()}`);
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch security events from API, falling back to local storage:', error);
      const events = JSON.parse(localStorage.getItem('security_events') || '[]');
      return userId ? events.filter((e: SecurityEvent) => e.userId === userId) : events;
    }
  }

  // Update security configuration
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SecurityConfig {
    return { ...this.config };
  }

  // Additional methods for SecurityDashboard
  async getActiveSessions(): Promise<any[]> {
    try {
      const response = await httpClient.get('/security-management/sessions/active');
      return response.data?.sessions || [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  async getBlockedAttempts(): Promise<number> {
    try {
      const response = await httpClient.get('/security-management/rate-limits/blocked');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error getting blocked attempts:', error);
      return 0;
    }
  }

  async cleanupExpiredSessions(): Promise<boolean> {
    try {
      const response = await httpClient.post('/security-management/cleanup');
      return response.data?.success || false;
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
      return false;
    }
  }

  // Security notification integration
  private async sendSecurityNotification(
    userId: string, 
    alertType: string, 
    alertData: Record<string, any>
  ): Promise<void> {
    try {
      // Get user email from profile via API
      const response = await httpClient.get(`/user-management/users/${userId}`);
      const userProfile = response.data?.user;

      if (userProfile?.email) {
        await notificationService.sendSecurityAlert(
          userProfile.email,
          alertType as 'login_alert' | 'password_change' | 'security_alert',
          alertData
        );
      }
    } catch (error) {
      console.error('Failed to send security notification:', error);
    }
  }
}

export const securityService = new SecurityService();
export { SecurityService };
