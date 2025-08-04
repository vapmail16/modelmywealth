// Type definitions for improved type safety
export interface ChartDataPoint {
  year: number;
  value?: number;
  label?: string;
  // Allow any additional properties for financial data
  [key: string]: number | string | undefined;
}

export interface FinancialMetric {
  name: string;
  value: number;
  unit: 'currency' | 'percentage' | 'ratio' | 'number';
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface FormatterFunction {
  (value: number, name?: string): [string, string];
}

export interface TooltipFormatterProps {
  value: number;
  name?: string;
  unit?: string;
}

// Enhanced chart component interfaces
export interface EnhancedChartProps extends ChartProps {
  metrics?: FinancialMetric[];
  formatter?: FormatterFunction;
  colors?: string[];
}

// Error boundaries
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// Service interfaces
export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
  success: boolean;
}

// Database types
export interface DatabaseQueryOptions {
  select?: string;
  where?: Record<string, unknown>;
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  single?: boolean;
}

export interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProjectRecord extends DatabaseRecord {
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'completed';
  company_id: string;
}

export interface CompanyRecord extends DatabaseRecord {
  name: string;
  industry?: string;
  headquarters?: string;
  description?: string;
}

// Configuration types
export interface AppEnvironment {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

// Utility types
export type StringOrNumber = string | number;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
  required: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern';
  value?: StringOrNumber;
  message: string;
}