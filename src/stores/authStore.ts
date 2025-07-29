import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, ApiKeyConfig } from '@/types/api';
import { userService } from '@/services/api/UserService';

interface AuthState {
  // User data
  user: UserProfile | null;
  isAuthenticated: boolean;
  
  // API keys
  apiKeys: ApiKeyConfig[];
  
  // UI states
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  // API key management
  loadApiKeys: () => Promise<void>;
  saveApiKey: (service: string, key: string) => Promise<void>;
  deleteApiKey: (keyId: string) => Promise<void>;
  testApiKey: (service: string) => Promise<boolean>;
  
  // Initialization
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      apiKeys: [],
      isLoading: false,
      isLoggingIn: false,
      isRegistering: false,

      // Authentication actions
      login: async (email: string, password: string) => {
        set({ isLoggingIn: true });
        try {
          const response = await userService.login({ email, password });
          set({
            user: response.user,
            isAuthenticated: true,
            isLoggingIn: false,
          });
          
          // Load API keys after login
          get().loadApiKeys();
        } catch (error) {
          set({ isLoggingIn: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isRegistering: true });
        try {
          const response = await userService.register({ email, password, name });
          set({
            user: response.user,
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
          await userService.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            apiKeys: [],
          });
        }
      },

      refreshUserProfile: async () => {
        try {
          const user = await userService.getUserProfile();
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user profile:', error);
          throw error;
        }
      },

      updateProfile: async (profile: Partial<UserProfile>) => {
        try {
          const updatedUser = await userService.updateUserProfile(profile);
          set({ user: updatedUser });
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        }
      },

      // API key management
      loadApiKeys: async () => {
        try {
          const apiKeys = await userService.getApiKeys();
          set({ apiKeys });
        } catch (error) {
          console.error('Failed to load API keys:', error);
        }
      },

      saveApiKey: async (service: string, key: string) => {
        try {
          const newApiKey = await userService.saveApiKey(service, key);
          set((state) => ({
            apiKeys: [...state.apiKeys.filter(k => k.service !== service), newApiKey],
          }));
        } catch (error) {
          console.error('Failed to save API key:', error);
          throw error;
        }
      },

      deleteApiKey: async (keyId: string) => {
        try {
          await userService.deleteApiKey(keyId);
          set((state) => ({
            apiKeys: state.apiKeys.filter(k => k.service !== keyId),
          }));
        } catch (error) {
          console.error('Failed to delete API key:', error);
          throw error;
        }
      },

      testApiKey: async (service: string) => {
        try {
          const result = await userService.testApiKey(service);
          return result.isValid;
        } catch (error) {
          console.error('Failed to test API key:', error);
          return false;
        }
      },

      // Initialization
      initialize: async () => {
        set({ isLoading: true });
        try {
          // Check if user is already authenticated
          if (userService.isAuthenticated()) {
            const user = userService.getCurrentUser();
            if (user) {
              set({
                user,
                isAuthenticated: true,
              });
              
              // Refresh user profile and load API keys
              await Promise.all([
                get().refreshUserProfile(),
                get().loadApiKeys(),
              ]);
            }
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // If initialization fails, clear auth state
          set({
            user: null,
            isAuthenticated: false,
            apiKeys: [],
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist essential data
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);