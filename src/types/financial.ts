// Financial Data Models
export interface FinancialData {
  id: string;
  projectName: string;
  companyName: string;
  profitLoss: ProfitLossData;
  balanceSheet: BalanceSheetData;
  debtStructure: DebtStructureData;
  growthAssumptions: GrowthAssumptionsData;
  metadata: FinancialMetadata;
}

export interface ProfitLossData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interestExpense: number;
  ebt: number;
  taxes: number;
  netIncome: number;
  period: string;
  currency: string;
}

export interface BalanceSheetData {
  assets: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    otherCurrentAssets: number;
    totalCurrentAssets: number;
    ppe: number;
    intangibleAssets: number;
    otherAssets: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    accruedLiabilities: number;
    shortTermDebt: number;
    otherCurrentLiabilities: number;
    totalCurrentLiabilities: number;
    longTermDebt: number;
    otherLiabilities: number;
    totalLiabilities: number;
  };
  equity: {
    shareCapital: number;
    retainedEarnings: number;
    otherEquity: number;
    totalEquity: number;
  };
  asOfDate: string;
  currency: string;
}

export interface DebtStructureData {
  seniorSecured: DebtInstrument;
  subordinated: DebtInstrument;
  revolvingCredit: DebtInstrument;
  other: DebtInstrument[];
  totalDebt: number;
  weightedAverageRate: number;
  maturityProfile: MaturityProfile[];
}

export interface DebtInstrument {
  id: string;
  type: 'senior_secured' | 'subordinated' | 'revolving' | 'convertible' | 'other';
  principal: number;
  outstandingBalance: number;
  interestRate: number;
  baseRate: number;
  spread: number;
  maturityDate: string;
  covenants: Covenant[];
  isActive: boolean;
}

export interface Covenant {
  id: string;
  type: 'debt_to_ebitda' | 'dscr' | 'interest_coverage' | 'liquidity' | 'capex' | 'other';
  description: string;
  threshold: number;
  comparison: 'max' | 'min';
  currentValue: number;
  isCompliant: boolean;
  testingFrequency: 'monthly' | 'quarterly' | 'annually';
}

export interface MaturityProfile {
  year: number;
  principal: number;
  interest: number;
  total: number;
}

export interface GrowthAssumptionsData {
  revenueGrowth: number[];
  ebitdaMargin: number[];
  capexAsPercentOfRevenue: number[];
  workingCapitalDays: {
    accountsReceivable: number;
    inventory: number;
    accountsPayable: number;
  };
  projectionYears: number;
  scenarios: GrowthScenario[];
}

export interface GrowthScenario {
  id: string;
  name: string;
  description: string;
  probability: number;
  assumptions: {
    revenueGrowth: number[];
    marginImpact: number[];
    oneTimeItems: number[];
  };
}

export interface FinancialMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
  isValid: boolean;
  validationErrors: ValidationError[];
  calculationStatus: 'pending' | 'calculating' | 'completed' | 'error';
  lastCalculatedAt?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
}

// Calculation Results
export interface CalculationResults {
  kpis: FinancialKPIs;
  projections: FinancialProjections;
  ratios: FinancialRatios;
  cashFlow: CashFlowAnalysis;
  debtAnalysis: DebtAnalysis;
  scenarios: ScenarioAnalysis[];
  sensitivity: SensitivityAnalysis;
  calculatedAt: string;
}

export interface FinancialKPIs {
  debtToEbitda: number;
  dscr: number;
  interestCoverage: number;
  ebitdaMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  assetTurnover: number;
}

export interface FinancialProjections {
  years: number[];
  revenue: number[];
  ebitda: number[];
  netIncome: number[];
  freeCashFlow: number[];
  debt: number[];
  equity: number[];
  kpis: FinancialKPIs[];
}

export interface FinancialRatios {
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    ebitdaMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
  };
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    operatingCashFlowRatio: number;
  };
  leverage: {
    debtToEquity: number;
    debtToAssets: number;
    debtToEbitda: number;
    interestCoverage: number;
    dscr: number;
  };
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivablesTurnover: number;
    payablesTurnover: number;
  };
}

export interface CashFlowAnalysis {
  operatingCashFlow: number[];
  investingCashFlow: number[];
  financingCashFlow: number[];
  freeCashFlow: number[];
  netCashFlow: number[];
  cumulativeCashFlow: number[];
  cashBurnRate: number;
  runwayMonths: number;
}

export interface DebtAnalysis {
  totalDebt: number;
  weightedAverageCost: number;
  maturityProfile: MaturityProfile[];
  covenantCompliance: CovenantAnalysis[];
  refinancingNeeds: RefinancingNeed[];
  optimizationSuggestions: OptimizationSuggestion[];
}

export interface CovenantAnalysis {
  covenant: Covenant;
  currentValue: number;
  threshold: number;
  compliance: boolean;
  trend: 'improving' | 'stable' | 'deteriorating';
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RefinancingNeed {
  instrumentId: string;
  maturityDate: string;
  amount: number;
  urgency: 'immediate' | 'near_term' | 'long_term';
  recommendedAction: string;
}

export interface OptimizationSuggestion {
  id: string;
  category: 'cost_reduction' | 'term_extension' | 'covenant_relief' | 'liquidity_improvement';
  description: string;
  impact: {
    annualSavings: number;
    npvBenefit: number;
    riskReduction: number;
  };
  implementation: {
    complexity: 'low' | 'medium' | 'high';
    timeframe: string;
    prerequisites: string[];
  };
}

export interface ScenarioAnalysis {
  scenario: GrowthScenario;
  results: CalculationResults;
  comparison: {
    baseCase: boolean;
    variance: {
      revenue: number;
      ebitda: number;
      debt: number;
      kpis: Partial<FinancialKPIs>;
    };
  };
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  results: SensitivityResult[][];
  heatMap: SensitivityHeatMap;
}

export interface SensitivityVariable {
  name: string;
  baseValue: number;
  range: number[];
  description: string;
}

export interface SensitivityResult {
  variable: string;
  value: number;
  impact: {
    debtToEbitda: number;
    dscr: number;
    freeCashFlow: number;
  };
}

export interface SensitivityHeatMap {
  xAxis: string;
  yAxis: string;
  metric: string;
  data: number[][];
  labels: {
    x: string[];
    y: string[];
  };
}