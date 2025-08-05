# Calculation Engine Implementation Plan

## Executive Summary

Based on the comprehensive comparison between the React website and Streamlit app, this plan outlines the implementation strategy to build a robust calculation engine that matches and exceeds the Streamlit app's capabilities.

## Current State Analysis

### ✅ **What We Have:**
1. **Comprehensive Data Entry Forms** - All necessary fields are present
2. **Basic CalculationService** - Framework exists but needs implementation
3. **API Abstraction Layer** - Ready for backend integration
4. **Authentication System** - Working and connected to Supabase

### ❌ **What We Need to Build:**
1. **Advanced Calculation Engine** - Core financial modeling logic
2. **Debt Amortization Engine** - Monthly debt schedules
3. **Multi-Year Projections** - Growth and seasonality calculations
4. **Working Capital Dynamics** - Forward-looking calculations
5. **Balance Sheet Validation** - Error checking and validation

## Implementation Strategy

### Phase 1: Core Calculation Engine (Week 1)

#### 1.1 Enhance CalculationService
```typescript
// Add these methods to CalculationService
class CalculationService {
  // Core calculation methods
  calculatePandL(data: FinancialData): PAndLResults;
  calculateBalanceSheet(data: FinancialData): BalanceSheetResults;
  calculateDebtSchedule(data: FinancialData): DebtScheduleResults;
  calculateWorkingCapital(data: FinancialData): WorkingCapitalResults;
  
  // Multi-year projections
  generateProjections(data: FinancialData, years: number): ProjectionResults;
  applyGrowthRates(baseData: FinancialData, growthRates: GrowthRates): ProjectedData;
  applySeasonality(projectedData: ProjectedData, seasonality: SeasonalityData): SeasonalityAdjustedData;
  
  // Validation
  validateBalanceSheet(assets: number, liabilities: number, equity: number): ValidationResult;
  validateDebtStructure(debtData: DebtStructureData): ValidationResult;
}
```

#### 1.2 Create Calculation Utilities
```typescript
// src/utils/calculations/
- financialCalculations.ts    // Core P&L, Balance Sheet calculations
- debtCalculations.ts         // Debt amortization, interest calculations
- projectionCalculations.ts   // Multi-year growth projections
- workingCapitalCalculations.ts // Working capital dynamics
- validationUtils.ts          // Data validation and error checking
```

#### 1.3 Implement Core Calculations
- **P&L Calculations**: Revenue → COGS → Gross Profit → Operating Expenses → EBITDA → Depreciation → EBIT → Interest → Pre-tax → Taxes → Net Income
- **Balance Sheet Calculations**: Assets = Liabilities + Equity validation
- **Basic Debt Calculations**: Interest = Principal × Rate × Time

### Phase 2: Advanced Debt Modeling (Week 2)

#### 2.1 Debt Amortization Engine
```typescript
interface DebtSchedule {
  month: number;
  year: number;
  openingBalance: number;
  additionalLoan: number;
  amortization: number;
  interest: number;
  repayment: number;
  closingBalance: number;
}

class DebtCalculationEngine {
  calculateMonthlySchedule(
    principal: number,
    additionalLoan: number,
    interestRate: number,
    maturityYears: number,
    amortizationYears: number
  ): DebtSchedule[];
  
  calculateInterestPayment(
    outstandingBalance: number,
    interestRate: number,
    period: 'monthly' | 'annual'
  ): number;
  
  calculateRepaymentSchedule(
    principal: number,
    interestRate: number,
    term: number
  ): number; // PMT function equivalent
}
```

#### 2.2 Debt Structure Integration
- **Senior Secured Debt**: Individual/Consolidated options
- **Short Term Debt**: Separate calculation engine
- **Interest Rate Components**: Base Rate + Liquidity Premium + Credit Risk Premium
- **Amortization vs Maturity**: Handle different repayment schedules

### Phase 3: Multi-Year Projections (Week 3)

#### 3.1 Growth Rate Engine
```typescript
interface GrowthEngine {
  // Convert from monthly to annual growth rates
  convertMonthlyToAnnual(monthlyRates: number[]): number[];
  
  // Apply compound growth
  applyCompoundGrowth(baseValue: number, growthRates: number[]): number[];
  
  // Project revenue, costs, capex
  projectRevenue(baseRevenue: number, growthRates: number[]): number[];
  projectCosts(baseCosts: number, growthRates: number[]): number[];
  projectCapex(baseCapex: number, growthRates: number[]): number[];
}
```

#### 3.2 Seasonality Engine
```typescript
interface SeasonalityEngine {
  // Apply monthly seasonality to annual projections
  applySeasonality(annualProjections: number[], seasonalityRates: number[]): number[];
  
  // Calculate monthly distributions
  distributeAnnualToMonthly(annualValue: number, seasonalityRates: number[]): number[];
}
```

#### 3.3 Working Capital Dynamics
```typescript
interface WorkingCapitalEngine {
  // Forward-looking working capital calculations
  calculateForwardWorkingCapital(
    projectedRevenue: number[],
    projectedCOGS: number[],
    workingCapitalPercentages: WorkingCapitalPercentages
  ): WorkingCapitalProjections;
  
  // 12-month forward calculations
  calculate12MonthForward(
    currentValue: number,
    projectedValues: number[],
    percentage: number
  ): number[];
}
```

### Phase 4: Integration & Validation (Week 4)

#### 4.1 Data Flow Integration
```typescript
// Connect data entry forms to calculation engine
class DataEntryCalculationBridge {
  // Real-time calculations as user types
  onDataChange(formData: DataEntryFormData): CalculationResults;
  
  // Validate data before saving
  validateFormData(data: DataEntryFormData): ValidationResult;
  
  // Auto-calculate derived fields
  calculateDerivedFields(data: DataEntryFormData): CalculatedFields;
}
```

#### 4.2 Balance Sheet Validation
```typescript
interface BalanceSheetValidator {
  validateBalance(assets: number, liabilities: number, equity: number): {
    isValid: boolean;
    difference: number;
    errors: string[];
  };
  
  suggestCorrections(imbalance: number): CorrectionSuggestions;
}
```

#### 4.3 Error Handling & User Feedback
```typescript
interface CalculationErrorHandler {
  handleCalculationErrors(error: CalculationError): UserFriendlyError;
  provideErrorSuggestions(error: CalculationError): string[];
  validateInputRanges(value: number, field: string): ValidationResult;
}
```

## Technical Implementation Details

### 1. Calculation Engine Architecture

```typescript
// src/services/calculations/
├── core/
│   ├── FinancialCalculations.ts
│   ├── DebtCalculations.ts
│   └── WorkingCapitalCalculations.ts
├── projections/
│   ├── GrowthEngine.ts
│   ├── SeasonalityEngine.ts
│   └── ProjectionEngine.ts
├── validation/
│   ├── BalanceSheetValidator.ts
│   ├── DataValidator.ts
│   └── ErrorHandler.ts
└── types/
    ├── CalculationTypes.ts
    ├── ProjectionTypes.ts
    └── ValidationTypes.ts
```

### 2. Data Flow

```
Data Entry Forms → Calculation Engine → Results → Charts/Analytics
     ↓                    ↓                ↓
Validation → Real-time Updates → Error Handling
```

### 3. Performance Considerations

- **Real-time Calculations**: Use debouncing for form inputs
- **Caching**: Cache calculation results for unchanged data
- **Web Workers**: Move heavy calculations to background threads
- **Lazy Loading**: Load calculation engines on demand

### 4. Error Handling Strategy

```typescript
interface CalculationError {
  type: 'validation' | 'calculation' | 'system';
  field?: string;
  message: string;
  suggestion?: string;
  severity: 'warning' | 'error' | 'critical';
}

class CalculationErrorHandler {
  handleError(error: CalculationError): void;
  displayUserFriendlyMessage(error: CalculationError): string;
  provideCorrectionSuggestions(error: CalculationError): string[];
}
```

## Implementation Timeline

### Week 1: Core Engine
- [ ] Implement basic P&L calculations
- [ ] Implement balance sheet calculations
- [ ] Create calculation utilities
- [ ] Add basic validation

### Week 2: Debt Engine
- [ ] Implement debt amortization engine
- [ ] Add interest calculation logic
- [ ] Create PMT function equivalent
- [ ] Handle different debt types

### Week 3: Projections
- [ ] Implement growth rate engine
- [ ] Add seasonality calculations
- [ ] Create working capital dynamics
- [ ] Build multi-year projection engine

### Week 4: Integration
- [ ] Connect forms to calculation engine
- [ ] Add real-time validation
- [ ] Implement error handling
- [ ] Add user feedback system

## Success Metrics

### Functional Requirements
- [ ] All Streamlit app calculations replicated
- [ ] Real-time calculation updates
- [ ] Comprehensive error handling
- [ ] Balance sheet validation
- [ ] Multi-year projections working

### Performance Requirements
- [ ] Calculations complete within 100ms
- [ ] No UI blocking during calculations
- [ ] Memory usage under 50MB for large datasets
- [ ] Support for 10+ year projections

### User Experience Requirements
- [ ] Clear error messages
- [ ] Real-time validation feedback
- [ ] Auto-save calculation results
- [ ] Export calculation reports

## Risk Mitigation

### Technical Risks
1. **Complex Calculations**: Start with simple implementations, add complexity gradually
2. **Performance Issues**: Use Web Workers for heavy calculations
3. **Data Validation**: Implement comprehensive validation at each step
4. **Browser Compatibility**: Test across different browsers

### Business Risks
1. **Feature Parity**: Ensure all Streamlit features are replicated
2. **User Adoption**: Provide clear documentation and tutorials
3. **Data Accuracy**: Implement extensive testing and validation
4. **Scalability**: Design for future enhancements

## Next Steps

1. **Immediate**: Start with Phase 1 core calculations
2. **Week 1**: Implement basic P&L and balance sheet calculations
3. **Week 2**: Build debt amortization engine
4. **Week 3**: Add multi-year projections
5. **Week 4**: Integrate everything and add validation

This plan provides a comprehensive roadmap to build a calculation engine that matches and exceeds the Streamlit app's capabilities while maintaining the React website's superior user experience and data organization. 