import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';
import { 
  FinancialData, 
  CalculationResults, 
  SensitivityAnalysis,
  ScenarioAnalysis,
  GrowthScenario
} from '@/types/financial';

export interface CalculationOptions {
  includeProjections: boolean;
  projectionYears: number;
  includeSensitivity: boolean;
  includeScenarios: boolean;
  scenarios?: GrowthScenario[];
}

export interface CalculationStatus {
  id: string;
  status: 'queued' | 'calculating' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface BenchmarkData {
  industry: string;
  size: string;
  metrics: {
    debtToEbitda: { median: number; p25: number; p75: number };
    dscr: { median: number; p25: number; p75: number };
    interestCoverage: { median: number; p25: number; p75: number };
    ebitdaMargin: { median: number; p25: number; p75: number };
  };
}

class CalculationService {
  private baseUrl = '/calculations';

  /**
   * Perform real-time calculations on financial data
   */
  async calculateMetrics(data: FinancialData, options?: Partial<CalculationOptions>): Promise<CalculationResults> {
    const requestBody = {
      data,
      options: {
        includeProjections: true,
        projectionYears: 5,
        includeSensitivity: false,
        includeScenarios: false,
        ...options
      }
    };

    const response = await httpClient.post<CalculationResults>(
      `${this.baseUrl}/metrics`,
      requestBody
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to calculate metrics');
    }
    
    return response.data!;
  }

  /**
   * Start asynchronous calculation for complex scenarios
   */
  async startAsyncCalculation(
    data: FinancialData, 
    options: CalculationOptions
  ): Promise<{ calculationId: string }> {
    const response = await httpClient.post<{ calculationId: string }>(
      `${this.baseUrl}/async`,
      { data, options }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to start calculation');
    }
    
    return response.data!;
  }

  /**
   * Get status of async calculation
   */
  async getCalculationStatus(calculationId: string): Promise<CalculationStatus> {
    const response = await httpClient.get<CalculationStatus>(
      `${this.baseUrl}/status/${calculationId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get calculation status');
    }
    
    return response.data!;
  }

  /**
   * Get results of completed async calculation
   */
  async getCalculationResults(calculationId: string): Promise<CalculationResults> {
    const response = await httpClient.get<CalculationResults>(
      `${this.baseUrl}/results/${calculationId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get calculation results');
    }
    
    return response.data!;
  }

  /**
   * Generate financial projections
   */
  async generateProjections(
    data: FinancialData, 
    years: number = 5
  ): Promise<CalculationResults['projections']> {
    const response = await httpClient.post<CalculationResults['projections']>(
      `${this.baseUrl}/projections`,
      { data, years }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to generate projections');
    }
    
    return response.data!;
  }

  /**
   * Run sensitivity analysis
   */
  async runSensitivityAnalysis(
    data: FinancialData, 
    variables: string[],
    ranges?: Record<string, { min: number; max: number; steps: number }>
  ): Promise<SensitivityAnalysis> {
    const requestBody = {
      data,
      variables,
      ranges: ranges || {
        revenueGrowth: { min: -10, max: 20, steps: 5 },
        ebitdaMargin: { min: -5, max: 10, steps: 5 },
        interestRate: { min: -2, max: 5, steps: 5 }
      }
    };

    const response = await httpClient.post<SensitivityAnalysis>(
      `${this.baseUrl}/sensitivity`,
      requestBody
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to run sensitivity analysis');
    }
    
    return response.data!;
  }

  /**
   * Run scenario analysis
   */
  async runScenarioAnalysis(
    data: FinancialData,
    scenarios: GrowthScenario[]
  ): Promise<ScenarioAnalysis[]> {
    const response = await httpClient.post<ScenarioAnalysis[]>(
      `${this.baseUrl}/scenarios`,
      { data, scenarios }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to run scenario analysis');
    }
    
    return response.data!;
  }

  /**
   * Validate calculations for consistency
   */
  async validateCalculations(results: CalculationResults): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await httpClient.post<{
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }>(
      `${this.baseUrl}/validate`,
      results
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to validate calculations');
    }
    
    return response.data!;
  }

  /**
   * Get industry benchmark data
   */
  async getBenchmarkData(industry: string, companySize: string): Promise<BenchmarkData> {
    const response = await httpClient.get<BenchmarkData>(
      `${this.baseUrl}/benchmark?industry=${encodeURIComponent(industry)}&companySize=${encodeURIComponent(companySize)}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get benchmark data');
    }
    
    return response.data!;
  }

  /**
   * Compare results with industry benchmarks
   */
  async compareWithBenchmarks(
    results: CalculationResults,
    industry: string,
    companySize: string
  ): Promise<{
    metrics: Array<{
      name: string;
      value: number;
      benchmark: number;
      percentile: number;
      status: 'above' | 'below' | 'inline';
    }>;
    summary: {
      overallRanking: number;
      strengths: string[];
      weaknesses: string[];
    };
  }> {
    const response = await httpClient.post<{
      metrics: Array<{
        name: string;
        value: number;
        benchmark: number;
        percentile: number;
        status: 'above' | 'below' | 'inline';
      }>;
      summary: {
        overallRanking: number;
        strengths: string[];
        weaknesses: string[];
      };
    }>(
      `${this.baseUrl}/benchmark/compare`,
      { results, industry, companySize }
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to compare with benchmarks');
    }
    
    return response.data!;
  }

  /**
   * Get calculation history for a project
   */
  async getCalculationHistory(projectId: string): Promise<Array<{
    id: string;
    calculatedAt: string;
    options: CalculationOptions;
    status: 'completed' | 'failed';
    duration: number;
    resultsSummary: {
      debtToEbitda: number;
      dscr: number;
      interestCoverage: number;
    };
  }>> {
    const response = await httpClient.get<Array<{
      id: string;
      calculatedAt: string;
      options: CalculationOptions;
      status: 'completed' | 'failed';
      duration: number;
      resultsSummary: {
        debtToEbitda: number;
        dscr: number;
        interestCoverage: number;
      };
    }>>(
      `${this.baseUrl}/history/${projectId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get calculation history');
    }
    
    return response.data!;
  }

  /**
   * Subscribe to real-time calculation updates
   */
  subscribeToUpdates(calculationId: string, callback: (status: CalculationStatus) => void): () => void {
    // In a real implementation, this would use WebSockets or Server-Sent Events
    const interval = setInterval(async () => {
      try {
        const status = await this.getCalculationStatus(calculationId);
        callback(status);
        
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to get calculation status:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }

  /**
   * Cancel running calculation
   */
  async cancelCalculation(calculationId: string): Promise<void> {
    const response = await httpClient.post(
      `${this.baseUrl}/cancel/${calculationId}`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to cancel calculation');
    }
  }

  /**
   * Get available calculation templates/presets
   */
  async getCalculationPresets(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    options: CalculationOptions;
    category: 'quick' | 'detailed' | 'comprehensive';
  }>> {
    const response = await httpClient.get<Array<{
      id: string;
      name: string;
      description: string;
      options: CalculationOptions;
      category: 'quick' | 'detailed' | 'comprehensive';
    }>>(
      `${this.baseUrl}/presets`
    );
    
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get calculation presets');
    }
    
    return response.data!;
  }
}

// Create and export the service instance
export const calculationService = new CalculationService();

// Export the class for testing or custom instances
export { CalculationService };