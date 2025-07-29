// Core API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string; // For validation errors
  timestamp: string;
}

export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationInfo;
  totalCount?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// HTTP Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCache: boolean;
  cacheExpiry: number;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retryAttempts?: number;
  cache?: boolean;
  validateStatus?: (status: number) => boolean;
}

// Service Response Types
export interface ServiceResponse<T = any> {
  data?: T;
  error?: string;
  loading: boolean;
  metadata?: ResponseMetadata;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
  key: string;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface ApiKeyConfig {
  service: string;
  key: string;
  isActive: boolean;
  lastUpdated: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  tokens?: AuthTokens;
  user?: UserProfile;
  apiKeys: ApiKeyConfig[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  dateFormat: string;
  numberFormat: string;
  defaultChartType: string;
}