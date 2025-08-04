import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse, ApiError, RequestConfig, ApiClientConfig } from '@/types/api';

// Extend the AxiosRequestConfig to include metadata
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  metadata?: {
    retryCount?: number;
    [key: string]: any;
  };
}

class HttpClient {
  private client: AxiosInstance;
  private config: ApiClientConfig;
  private cache: Map<string, any> = new Map();

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add authentication headers
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();

        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
          headers: config.headers,
          data: config.data,
        });

        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`✅ ${response.status} ${response.config.url}`, {
          data: response.data,
          duration: this.calculateDuration(response.config.headers['X-Request-Time']),
        });

        // Cache successful responses if enabled
        if (this.config.enableCache && response.config.method === 'get') {
          this.cacheResponse(response.config.url!, response.data);
        }

        return response;
      },
      async (error: AxiosError) => {
        console.error(`❌ ${error.response?.status} ${error.config?.url}`, {
          error: error.response?.data,
          duration: this.calculateDuration(error.config?.headers['X-Request-Time']),
        });

        // Handle specific error cases
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }

        // Retry logic for network errors
        if (this.shouldRetry(error)) {
          return this.retryRequest(error.config!);
        }

        // Transform error to our format
        const apiError = this.transformError(error);
        return Promise.reject(apiError);
      }
    );
  }

  private getAuthToken(): string | null {
    // Simple token extraction from Supabase
    try {
      const authSession = localStorage.getItem(`sb-vmrvugezqpydlfjcoldl-auth-token`);
      if (authSession) {
        const session = JSON.parse(authSession);
        return session.access_token;
      }
    } catch (error) {
      console.error('Error parsing auth token:', error);
    }
    return null;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDuration(startTime: string): number {
    if (!startTime) return 0;
    return Date.now() - new Date(startTime).getTime();
  }

  private cacheResponse(url: string, data: any) {
    const cacheKey = this.getCacheKey(url);
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.config.cacheExpiry,
    };
    this.cache.set(cacheKey, cacheEntry);
  }

  private getCachedResponse(url: string): any | null {
    const cacheKey = this.getCacheKey(url);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      console.log(`💾 Cache hit for ${url}`);
      return cached.data;
    }
    
    if (cached) {
      this.cache.delete(cacheKey);
    }
    
    return null;
  }

  private getCacheKey(url: string): string {
    return `cache_${url}`;
  }

  private shouldRetry(error: AxiosError): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    const config = error.config as ExtendedAxiosRequestConfig;
    const hasRetryAttempts = config && !(config.metadata?.retryCount);
    
    return (
      hasRetryAttempts &&
      (error.code === 'NETWORK_ERROR' || 
       error.code === 'TIMEOUT' ||
       (error.response && retryableStatuses.includes(error.response.status)))
    );
  }

  private async retryRequest(config: ExtendedAxiosRequestConfig): Promise<AxiosResponse> {
    const retryCount = (config.metadata?.retryCount || 0) + 1;
    const maxRetries = this.config.retryAttempts;

    if (retryCount > maxRetries) {
      throw new Error('Max retry attempts exceeded');
    }

    // Exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, retryCount - 1);
    await this.sleep(delay);

    console.log(`🔄 Retry attempt ${retryCount}/${maxRetries} for ${config.url}`);

    config.metadata = { ...config.metadata, retryCount };
    return this.client.request(config);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async handleUnauthorized(): Promise<void> {
    // Simple redirect to auth page
    window.location.href = '/auth';
  }


  private transformError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    if (error.response?.data) {
      const responseError = error.response.data as any;
      apiError.code = responseError.code || apiError.code;
      apiError.message = responseError.message || apiError.message;
      apiError.details = responseError.details;
      apiError.field = responseError.field;
    }

    return apiError;
  }

  // Public methods
  async get<T = any>(
    url: string, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // Check cache first
    if (config?.cache !== false && this.config.enableCache) {
      const cached = this.getCachedResponse(url);
      if (cached) {
        return cached;
      }
    }

    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(
    url: string, 
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update axios instance if needed
    if (config.baseURL) {
      this.client.defaults.baseURL = config.baseURL;
    }
    if (config.timeout) {
      this.client.defaults.timeout = config.timeout;
    }
  }
}

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'https://vmrvugezqpydlfjcoldl.supabase.co/functions/v1' 
    : 'https://vmrvugezqpydlfjcoldl.supabase.co/functions/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  enableCache: true,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes
};

// Create and export the default client instance
export const httpClient = new HttpClient(defaultConfig);

// Export the class for creating custom instances
export { HttpClient };

// Export types
export type { ApiClientConfig, RequestConfig };