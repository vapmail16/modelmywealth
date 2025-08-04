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

    const user = await this.getUserWithProfileFromAuthUser(data.user);
    
    return {
      user,
      session: data.session,
    };
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

    return this.getUserWithProfile(user.id);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await httpClient.get(`/user-management/users/${userId}`);
      return response.data?.user || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async getUserWithProfile(userId: string): Promise<AuthUser> {
    try {
      const response = await httpClient.get(`/user-management/users/${userId}`);
      const userData = response.data?.data || response.data?.user;
      
      if (!userData) {
        throw new Error('User profile not found');
      }

      // Get user roles
      const rolesResponse = await httpClient.get(`/user-management/roles?user_id=${userId}`);
      const roles = rolesResponse.data?.data || rolesResponse.data?.roles || [];

      // Get user capabilities
      const capabilitiesResponse = await httpClient.get(`/user-management/role-capabilities`);
      const allCapabilities = capabilitiesResponse.data?.data || capabilitiesResponse.data?.capabilities || [];
      
      const userCapabilities = this.extractUserCapabilities(roles, allCapabilities);

      return {
        id: userData.user_id,
        email: userData.email,
        profile: userData,
        roles,
        capabilities: userCapabilities,
      };
    } catch (error) {
      console.error('Error getting user with profile:', error);
      throw error;
    }
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

  async getUserWithProfileFromAuthUser(authUser: any, userId?: string): Promise<AuthUser> {
    const targetUserId = userId || authUser?.id;
    
    if (!targetUserId) {
      throw new Error('User ID not provided');
    }

    try {
      // Try to get existing profile via API
      return await this.getUserWithProfile(targetUserId);
    } catch (error) {
      // Profile doesn't exist, create it
      const email = authUser?.email || (await supabase.auth.getUser()).data.user?.email;
      const userMetadata = authUser?.user_metadata || (await supabase.auth.getUser()).data.user?.user_metadata;
      
      if (!email) {
        throw new Error('Unable to get user email');
      }

      // Create profile via API
      const profileData = {
        user_id: targetUserId,
        email,
        full_name: userMetadata?.full_name || email,
        user_type: userMetadata?.user_type || 'business',
      };

      try {
        await httpClient.post('/user-management/users', profileData);

        // Create default role via API
        await httpClient.post('/user-management/assign-role', {
          user_id: targetUserId,
          role: userMetadata?.user_type === 'tech' ? 'user' : 'analyst',
          user_type: userMetadata?.user_type || 'business',
        });

        // Return the created user with profile
        return await this.getUserWithProfile(targetUserId);
      } catch (createError) {
        console.error('Error creating user profile via API:', createError);
        throw new Error('Failed to create user profile');
      }
    }
  }

  async getUserCapabilities(userId: string): Promise<Capability[]> {
    try {
      const rolesResponse = await httpClient.get(`/user-management/roles?user_id=${userId}`);
      const roles = rolesResponse.data?.roles || [];

      const capabilitiesResponse = await httpClient.get(`/user-management/role-capabilities`);
      const allCapabilities = capabilitiesResponse.data?.capabilities || [];
      
      return this.extractUserCapabilities(roles, allCapabilities);
    } catch (error) {
      console.error('Error fetching user capabilities:', error);
      return [];
    }
  }

  async hasCapability(capability: Capability): Promise<boolean> {
    try {
      const response = await httpClient.get(`/user-management/capabilities/${capability}`);
      return response.data?.hasCapability || false;
    } catch (error) {
      console.error('Error checking capability:', error);
      return false;
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
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