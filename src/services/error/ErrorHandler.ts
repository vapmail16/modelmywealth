import { ServiceError, ServiceResponse } from '@/types/common';
import { logger } from '../logging/LoggingService';

export class ErrorHandler {
  static handleServiceError(error: unknown, context: string): ServiceError {
    const timestamp = new Date().toISOString();
    
    if (error instanceof Error) {
      const serviceError: ServiceError = {
        code: error.name || 'UNKNOWN_ERROR',
        message: error.message,
        details: { stack: error.stack },
        timestamp,
      };
      
      logger.error(`Service error in ${context}`, serviceError, 'ErrorHandler');
      return serviceError;
    }
    
    if (typeof error === 'string') {
      const serviceError: ServiceError = {
        code: 'STRING_ERROR',
        message: error,
        timestamp,
      };
      
      logger.error(`String error in ${context}`, serviceError, 'ErrorHandler');
      return serviceError;
    }
    
    const serviceError: ServiceError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: error,
      timestamp,
    };
    
    logger.error(`Unknown error in ${context}`, serviceError, 'ErrorHandler');
    return serviceError;
  }

  static createSuccessResponse<T>(data: T): ServiceResponse<T> {
    return {
      data,
      error: null,
      success: true,
    };
  }

  static createErrorResponse<T>(error: ServiceError): ServiceResponse<T> {
    return {
      data: null,
      error,
      success: false,
    };
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<ServiceResponse<T>> {
    try {
      const data = await operation();
      return this.createSuccessResponse(data);
    } catch (error) {
      const serviceError = this.handleServiceError(error, context);
      return this.createErrorResponse(serviceError);
    }
  }

  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.toLowerCase().includes('network') ||
             error.message.toLowerCase().includes('fetch') ||
             error.message.toLowerCase().includes('connection');
    }
    return false;
  }

  static isAuthError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.toLowerCase().includes('unauthorized') ||
             error.message.toLowerCase().includes('forbidden') ||
             error.message.toLowerCase().includes('authentication');
    }
    return false;
  }

  static getRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptNumber), 30000);
  }
}