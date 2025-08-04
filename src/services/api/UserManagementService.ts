import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import type { 
  UserProfile, 
  UserRole, 
  RoleCapability, 
  UserType, 
  AppRole, 
  Capability 
} from '@/types/auth';

class UserManagementService {
  private baseUrl = '/user-management';

  async getAllUsers(): Promise<UserProfile[]> {
    const response: ApiResponse<UserProfile[]> = await httpClient.get(
      `${this.baseUrl}/users`
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to fetch users';
      console.error('Failed to fetch users:', response.error);
      throw new Error(errorMessage);
    }

    return response.data || [];
  }

  async getUsersByType(userType: UserType): Promise<UserProfile[]> {
    const response: ApiResponse<UserProfile[]> = await httpClient.get(
      `${this.baseUrl}/users?user_type=${userType}`
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to fetch users';
      console.error('Failed to fetch users:', response.error);
      throw new Error(errorMessage);
    }

    return response.data || [];
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const response: ApiResponse<UserRole[]> = await httpClient.get(
      `${this.baseUrl}/roles?user_id=${userId}`
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to fetch user roles';
      console.error('Failed to fetch user roles:', response.error);
      throw new Error(errorMessage);
    }

    return response.data || [];
  }

  async assignRole(userId: string, role: AppRole, userType: UserType): Promise<UserRole> {
    const response: ApiResponse<UserRole> = await httpClient.post(
      `${this.baseUrl}/assign-role`,
      {
        user_id: userId,
        role,
        user_type: userType
      }
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to assign role';
      console.error('Failed to assign role:', response.error);
      throw new Error(errorMessage);
    }

    return response.data!;
  }

  async removeRole(userId: string, role: AppRole, userType: UserType): Promise<void> {
    // For DELETE with body, we need to use POST to the remove-role endpoint
    const response: ApiResponse<void> = await httpClient.post(
      `${this.baseUrl}/remove-role`,
      {
        user_id: userId,
        role,
        user_type: userType
      }
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to remove role';
      console.error('Failed to remove role:', response.error);
      throw new Error(errorMessage);
    }
  }

  async getRoleCapabilities(): Promise<RoleCapability[]> {
    const response: ApiResponse<RoleCapability[]> = await httpClient.get(
      `${this.baseUrl}/role-capabilities`
    );

    if (!response.success || response.error) {
      const errorMessage = response.error?.message || 'Failed to fetch role capabilities';
      console.error('Failed to fetch role capabilities:', response.error);
      throw new Error(errorMessage);
    }

    return response.data || [];
  }

  async hasCapability(userId: string, capability: Capability): Promise<boolean> {
    const response: ApiResponse<boolean> = await httpClient.get(
      `${this.baseUrl}/capabilities?capability=${capability}`
    );

    if (!response.success || response.error) {
      console.error('Error checking capability:', response.error);
      return false;
    }

    return response.data || false;
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