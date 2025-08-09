// AuthService class definition
export interface User {
  id: string;
  email: string;
  name: string;
  user_type: string;
  role: string;
  email_verified: boolean;
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
  };
}

export interface TokenResponse {
  access_token: string;
  expires_at: string;
}

export class AuthService {
  private baseUrl = 'http://localhost:3001/api';

  // Token management
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // User management
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  setCurrentUser(user: User): void {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  clearCurrentUser(): void {
    localStorage.removeItem("currentUser");
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || null;
  }

  // API request helper with token refresh
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        const newToken = this.getAccessToken();
        return fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
        });
      } else {
        // Refresh failed, logout user
        this.logout();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  // Token refresh
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data: TokenResponse = await response.json();
        this.setAccessToken(data.data.access_token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const responseData = await response.json();
      
      // Handle the actual backend response structure
      const data = responseData.data;
      
      // Store tokens and user
      this.setAccessToken(data.session.access_token);
      this.setRefreshToken(data.session.refresh_token);
      this.setCurrentUser(data.user);

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        // Call logout endpoint to invalidate refresh token
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear all auth data
      this.clearTokens();
      this.clearCurrentUser();
    }

    return true;
  }

  async register(email: string, password: string, full_name: string, user_type: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name, 
          user_type 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }

      const responseData = await response.json();
      
      // Handle the actual backend response structure
      const data = responseData.data;
      
      // Note: User is not automatically logged in after registration
      // They need to verify their email first
      return data.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Email verification failed');
      }

      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset request failed');
      }

      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Password reset failed');
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async getUserProfile(): Promise<User> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/auth/profile`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user profile');
      }

      const responseData = await response.json();
      const user = responseData.data;
      
      // Update stored user data
      this.setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  async updateUserProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user profile');
      }

      const responseData = await response.json();
      const user = responseData.data;
      
      // Update stored user data
      this.setCurrentUser(user);
      
      return user;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Auth state change listener (simplified version for JWT-based auth)
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    // For JWT-based auth, we don't have real-time auth state changes
    // This is a simplified implementation that just calls the callback with current user
    const currentUser = this.getCurrentUser();
    callback(currentUser);
    
    // Return a cleanup function (no-op for JWT auth)
    return () => {
      // No cleanup needed for JWT auth
    };
  }
}

// Default auth service instance
export const authService = new AuthService();
