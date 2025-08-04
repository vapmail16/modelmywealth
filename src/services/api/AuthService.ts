import { supabase } from '@/integrations/supabase/client';
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

    const user = await this.getUserWithProfile(data.user.id);
    
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

  async getUserWithProfile(userId: string): Promise<AuthUser> {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (rolesError) {
      throw new Error(`Failed to fetch roles: ${rolesError.message}`);
    }

    // Get capabilities for user's roles
    const capabilities = await this.getUserCapabilities(userId);

    return {
      id: userId,
      email: profile.email,
      profile,
      roles: roles || [],
      capabilities,
    };
  }

  async getUserCapabilities(userId: string): Promise<Capability[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role,
        user_type,
        role_capabilities!inner(capability)
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch capabilities: ${error.message}`);
    }

    const capabilities = new Set<Capability>();
    
    data?.forEach((userRole: any) => {
      userRole.role_capabilities?.forEach((rc: any) => {
        capabilities.add(rc.capability);
      });
    });

    return Array.from(capabilities);
  }

  async hasCapability(capability: Capability): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .rpc('user_has_capability', {
        _user_id: user.id,
        _capability: capability,
      });

    if (error) {
      console.error('Error checking capability:', error);
      return false;
    }

    return data || false;
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