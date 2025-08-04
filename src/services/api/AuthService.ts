import { supabase } from '@/integrations/supabase/client';
import { httpClient } from '../index';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  AuthUser,
  UserProfile,
  UserRole,
  Capability
} from '@/types/auth';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Ensure profile exists for existing users
    await this.ensureUserProfile(data.user);

    const user = await this.getUserWithProfile(data.user.id);
    
    return {
      user,
      session: data.session,
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: credentials.full_name,
          user_type: credentials.user_type,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Check if email confirmation is required
    if (!data.session) {
      throw new Error('Please check your email and click the confirmation link to complete your registration.');
    }

    // Create profile synchronously during registration
    await this.ensureUserProfile(data.user, credentials);

    const user = await this.getUserWithProfile(data.user.id);
    
    return {
      user,
      session: data.session,
    };
  }

  private async ensureUserProfile(authUser: any, credentials?: RegisterCredentials): Promise<void> {
    const profileData = {
      user_id: authUser.id,
      email: authUser.email,
      full_name: credentials?.full_name || authUser.user_metadata?.full_name || authUser.email,
      user_type: credentials?.user_type || authUser.user_metadata?.user_type || 'business',
    };

    // Use edge function for profile creation
    const { error } = await supabase.functions.invoke('user-profile-creation', {
      body: profileData,
    });

    if (error) {
      console.error('Profile creation error:', error);
      // Don't throw error - registration should still succeed
    }
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    try {
      return this.getUserWithProfile(user.id);
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await httpClient.get(`/user-management/users/${userId}`);
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async getUserWithProfile(userId: string, retryCount = 0): Promise<AuthUser> {
    const maxRetries = 2;
    
    try {
      // Use API endpoint instead of direct database access
      const profileResponse = await httpClient.get(`/user-management/users/${userId}`);
      const profile = profileResponse.data?.data;
      
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Get user roles via API
      const rolesResponse = await httpClient.get(`/user-management/roles?user_id=${userId}`);
      const roles = rolesResponse.data?.data || [];

      // Get role capabilities via API
      const capabilitiesResponse = await httpClient.get(`/user-management/role-capabilities`);
      const allCapabilities = capabilitiesResponse.data?.data || [];
      
      const userCapabilities = this.extractUserCapabilities(roles, allCapabilities);

      return {
        id: userId,
        email: profile.email,
        profile,
        roles,
        capabilities: userCapabilities,
      };
    } catch (error) {
      // Retry logic for transient failures
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying getUserWithProfile (${retryCount + 1}/${maxRetries})`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.getUserWithProfile(userId, retryCount + 1);
      }
      
      // Fallback to direct database access if API fails
      return this.getUserWithProfileDirect(userId);
    }
  }

  private isRetryableError(error: any): boolean {
    if (!error) return false;
    
    // Network errors and temporary server errors
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'ECONNRESET'];
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    return retryableErrors.includes(error.code) || 
           retryableStatuses.includes(error.status) ||
           error.message?.includes('network') ||
           error.message?.includes('timeout');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getUserWithProfileDirect(userId: string): Promise<AuthUser> {
    // Direct database access as fallback
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    const { data: allCapabilities } = await supabase
      .from('role_capabilities')
      .select('*');
    
    const userCapabilities = this.extractUserCapabilities(roles || [], allCapabilities || []);

    return {
      id: userId,
      email: profile.email,
      profile,
      roles: roles || [],
      capabilities: userCapabilities,
    };
  }

  private extractUserCapabilities(roles: UserRole[], allCapabilities: any[]): Capability[] {
    const userCapabilities = new Set<Capability>();
    
    roles.forEach(role => {
      const roleCapabilities = allCapabilities.filter(
        cap => cap.role === role.role && cap.user_type === role.user_type
      );
      roleCapabilities.forEach(cap => userCapabilities.add(cap.capability));
    });
    
    return Array.from(userCapabilities);
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          // Ensure profile exists
          await this.ensureUserProfile(session.user);
          const user = await this.getUserWithProfile(session.user.id);
          callback(user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
}

export const authService = new AuthService();
export { AuthService };