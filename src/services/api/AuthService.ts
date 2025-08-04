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

    // Pass the user data directly instead of fetching
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

  async getUserWithProfile(userId: string): Promise<AuthUser> {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Failed to fetch profile: ${profileError.message}`);
    }

    // If no profile exists, create one from auth user data
    if (!profile) {
      return this.getUserWithProfileFromAuthUser(null, userId);
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

  async getUserWithProfileFromAuthUser(authUser: any, userId?: string): Promise<AuthUser> {
    const targetUserId = userId || authUser?.id;
    
    if (!targetUserId) {
      throw new Error('User ID not provided');
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (existingProfile) {
      // Profile exists, use regular flow
      return this.getUserWithProfile(targetUserId);
    }

    // Profile doesn't exist, create it
    const email = authUser?.email || (await supabase.auth.getUser()).data.user?.email;
    const userMetadata = authUser?.user_metadata || (await supabase.auth.getUser()).data.user?.user_metadata;
    
    if (!email) {
      throw new Error('Unable to get user email');
    }

    // Create profile manually
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: targetUserId,
        email: email,
        full_name: userMetadata?.full_name || email,
        user_type: userMetadata?.user_type || 'business',
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create profile: ${createError.message}`);
    }

    // Create default role
    await supabase
      .from('user_roles')
      .insert({
        user_id: targetUserId,
        role: userMetadata?.user_type === 'tech' ? 'user' : 'analyst',
        user_type: userMetadata?.user_type || 'business',
      });

    // Get user roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', targetUserId);

    if (rolesError) {
      throw new Error(`Failed to fetch roles: ${rolesError.message}`);
    }

    // Get capabilities for user's roles
    const capabilities = await this.getUserCapabilities(targetUserId);

    return {
      id: targetUserId,
      email: newProfile.email,
      profile: newProfile,
      roles: roles || [],
      capabilities,
    };
  }

  async getUserCapabilities(userId: string): Promise<Capability[]> {
    // Get user roles first
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, user_type')
      .eq('user_id', userId);

    if (rolesError) {
      throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
    }

    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    // Get capabilities for each role separately
    const allCapabilities = new Set<Capability>();
    
    for (const userRole of userRoles) {
      const { data: roleCapabilities, error: capError } = await supabase
        .from('role_capabilities')
        .select('capability')
        .eq('role', userRole.role)
        .eq('user_type', userRole.user_type);

      if (capError) {
        console.error('Error fetching capabilities for role:', capError);
        continue;
      }

      roleCapabilities?.forEach((rc: any) => {
        allCapabilities.add(rc.capability);
      });
    }

    return Array.from(allCapabilities);
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