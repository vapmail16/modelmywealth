import { httpClient } from '../http/client';
import { ApiResponse, AuthTokens, UserProfile, ApiKeyConfig } from '@/types/api';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
  isFirstLogin: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  dateFormat: string;
  numberFormat: string;
  defaultChartType: string;
  notificationsEnabled: boolean;
  autoSaveInterval: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  newPassword: string;
}

class UserService {
  private baseUrl = '/auth';

  /**
   * User authentication
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      `${this.baseUrl}/login`,
      credentials
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Login failed');
    }
    
    // Store auth data
    const authData = {
      user: response.data!.user,
      tokens: response.data!.tokens,
      expiresAt: response.data!.tokens.expiresAt
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    return response.data!;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await httpClient.post<AuthResponse>(
      `${this.baseUrl}/register`,
      credentials
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Registration failed');
    }
    
    // Store auth data
    const authData = {
      user: response.data!.user,
      tokens: response.data!.tokens,
      expiresAt: response.data!.tokens.expiresAt
    };
    localStorage.setItem('auth', JSON.stringify(authData));
    
    return response.data!;
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post(`${this.baseUrl}/logout`);
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
  }

  async refreshToken(): Promise<AuthTokens> {
    const authData = localStorage.getItem('auth');
    if (!authData) {
      throw new Error('No auth data found');
    }

    const { tokens } = JSON.parse(authData);
    const response = await httpClient.post<AuthTokens>(
      `${this.baseUrl}/refresh`,
      { refreshToken: tokens.refreshToken }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Token refresh failed');
    }
    
    // Update stored tokens
    const updatedAuthData = {
      ...JSON.parse(authData),
      tokens: response.data!
    };
    localStorage.setItem('auth', JSON.stringify(updatedAuthData));
    
    return response.data!;
  }

  /**
   * User profile management
   */
  async getUserProfile(): Promise<UserProfile> {
    const response = await httpClient.get<UserProfile>(
      `${this.baseUrl}/profile`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get user profile');
    }
    
    return response.data!;
  }

  async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await httpClient.patch<UserProfile>(
      `${this.baseUrl}/profile`,
      profile
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update profile');
    }
    
    return response.data!;
  }

  /**
   * Password management
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/change-password`,
      { currentPassword, newPassword }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to change password');
    }
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/reset-password-request`,
      request
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to request password reset');
    }
  }

  async resetPassword(reset: PasswordReset): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/reset-password`,
      reset
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reset password');
    }
  }

  /**
   * API key management
   */
  async getApiKeys(): Promise<ApiKeyConfig[]> {
    const response = await httpClient.get<ApiKeyConfig[]>(
      `${this.baseUrl}/api-keys`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get API keys');
    }
    
    return response.data!;
  }

  async saveApiKey(service: string, key: string): Promise<ApiKeyConfig> {
    const response = await httpClient.post<ApiKeyConfig>(
      `${this.baseUrl}/api-keys`,
      { service, key }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to save API key');
    }
    
    return response.data!;
  }

  async updateApiKey(keyId: string, key: string): Promise<ApiKeyConfig> {
    const response = await httpClient.patch<ApiKeyConfig>(
      `${this.baseUrl}/api-keys/${keyId}`,
      { key }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update API key');
    }
    
    return response.data!;
  }

  async deleteApiKey(keyId: string): Promise<void> {
    const response = await httpClient.delete(
      `${this.baseUrl}/api-keys/${keyId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete API key');
    }
  }

  async testApiKey(service: string): Promise<{ isValid: boolean; error?: string }> {
    const response = await httpClient.post<{ isValid: boolean; error?: string }>(
      `${this.baseUrl}/api-keys/test`,
      { service }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to test API key');
    }
    
    return response.data!;
  }

  /**
   * User preferences
   */
  async getUserPreferences(): Promise<UserPreferences> {
    const response = await httpClient.get<UserPreferences>(
      `${this.baseUrl}/preferences`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get preferences');
    }
    
    return response.data!;
  }

  async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await httpClient.patch<UserPreferences>(
      `${this.baseUrl}/preferences`,
      preferences
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update preferences');
    }
    
    return response.data!;
  }

  /**
   * Session management
   */
  async getSessions(): Promise<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>> {
    const response = await httpClient.get<Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>>(`${this.baseUrl}/sessions`);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get sessions');
    }
    
    return response.data!;
  }

  async revokeSession(sessionId: string): Promise<void> {
    const response = await httpClient.delete(
      `${this.baseUrl}/sessions/${sessionId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke session');
    }
  }

  async revokeAllSessions(): Promise<void> {
    const response = await httpClient.delete(
      `${this.baseUrl}/sessions`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke all sessions');
    }
  }

  /**
   * Account management
   */
  async deleteAccount(password: string): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/delete-account`,
      { password }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete account');
    }
    
    // Clear local storage
    localStorage.removeItem('auth');
  }

  async exportUserData(): Promise<{ url: string; filename: string }> {
    const response = await httpClient.post<{ url: string; filename: string }>(
      `${this.baseUrl}/export-data`,
      {},
      { timeout: 30000 }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export user data');
    }
    
    return response.data!;
  }

  /**
   * Utility functions
   */
  isAuthenticated(): boolean {
    const authData = localStorage.getItem('auth');
    if (!authData) return false;
    
    try {
      const { tokens } = JSON.parse(authData);
      return tokens.expiresAt > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser(): UserProfile | null {
    const authData = localStorage.getItem('auth');
    if (!authData) return null;
    
    try {
      const { user } = JSON.parse(authData);
      return user;
    } catch {
      return null;
    }
  }

  getAuthToken(): string | null {
    const authData = localStorage.getItem('auth');
    if (!authData) return null;
    
    try {
      const { tokens } = JSON.parse(authData);
      return tokens.accessToken;
    } catch {
      return null;
    }
  }
}

// Create and export the service instance
export const userService = new UserService();

// Export the class for testing or custom instances
export { UserService };