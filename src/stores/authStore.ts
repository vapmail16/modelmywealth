import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/services/api/AuthService';
import type { AuthUser, LoginCredentials, RegisterCredentials, Capability } from '@/types/auth';

interface AuthState {
  // User data
  user: AuthUser | null;
  isAuthenticated: boolean;
  
  // UI states
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasCapability: (capability: Capability) => boolean;
  
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

      // Authentication actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoggingIn: true });
        try {
          const response = await authService.login(credentials.email, credentials.password);
          
          set({
            user: response,
            isAuthenticated: true,
            isLoggingIn: false,
          });
        } catch (error) {
          set({ isLoggingIn: false });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isRegistering: true });
        try {
          const response = await authService.register(
            credentials.email, 
            credentials.password, 
            credentials.full_name, 
            credentials.user_type
          );
          
          set({
            user: response,
            isAuthenticated: true,
            isRegistering: false,
          });
        } catch (error) {
          set({ isRegistering: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
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

      forgotPassword: async (email: string) => {
        try {
          await authService.forgotPassword(email);
        } catch (error) {
          throw error;
        }
      },

      // Initialization
      initialize: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isAuthenticated: !!user,
          });
          
          // Set up auth state listener
          authService.onAuthStateChange((user) => {
            set({
              user,
              isAuthenticated: !!user,
            });
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: () => ({}), // Don't persist any auth state
    }
  )
);