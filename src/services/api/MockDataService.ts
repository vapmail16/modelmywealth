import { FinancialKPICalculator, FinancialInputs } from '@/utils/kpiCalculations';

export interface MockFinancialData {
  year: number;
  revenue: number;
  cogs: number;
  ebitda: number;
  cash: number;
  ppe: number;
  totalEquity: number;
  seniorSecuredDebt: number;
  debtTranche1: number;
  interestPaid: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  netIncome: number;
  [key: string]: any; // For KPI properties
}

class MockDataService {
  private cache: Map<string, MockFinancialData[]> = new Map();
  private mockEnabled: boolean = true;

  /**
   * Generate mock financial data for demo purposes
   */
  generateMockData(years: number = 10): MockFinancialData[] {
    const cacheKey = `years_${years}`;
    
    // Return cached data if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const yearArray = Array.from({ length: years }, (_, i) => i + 1);
    
    const data = yearArray.map(year => {
      const baseRevenue = 125000000; // $125M
      const growthRate = 0.03; // 3% annual growth
      const revenue = baseRevenue * Math.pow(1 + growthRate, year - 1);
      const cogs = revenue * 0.60; // 60% of revenue
      const ebitda = revenue * 0.20; // 20% EBITDA margin
      const totalDebt = 45200000; // $45.2M
      const totalEquity = 74400000; // $74.4M
      
      // Calculate all KPIs using the calculator
      const inputs: FinancialInputs = {
        revenue,
        cogs,
        operatingExpenses: revenue * 0.15,
        ebitda,
        depreciation: revenue * 0.03,
        interestExpense: totalDebt * 0.055, // 5.5% interest rate
        netIncome: ebitda * 0.65, // After interest and tax
        cash: 8700000 + (year - 1) * 500000,
        accountsReceivable: revenue / 365 * 45, // 45 days
        inventory: cogs / 365 * 60, // 60 days
        currentAssets: revenue * 0.25,
        ppe: 85300000 + (year - 1) * 2000000,
        totalAssets: revenue * 1.2,
        accountsPayable: cogs / 365 * 30, // 30 days
        currentLiabilities: revenue * 0.15,
        seniorSecuredDebt: totalDebt * 0.65,
        debtTranche1: totalDebt * 0.35,
        totalDebt,
        totalEquity: totalEquity + (year - 1) * 3000000,
        operatingCashFlow: ebitda * 0.85,
        capitalExpenditures: revenue * 0.04,
        freeCashFlow: ebitda * 0.85 - revenue * 0.04,
        tangibleAssets: revenue * 1.1,
        debtService: totalDebt * 0.12 // 12% debt service
      };
      
      const kpis = FinancialKPICalculator.calculateAllKPIs(inputs);
      
      return {
        year,
        revenue,
        cogs,
        ebitda,
        cash: inputs.cash,
        ppe: inputs.ppe,
        totalEquity: inputs.totalEquity,
        seniorSecuredDebt: inputs.seniorSecuredDebt,
        debtTranche1: inputs.debtTranche1,
        interestPaid: inputs.interestExpense,
        operatingCashFlow: inputs.operatingCashFlow,
        freeCashFlow: inputs.freeCashFlow,
        netIncome: inputs.netIncome,
        ...kpis
      };
    });

    // Cache the generated data
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Get mock covenant data for governance
   */
  getMockCovenantData() {
    return [
      {
        id: "dscr",
        name: "Debt Service Coverage Ratio",
        threshold: "≥ 1.25x",
        current: "1.82x",
        status: "compliant" as const,
        lastTested: "2024-01-31",
        nextTest: "2024-04-30",
        buffer: 45.6
      },
      {
        id: "leverage",
        name: "Total Leverage Ratio",
        threshold: "≤ 4.0x",
        current: "1.81x",
        status: "compliant" as const,
        lastTested: "2024-01-31",
        nextTest: "2024-04-30",
        buffer: 121.0
      },
      {
        id: "interest",
        name: "Interest Coverage Ratio",
        threshold: "≥ 3.0x",
        current: "9.1x",
        status: "compliant" as const,
        lastTested: "2024-01-31",
        nextTest: "2024-04-30",
        buffer: 203.3
      },
      {
        id: "capex",
        name: "Annual CapEx Limit",
        threshold: "≤ $5.0M",
        current: "$3.2M",
        status: "compliant" as const,
        lastTested: "2024-01-31",
        nextTest: "2024-04-30",
        buffer: 56.3
      },
      {
        id: "liquidity",
        name: "Minimum Liquidity",
        threshold: "≥ $2.0M",
        current: "$8.7M",
        status: "compliant" as const,
        lastTested: "2024-01-31",
        nextTest: "2024-04-30",
        buffer: 335.0
      }
    ];
  }

  /**
   * Get mock governance items
   */
  getMockGovernanceItems() {
    return [
      {
        category: "Board Governance",
        items: [
          { name: "Monthly Board Reports", status: "current", dueDate: "2024-02-15" },
          { name: "Quarterly Board Meeting", status: "scheduled", dueDate: "2024-03-20" },
          { name: "Annual Strategy Review", status: "pending", dueDate: "2024-04-30" }
        ]
      },
      {
        category: "Lender Reporting",
        items: [
          { name: "Monthly Borrowing Base", status: "current", dueDate: "2024-02-10" },
          { name: "Quarterly Compliance Certificate", status: "current", dueDate: "2024-01-31" },
          { name: "Annual Financial Statements", status: "pending", dueDate: "2024-04-15" }
        ]
      },
      {
        category: "Regulatory Compliance",
        items: [
          { name: "Tax Filing - Federal", status: "scheduled", dueDate: "2024-03-15" },
          { name: "Insurance Policy Review", status: "current", dueDate: "2024-06-30" },
          { name: "Environmental Compliance", status: "current", dueDate: "2024-12-31" }
        ]
      }
    ];
  }

  /**
   * Simulate async data loading with delay
   */
  async getFinancialDataAsync(years: number = 10, delay: number = 1000): Promise<MockFinancialData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.generateMockData(years));
      }, delay);
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Enable/disable mock mode
   */
  setMockMode(enabled: boolean): void {
    this.mockEnabled = enabled;
  }

  /**
   * Check if mock mode is enabled
   */
  isMockEnabled(): boolean {
    return this.mockEnabled;
  }

  /**
   * Generate scenario analysis data
   */
  generateScenarioData(baseData: MockFinancialData, scenario: 'base' | 'stress' | 'upside') {
    const multipliers = {
      base: { revenue: 1.0, ebitda: 1.0 },
      stress: { revenue: 0.85, ebitda: 0.75 }, // -15% revenue, -25% EBITDA
      upside: { revenue: 1.10, ebitda: 1.15 }  // +10% revenue, +15% EBITDA
    };

    const mult = multipliers[scenario];
    return {
      ...baseData,
      revenue: baseData.revenue * mult.revenue,
      ebitda: baseData.ebitda * mult.ebitda,
      scenario
    };
  }
}

// Create and export the service instance
export const mockDataService = new MockDataService();

// Export the class for testing or custom instances
export { MockDataService };