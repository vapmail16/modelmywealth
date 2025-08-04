import { supabase } from '@/integrations/supabase/client';
import type { 
  UserProfile, 
  UserRole, 
  RoleCapability, 
  UserType, 
  AppRole, 
  Capability 
} from '@/types/auth';

class UserManagementService {
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  async getUsersByType(userType: UserType): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', userType)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch user roles: ${error.message}`);
    }

    return data || [];
  }

  async assignRole(userId: string, role: AppRole, userType: UserType): Promise<UserRole> {
    const { data, error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role,
        user_type: userType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    return data;
  }

  async removeRole(userId: string, role: AppRole, userType: UserType): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role)
      .eq('user_type', userType);

    if (error) {
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  }

  async getRoleCapabilities(role: AppRole, userType: UserType): Promise<RoleCapability[]> {
    const { data, error } = await supabase
      .from('role_capabilities')
      .select('*')
      .eq('role', role)
      .eq('user_type', userType);

    if (error) {
      throw new Error(`Failed to fetch role capabilities: ${error.message}`);
    }

    return data || [];
  }

  async addRoleCapability(role: AppRole, userType: UserType, capability: Capability): Promise<RoleCapability> {
    const { data, error } = await supabase
      .from('role_capabilities')
      .insert({
        role,
        user_type: userType,
        capability,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add capability: ${error.message}`);
    }

    return data;
  }

  async removeRoleCapability(role: AppRole, userType: UserType, capability: Capability): Promise<void> {
    const { error } = await supabase
      .from('role_capabilities')
      .delete()
      .eq('role', role)
      .eq('user_type', userType)
      .eq('capability', capability);

    if (error) {
      throw new Error(`Failed to remove capability: ${error.message}`);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  async getAllCapabilities(): Promise<Capability[]> {
    // This could be dynamic from database in the future
    return [
      'manage_users',
      'manage_roles',
      'view_analytics',
      'create_reports',
      'manage_companies',
      'manage_projects',
      'view_financial_data',
      'edit_financial_data',
      'export_data',
      'system_settings',
    ];
  }
}

export const userManagementService = new UserManagementService();
export { UserManagementService };