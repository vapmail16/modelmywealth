import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import { FinancialData, ValidationError } from '@/types/financial';

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  isActive: boolean;
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  message: string;
  category: 'balance_sheet' | 'profit_loss' | 'cash_flow' | 'ratios';
  isActive: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  completeness: number;
  passedRules: string[];
  failedRules: string[];
}

export interface CalculationValidation {
  isConsistent: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

class ValidationService {
  private baseUrl = '/validation';

  /**
   * Validate complete financial data
   */
  async validateFinancialData(data: Partial<FinancialData>): Promise<ValidationResult> {
    const response = await httpClient.post<ValidationResult>(
      `${this.baseUrl}/financial-data`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate financial data');
    }
    
    return response.data!;
  }

  /**
   * Validate specific financial section
   */
  async validateSection(
    section: 'profit_loss' | 'balance_sheet' | 'debt_structure' | 'growth_assumptions',
    data: any
  ): Promise<ValidationResult> {
    const response = await httpClient.post<ValidationResult>(
      `${this.baseUrl}/section/${section}`,
      data
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate section');
    }
    
    return response.data!;
  }

  /**
   * Check business rules compliance
   */
  async checkBusinessRules(data: FinancialData): Promise<{
    compliant: boolean;
    passedRules: BusinessRule[];
    failedRules: BusinessRule[];
    warnings: BusinessRule[];
  }> {
    const response = await httpClient.post<{
      compliant: boolean;
      passedRules: BusinessRule[];
      failedRules: BusinessRule[];
      warnings: BusinessRule[];
    }>(`${this.baseUrl}/business-rules`, data);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to check business rules');
    }
    
    return response.data!;
  }

  /**
   * Validate calculations for consistency
   */
  async validateCalculations(
    inputs: FinancialData,
    results: any
  ): Promise<CalculationValidation> {
    const response = await httpClient.post<CalculationValidation>(
      `${this.baseUrl}/calculations`,
      { inputs, results }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate calculations');
    }
    
    return response.data!;
  }

  /**
   * Validate balance sheet balance
   */
  async validateBalanceSheetBalance(balanceSheet: any): Promise<{
    isBalanced: boolean;
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    difference: number;
    tolerance: number;
  }> {
    const response = await httpClient.post<{
      isBalanced: boolean;
      totalAssets: number;
      totalLiabilitiesAndEquity: number;
      difference: number;
      tolerance: number;
    }>(`${this.baseUrl}/balance-sheet-balance`, balanceSheet);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate balance sheet');
    }
    
    return response.data!;
  }

  /**
   * Validate data completeness
   */
  async validateCompleteness(data: Partial<FinancialData>): Promise<{
    completeness: number;
    missingFields: string[];
    optionalFields: string[];
    sections: {
      profitLoss: number;
      balanceSheet: number;
      debtStructure: number;
      growthAssumptions: number;
    };
  }> {
    const response = await httpClient.post<{
      completeness: number;
      missingFields: string[];
      optionalFields: string[];
      sections: {
        profitLoss: number;
        balanceSheet: number;
        debtStructure: number;
        growthAssumptions: number;
      };
    }>(`${this.baseUrl}/completeness`, data);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate completeness');
    }
    
    return response.data!;
  }

  /**
   * Get validation rules
   */
  async getValidationRules(): Promise<ValidationRule[]> {
    const response = await httpClient.get<ValidationRule[]>(
      `${this.baseUrl}/rules`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get validation rules');
    }
    
    return response.data!;
  }

  /**
   * Update validation rule
   */
  async updateValidationRule(ruleId: string, rule: Partial<ValidationRule>): Promise<ValidationRule> {
    const response = await httpClient.patch<ValidationRule>(
      `${this.baseUrl}/rules/${ruleId}`,
      rule
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update validation rule');
    }
    
    return response.data!;
  }

  /**
   * Get business rules
   */
  async getBusinessRules(): Promise<BusinessRule[]> {
    const response = await httpClient.get<BusinessRule[]>(
      `${this.baseUrl}/business-rules`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get business rules');
    }
    
    return response.data!;
  }

  /**
   * Create custom business rule
   */
  async createBusinessRule(rule: Omit<BusinessRule, 'id'>): Promise<BusinessRule> {
    const response = await httpClient.post<BusinessRule>(
      `${this.baseUrl}/business-rules`,
      rule
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create business rule');
    }
    
    return response.data!;
  }

  /**
   * Validate against industry benchmarks
   */
  async validateAgainstBenchmarks(
    data: FinancialData,
    industry: string,
    companySize: string
  ): Promise<{
    outliers: Array<{
      metric: string;
      value: number;
      benchmark: number;
      deviation: number;
      severity: 'low' | 'medium' | 'high';
    }>;
    recommendations: string[];
  }> {
    const response = await httpClient.post<{
      outliers: Array<{
        metric: string;
        value: number;
        benchmark: number;
        deviation: number;
        severity: 'low' | 'medium' | 'high';
      }>;
      recommendations: string[];
    }>(`${this.baseUrl}/benchmarks`, {
      data,
      industry,
      companySize
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate against benchmarks');
    }
    
    return response.data!;
  }

  /**
   * Validate data format and types
   */
  async validateDataFormat(data: any): Promise<{
    isValid: boolean;
    typeErrors: Array<{
      field: string;
      expected: string;
      actual: string;
      value: any;
    }>;
    formatErrors: Array<{
      field: string;
      message: string;
      value: any;
    }>;
  }> {
    const response = await httpClient.post<{
      isValid: boolean;
      typeErrors: Array<{
        field: string;
        expected: string;
        actual: string;
        value: any;
      }>;
      formatErrors: Array<{
        field: string;
        message: string;
        value: any;
      }>;
    }>(`${this.baseUrl}/format`, data);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate data format');
    }
    
    return response.data!;
  }

  /**
   * Validate covenant compliance
   */
  async validateCovenantCompliance(
    financialData: FinancialData,
    covenants: any[]
  ): Promise<{
    compliant: boolean;
    passedCovenants: any[];
    failedCovenants: any[];
    atRiskCovenants: any[];
  }> {
    const response = await httpClient.post<{
      compliant: boolean;
      passedCovenants: any[];
      failedCovenants: any[];
      atRiskCovenants: any[];
    }>(`${this.baseUrl}/covenants`, {
      financialData,
      covenants
    });
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate covenant compliance');
    }
    
    return response.data!;
  }

  /**
   * Get validation report
   */
  async getValidationReport(projectId: string): Promise<{
    summary: ValidationResult;
    businessRules: any;
    benchmarks: any;
    covenants: any;
    recommendations: string[];
    timestamp: string;
  }> {
    const response = await httpClient.get<{
      summary: ValidationResult;
      businessRules: any;
      benchmarks: any;
      covenants: any;
      recommendations: string[];
      timestamp: string;
    }>(`${this.baseUrl}/report/${projectId}`);
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get validation report');
    }
    
    return response.data!;
  }
}

// Create and export the service instance
export const validationService = new ValidationService();

// Export the class for testing or custom instances
export { ValidationService };