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

    // Check if email confirmation is required
    if (!data.session) {
      // Email confirmation is required - this is normal behavior
      throw new Error('Please check your email and click the confirmation link to complete your registration.');
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
      return response.data?.data || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  private async getUserWithProfile(userId: string): Promise<AuthUser> {
    // Get user profile directly from Supabase
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get user roles directly from Supabase
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    // Get role capabilities directly from Supabase
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

  async getUserWithProfileFromAuthUser(authUser: any, userId?: string): Promise<AuthUser> {
    const targetUserId = userId || authUser?.id;
    
    if (!targetUserId) {
      throw new Error('User ID not provided');
    }

    try {
      // Try to get existing profile
      return await this.getUserWithProfile(targetUserId);
    } catch (error) {
      // Profile doesn't exist, create it using the edge function
      const email = authUser?.email || (await supabase.auth.getUser()).data.user?.email;
      const userMetadata = authUser?.user_metadata || (await supabase.auth.getUser()).data.user?.user_metadata;
      
      if (!email) {
        throw new Error('Unable to get user email');
      }

      const profileData = {
        user_id: targetUserId,
        email,
        full_name: userMetadata?.full_name || email,
        user_type: userMetadata?.user_type || 'business',
      };

      // Use the edge function for profile creation
      const { error: createError } = await supabase.functions.invoke('user-profile-creation', {
        body: profileData,
      });

      if (createError) {
        throw new Error('Failed to create user profile');
      }

      // Return the created user with profile
      return await this.getUserWithProfile(targetUserId);
    }
  }

  async getUserCapabilities(userId: string): Promise<Capability[]> {
    try {
      const rolesResponse = await httpClient.get(`/user-management/roles?user_id=${userId}`);
      const roles = rolesResponse.data?.data || [];

      const capabilitiesResponse = await httpClient.get(`/user-management/role-capabilities`);
      const allCapabilities = capabilitiesResponse.data?.data || [];
      
      return this.extractUserCapabilities(roles, allCapabilities);
    } catch (error) {
      console.error('Error fetching user capabilities:', error);
      return [];
    }
  }

  async hasCapability(capability: Capability): Promise<boolean> {
    try {
      const response = await httpClient.get(`/user-management/capabilities?capability=${capability}`);
      return response.data?.data || false;
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