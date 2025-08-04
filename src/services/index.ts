// Central export for all API services
export { financialDataService, FinancialDataService } from './api/FinancialDataService';
export { calculationService, CalculationService } from './api/CalculationService';
export { chartDataService, ChartDataService } from './api/ChartDataService';
export { reportService, ReportService } from './api/ReportService';
export { userService, UserService } from './api/UserService';
export { validationService, ValidationService } from './api/ValidationService';
export { mockDataService, MockDataService } from './api/MockDataService';
export { companyService, CompanyService } from './api/CompanyService';
export { projectService, ProjectService } from './api/ProjectService';
export { authService, AuthService } from './api/AuthService';
export { userManagementService, UserManagementService } from './api/UserManagementService';

// HTTP client
export { httpClient, HttpClient } from './http/client';

// Notification Service
export { notificationService, NotificationService } from './api/NotificationService';

// Import httpClient for internal use
import { httpClient } from './http/client';

// Service configuration
export const apiConfig = {
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3001/api' 
    : '/api',
  timeout: 30000,
  retryAttempts: 3,
  enableCache: true,
};

// Service health check
export const checkServiceHealth = async (): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    financialData: boolean;
    calculations: boolean;
    charts: boolean;
    reports: boolean;
    auth: boolean;
    validation: boolean;
  };
}> => {
  const services = {
    financialData: false,
    calculations: false,
    charts: false,
    reports: false,
    auth: false,
    validation: false,
  };

  try {
    // Check each service endpoint
    const checks = await Promise.allSettled([
      httpClient.get('/health/financial-data'),
      httpClient.get('/health/calculations'),
      httpClient.get('/health/charts'),
      httpClient.get('/health/reports'),
      httpClient.get('/health/auth'),
      httpClient.get('/health/validation'),
    ]);

    services.financialData = checks[0].status === 'fulfilled';
    services.calculations = checks[1].status === 'fulfilled';
    services.charts = checks[2].status === 'fulfilled';
    services.reports = checks[3].status === 'fulfilled';
    services.auth = checks[4].status === 'fulfilled';
    services.validation = checks[5].status === 'fulfilled';

    const healthyCount = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyCount === totalServices) {
      status = 'healthy';
    } else if (healthyCount >= totalServices / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, services };
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy', services };
  }
};

// Initialize all services
export const initializeServices = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing TTF-Refinancing API services...');
    
    // Check service health
    const health = await checkServiceHealth();
    console.log('📊 Service health status:', health);
    
    // Clear any stale cache
    httpClient.clearCache();
    
    console.log('✅ TTF-Refinancing API services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    throw error;
  }
};