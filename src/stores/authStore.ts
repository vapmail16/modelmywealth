import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/api/AuthService';
import { securityService } from '@/services/security/SecurityService';
import type { AuthUser, LoginCredentials, RegisterCredentials, Capability } from '@/types/auth';

interface AuthState {
  // User data
  user: AuthUser | null;
  isAuthenticated: boolean;
  
  // UI states
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  
  // Security states
  sessionStartTime: number | null;
  lastActivity: number | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasCapability: (capability: Capability) => boolean;
  updateActivity: () => void;
  
  // Initialization
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isLoggingIn: false,
      isRegistering: false,
      sessionStartTime: null,
      lastActivity: null,

      // Authentication actions
      login: async (credentials: LoginCredentials) => {
        // Check rate limiting
        const clientIP = await securityService.getClientIP?.() || 'unknown';
        const canAttempt = await securityService.checkRateLimit('login', clientIP);
        
        if (!canAttempt) {
          await securityService.logSecurityEvent('unknown', 'login_blocked', 'high', {
            email: credentials.email,
            reason: 'rate_limited',
          });
          throw new Error('Too many login attempts. Please try again later.');
        }

        set({ isLoggingIn: true });
        try {
          const response = await authService.login(credentials);
          const now = Date.now();
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoggingIn: false,
            sessionStartTime: now,
            lastActivity: now,
          });

          // Track session and log successful login
          await securityService.trackSession(response.user.id);
          await securityService.logSecurityEvent(response.user.id, 'login_success', 'low');
        } catch (error) {
          set({ isLoggingIn: false });
          
          // Log failed login attempt
          await securityService.logSecurityEvent('unknown', 'login_failed', 'medium', {
            email: credentials.email,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        // Validate password policy
        const passwordValidation = securityService.validatePassword(credentials.password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.errors.join(', '));
        }

        set({ isRegistering: true });
        try {
          const response = await authService.register(credentials);
          const now = Date.now();
          
          set({
            user: response.user,
            isAuthenticated: true,
            isRegistering: false,
            sessionStartTime: now,
            lastActivity: now,
          });

          // Track session and log registration
          await securityService.trackSession(response.user.id);
          await securityService.logSecurityEvent(response.user.id, 'login_success', 'low', {
            action: 'registration',
          });
        } catch (error) {
          set({ isRegistering: false });
          throw error;
        }
      },

      logout: async () => {
        const { user } = get();
        
        try {
          await authService.logout();
          
          if (user) {
            await securityService.invalidateSession(user.id);
            await securityService.logSecurityEvent(user.id, 'logout', 'low');
          }
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            sessionStartTime: null,
            lastActivity: null,
          });
        }
      },

      refreshUser: async () => {
        try {
          const user = await authService.getCurrentUser();
          set({ 
            user,
            isAuthenticated: !!user,
          });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      hasCapability: (capability: Capability) => {
        const { user } = get();
        return user?.capabilities?.includes(capability) || false;
      },

      updateActivity: () => {
        const { user, isAuthenticated } = get();
        if (isAuthenticated && user) {
          const now = Date.now();
          set({ lastActivity: now });
          securityService.updateSessionActivity(user.id);
        }
      },

      // Initialization
      initialize: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          const now = Date.now();
          
          set({
            user,
            isAuthenticated: !!user,
            sessionStartTime: user ? now : null,
            lastActivity: user ? now : null,
          });

          if (user) {
            await securityService.trackSession(user.id);
          }
          
          // Set up auth state listener
          authService.onAuthStateChange((user) => {
            const now = Date.now();
            set({
              user,
              isAuthenticated: !!user,
              sessionStartTime: user ? now : null,
              lastActivity: user ? now : null,
            });
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            isAuthenticated: false,
            sessionStartTime: null,
            lastActivity: null,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist essential data - NOT sensitive session info
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);