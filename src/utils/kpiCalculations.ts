// Financial KPI Calculation Engine
export interface FinancialInputs {
  // P&L Data
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  ebitda: number;
  depreciation: number;
  interestExpense: number;
  netIncome: number;
  
  // Balance Sheet Data
  cash: number;
  accountsReceivable: number;
  inventory: number;
  currentAssets: number;
  ppe: number;
  totalAssets: number;
  accountsPayable: number;
  currentLiabilities: number;
  seniorSecuredDebt: number;
  debtTranche1: number;
  totalDebt: number;
  totalEquity: number;
  
  // Cash Flow Data
  operatingCashFlow: number;
  capitalExpenditures: number;
  freeCashFlow: number;
  
  // Additional metrics
  tangibleAssets: number;
  debtService: number;
}

export interface CalculatedKPIs {
  // Debt-Related KPIs
  debtToEbitda: number;
  dscr: number; // Debt Service Coverage Ratio
  ltv: number; // Loan to Value (Tangible Asset) Ratio
  interestCoverage: number;
  debtToEquity: number;
  
  // Liquidity KPIs
  currentRatio: number;
  quickRatio: number;
  
  // Profitability KPIs
  operatingMargin: number;
  grossProfitMargin: number;
  ebitdaMargin: number;
  netIncomeMargin: number;
  
  // Cash Flow KPIs
  fcff: number; // Free Cash Flow to Firm
  fcfe: number; // Free Cash Flow to Equity
  
  // Working Capital Metrics
  arCycleDays: number;
  inventoryCycleDays: number;
  apCycleDays: number;
  cashConversionCycle: number;
}

export class FinancialKPICalculator {
  
  /**
   * Calculate all 12 KPIs from financial inputs
   */
  static calculateAllKPIs(inputs: FinancialInputs): CalculatedKPIs {
    return {
      // Debt-Related KPIs
      debtToEbitda: this.calculateDebtToEbitda(inputs.totalDebt, inputs.ebitda),
      dscr: this.calculateDSCR(inputs.operatingCashFlow, inputs.debtService),
      ltv: this.calculateLTV(inputs.totalDebt, inputs.tangibleAssets),
      interestCoverage: this.calculateInterestCoverage(inputs.ebitda, inputs.interestExpense),
      debtToEquity: this.calculateDebtToEquity(inputs.totalDebt, inputs.totalEquity),
      
      // Liquidity KPIs
      currentRatio: this.calculateCurrentRatio(inputs.currentAssets, inputs.currentLiabilities),
      quickRatio: this.calculateQuickRatio(inputs.currentAssets, inputs.inventory, inputs.currentLiabilities),
      
      // Profitability KPIs
      operatingMargin: this.calculateOperatingMargin(inputs.revenue, inputs.cogs, inputs.operatingExpenses),
      grossProfitMargin: this.calculateGrossProfitMargin(inputs.revenue, inputs.cogs),
      ebitdaMargin: this.calculateEbitdaMargin(inputs.ebitda, inputs.revenue),
      netIncomeMargin: this.calculateNetIncomeMargin(inputs.netIncome, inputs.revenue),
      
      // Cash Flow KPIs
      fcff: this.calculateFCFF(inputs.operatingCashFlow, inputs.capitalExpenditures),
      fcfe: this.calculateFCFE(inputs.freeCashFlow, inputs.interestExpense),
      
      // Working Capital Metrics
      arCycleDays: this.calculateARCycleDays(inputs.accountsReceivable, inputs.revenue),
      inventoryCycleDays: this.calculateInventoryCycleDays(inputs.inventory, inputs.cogs),
      apCycleDays: this.calculateAPCycleDays(inputs.accountsPayable, inputs.cogs),
      cashConversionCycle: this.calculateCashConversionCycle(
        this.calculateARCycleDays(inputs.accountsReceivable, inputs.revenue),
        this.calculateInventoryCycleDays(inputs.inventory, inputs.cogs),
        this.calculateAPCycleDays(inputs.accountsPayable, inputs.cogs)
      ),
    };
  }

  // Debt-Related KPI Calculations
  static calculateDebtToEbitda(totalDebt: number, ebitda: number): number {
    return ebitda > 0 ? totalDebt / ebitda : 0;
  }

  static calculateDSCR(operatingCashFlow: number, debtService: number): number {
    return debtService > 0 ? operatingCashFlow / debtService : 0;
  }

  static calculateLTV(totalDebt: number, tangibleAssets: number): number {
    return tangibleAssets > 0 ? totalDebt / tangibleAssets : 0;
  }

  static calculateInterestCoverage(ebitda: number, interestExpense: number): number {
    return interestExpense > 0 ? ebitda / interestExpense : 0;
  }

  static calculateDebtToEquity(totalDebt: number, totalEquity: number): number {
    return totalEquity > 0 ? totalDebt / totalEquity : 0;
  }

  // Liquidity KPI Calculations
  static calculateCurrentRatio(currentAssets: number, currentLiabilities: number): number {
    return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  }

  static calculateQuickRatio(currentAssets: number, inventory: number, currentLiabilities: number): number {
    const quickAssets = currentAssets - inventory;
    return currentLiabilities > 0 ? quickAssets / currentLiabilities : 0;
  }

  // Profitability KPI Calculations
  static calculateOperatingMargin(revenue: number, cogs: number, operatingExpenses: number): number {
    const operatingIncome = revenue - cogs - operatingExpenses;
    return revenue > 0 ? operatingIncome / revenue : 0;
  }

  static calculateGrossProfitMargin(revenue: number, cogs: number): number {
    const grossProfit = revenue - cogs;
    return revenue > 0 ? grossProfit / revenue : 0;
  }

  static calculateEbitdaMargin(ebitda: number, revenue: number): number {
    return revenue > 0 ? ebitda / revenue : 0;
  }

  static calculateNetIncomeMargin(netIncome: number, revenue: number): number {
    return revenue > 0 ? netIncome / revenue : 0;
  }

  // Cash Flow KPI Calculations
  static calculateFCFF(operatingCashFlow: number, capitalExpenditures: number): number {
    return operatingCashFlow - capitalExpenditures;
  }

  static calculateFCFE(freeCashFlow: number, interestExpense: number): number {
    return freeCashFlow - interestExpense;
  }

  // Working Capital Calculations
  static calculateARCycleDays(accountsReceivable: number, revenue: number): number {
    const dailyRevenue = revenue / 365;
    return dailyRevenue > 0 ? accountsReceivable / dailyRevenue : 0;
  }

  static calculateInventoryCycleDays(inventory: number, cogs: number): number {
    const dailyCOGS = cogs / 365;
    return dailyCOGS > 0 ? inventory / dailyCOGS : 0;
  }

  static calculateAPCycleDays(accountsPayable: number, cogs: number): number {
    const dailyCOGS = cogs / 365;
    return dailyCOGS > 0 ? accountsPayable / dailyCOGS : 0;
  }

  static calculateCashConversionCycle(arDays: number, inventoryDays: number, apDays: number): number {
    return arDays + inventoryDays - apDays;
  }

  /**
   * Generate monthly KPI calculations for 120 months
   */
  static generateMonthlyKPIs(
    monthlyInputs: FinancialInputs[], // 120 months of data
  ): CalculatedKPIs[] {
    return monthlyInputs.map(inputs => this.calculateAllKPIs(inputs));
  }

  /**
   * Generate annual KPI calculations for 10 years
   */
  static generateAnnualKPIs(
    annualInputs: FinancialInputs[], // 10 years of data
  ): CalculatedKPIs[] {
    return annualInputs.map(inputs => this.calculateAllKPIs(inputs));
  }

  /**
   * Calculate debt amortization schedule
   */
  static calculateDebtAmortization(
    principal: number,
    interestRate: number,
    termYears: number,
    paymentFrequency: 'monthly' | 'quarterly' | 'annually' = 'monthly'
  ): Array<{
    period: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }> {
    const periodsPerYear = paymentFrequency === 'monthly' ? 12 : paymentFrequency === 'quarterly' ? 4 : 1;
    const totalPeriods = termYears * periodsPerYear;
    const periodRate = interestRate / periodsPerYear;
    
    const payment = principal * (periodRate * Math.pow(1 + periodRate, totalPeriods)) / 
                   (Math.pow(1 + periodRate, totalPeriods) - 1);
    
    const schedule = [];
    let balance = principal;
    
    for (let period = 1; period <= totalPeriods; period++) {
      const interestPayment = balance * periodRate;
      const principalPayment = payment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        period,
        payment: Math.round(payment * 100) / 100,
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        balance: Math.round(balance * 100) / 100
      });
    }
    
    return schedule;
  }

  /**
   * Calculate working capital projections
   */
  static calculateWorkingCapitalProjections(
    revenueGrowth: number[],
    arDays: number,
    inventoryDays: number,
    apDays: number,
    baseRevenue: number,
    baseCOGS: number
  ): Array<{
    year: number;
    revenue: number;
    cogs: number;
    accountsReceivable: number;
    inventory: number;
    accountsPayable: number;
    workingCapital: number;
    changeInWorkingCapital: number;
  }> {
    const projections = [];
    let previousWC = 0;
    
    revenueGrowth.forEach((growth, index) => {
      const year = index + 1;
      const revenue = baseRevenue * Math.pow(1 + growth, year - 1);
      const cogs = baseCOGS * Math.pow(1 + growth, year - 1);
      
      const ar = (revenue / 365) * arDays;
      const inventory = (cogs / 365) * inventoryDays;
      const ap = (cogs / 365) * apDays;
      
      const workingCapital = ar + inventory - ap;
      const changeInWC = year === 1 ? workingCapital : workingCapital - previousWC;
      
      projections.push({
        year,
        revenue: Math.round(revenue),
        cogs: Math.round(cogs),
        accountsReceivable: Math.round(ar),
        inventory: Math.round(inventory),
        accountsPayable: Math.round(ap),
        workingCapital: Math.round(workingCapital),
        changeInWorkingCapital: Math.round(changeInWC)
      });
      
      previousWC = workingCapital;
    });
    
    return projections;
  }
}