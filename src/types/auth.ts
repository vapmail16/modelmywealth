import { Database } from '@/integrations/supabase/types';

export type UserType = Database['public']['Enums']['user_type'];
export type AppRole = Database['public']['Enums']['app_role'];
export type Capability = Database['public']['Enums']['capability'];

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  user_type: UserType;
  created_at: string;
}

export interface RoleCapability {
  id: string;
  role: AppRole;
  user_type: UserType;
  capability: Capability;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
  roles: UserRole[];
  capabilities: Capability[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  user_type: UserType;
}

export interface AuthResponse {
  user: AuthUser;
  session: any;
}