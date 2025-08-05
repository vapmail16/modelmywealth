# Streamlit to React Implementation Plan

## 📊 **STREAMLIT APP ANALYSIS**

### **Core Features to Implement:**

#### **Tab 1: Input Values (Data Entry)**
- **P&L Inputs:** Revenue, COGS, Operating Expenses, Depreciation, Interest, Taxes
- **Balance Sheet Inputs:** Cash, AR, Inventory, PPE, AP, Debt, Equity
- **Debt Structure:** Senior Secured + Short Term debt configuration
- **Growth Assumptions:** Multi-year projections (up to 12 years)
- **Working Capital:** AR%, Inventory%, AP% calculations
- **Seasonality:** Monthly revenue distribution

#### **Tab 2: Graph (9 Charts)**
- **Chart 1:** Debt to EBITDA & DSCR trends
- **Chart 2:** LTV and Interest Coverage ratios
- **Chart 3:** Debt to Equity & Operating Margin
- **Chart 4:** Revenue and EBITDA bar charts
- **Chart 5:** Outstanding debt balance and interest paid
- **Chart 6:** Cash, PPE and Total Equity balance
- **Chart 7:** Profitability ratios (% of revenue)
- **Chart 8:** AR and Inventory cycle days
- **Chart 9:** Key ratios overview

#### **Tab 3: Report Assistance (AI)**
- **Gemini AI Integration** - Automated financial analysis
- **Report Generation** - AI-powered insights

---

## 🏗️ **IMPLEMENTATION PLAN**

### **Phase 1: Core Calculation Engine (Week 1)**

#### **Step 1: Database Schema Design**
```sql
-- Financial Inputs Table
CREATE TABLE financial_inputs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  -- P&L Data
  revenue DECIMAL,
  cost_of_goods_sold DECIMAL,
  operating_expenses DECIMAL,
  depreciation DECIMAL,
  interest_expense DECIMAL,
  income_tax_expense DECIMAL,
  -- Balance Sheet Data
  cash DECIMAL,
  accounts_receivable DECIMAL,
  inventory DECIMAL,
  other_current_assets DECIMAL,
  ppe DECIMAL,
  other_assets DECIMAL,
  accounts_payable DECIMAL,
  senior_secured DECIMAL,
  debt_tranche1 DECIMAL,
  equity DECIMAL,
  retained_earning DECIMAL,
  -- Debt Structure
  senior_secured_type VARCHAR(20), -- 'Individual' or 'Consolidated'
  additional_loan_senior_secured DECIMAL,
  bank_base_rate_senior_secured DECIMAL,
  liquidity_premiums_senior_secured DECIMAL,
  credit_risk_premiums_senior_secured DECIMAL,
  maturity_years_senior_secured INTEGER,
  amortization_years_senior_secured INTEGER,
  -- Short Term Debt
  short_term_type VARCHAR(20),
  additional_loan_short_term DECIMAL,
  bank_base_rate_short_term DECIMAL,
  liquidity_premiums_short_term DECIMAL,
  credit_risk_premiums_short_term DECIMAL,
  maturity_years_short_term INTEGER,
  amortization_years_short_term INTEGER,
  -- Growth Assumptions
  projections_years INTEGER DEFAULT 12,
  capital_expenditure_additions DECIMAL,
  asset_depreciated_over_years INTEGER,
  tax_rates DECIMAL,
  -- Working Capital
  ar_percentage DECIMAL,
  inventory_percentage DECIMAL,
  other_current_assets_percentage DECIMAL,
  ap_percentage DECIMAL,
  -- Seasonality
  revenue_seasonality JSONB, -- Monthly percentages
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Growth Rates Table
CREATE TABLE growth_rates (
  id UUID PRIMARY KEY,
  financial_input_id UUID REFERENCES financial_inputs(id),
  year INTEGER,
  revenue_growth_rate DECIMAL,
  cost_growth_rate DECIMAL,
  operating_cost_growth_rate DECIMAL,
  capex_growth_rate DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Calculation Results Table
CREATE TABLE calculation_results (
  id UUID PRIMARY KEY,
  financial_input_id UUID REFERENCES financial_inputs(id),
  -- Monthly Calculations
  monthly_pnl JSONB,
  monthly_balance_sheet JSONB,
  monthly_cash_flow JSONB,
  monthly_kpis JSONB,
  -- Annual Calculations
  annual_pnl JSONB,
  annual_balance_sheet JSONB,
  annual_cash_flow JSONB,
  annual_kpis JSONB,
  -- Debt Calculations
  debt_schedule_senior_secured JSONB,
  debt_schedule_short_term JSONB,
  total_debt_calculations JSONB,
  -- Depreciation Schedule
  depreciation_schedule JSONB,
  -- Projections
  projections_dataframe JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### **Step 2: Calculation Engine Services**
```typescript
// src/services/calculations/FinancialCalculationEngine.ts
export class FinancialCalculationEngine {
  // Core calculation methods
  calculatePandL(inputs: FinancialInputs): PandLData
  calculateBalanceSheet(inputs: FinancialInputs): BalanceSheetData
  calculateDebtSchedule(inputs: FinancialInputs): DebtScheduleData
  calculateDepreciation(inputs: FinancialInputs): DepreciationData
  calculateWorkingCapital(inputs: FinancialInputs): WorkingCapitalData
  calculateProjections(inputs: FinancialInputs): ProjectionData
  calculateKPIs(inputs: FinancialInputs): KPIData
  
  // Multi-year projection methods
  calculateMultiYearProjections(inputs: FinancialInputs): MultiYearProjections
  calculateMonthlyBreakdowns(inputs: FinancialInputs): MonthlyData
  calculateAnnualSummaries(inputs: FinancialInputs): AnnualData
}
```

#### **Step 3: Real-Time Calculation Hooks**
```typescript
// src/hooks/useFinancialCalculations.ts
export const useFinancialCalculations = (inputs: FinancialInputs) => {
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Real-time calculation trigger
  useEffect(() => {
    if (inputs) {
      setIsCalculating(true);
      const results = calculationEngine.calculateAll(inputs);
      setCalculations(results);
      setIsCalculating(false);
    }
  }, [inputs]);
  
  return { calculations, isCalculating };
};
```

### **Phase 2: Enhanced Data Entry Forms (Week 2)**

#### **Step 4: Advanced Data Entry Components**
```typescript
// src/components/data-entry/AdvancedFinancialForm.tsx
export const AdvancedFinancialForm = () => {
  // 5-column layout like Streamlit
  // Real-time calculations as user types
  // Live P&L and Balance Sheet tables
  // Debt structure configuration
  // Growth assumptions (up to 12 years)
  // Working capital assumptions
  // Revenue seasonality (monthly)
};
```

#### **Step 5: Growth Assumptions Form**
```typescript
// src/components/data-entry/GrowthAssumptionsForm.tsx
export const GrowthAssumptionsForm = () => {
  // Dynamic year inputs (1-12 years)
  // Revenue growth rates
  // Cost growth rates
  // Operating cost growth rates
  // CAPEX growth rates
  // Real-time validation
};
```

#### **Step 6: Working Capital Form**
```typescript
// src/components/data-entry/WorkingCapitalForm.tsx
export const WorkingCapitalForm = () => {
  // AR as % of forward revenue
  // Inventory as % of forward COGS
  // Other current assets as % of revenue
  // AP as % of forward COGS/OPEX
  // Real-time working capital calculations
};
```

### **Phase 3: Chart Integration (Week 3)**

#### **Step 7: Connect Charts to Real Data**
```typescript
// src/components/charts/RealTimeCharts.tsx
export const RealTimeCharts = ({ calculations }: { calculations: CalculationResults }) => {
  // Chart 1: Debt to EBITDA & DSCR
  // Chart 2: LTV and Interest Coverage
  // Chart 3: Debt to Equity & Operating Margin
  // Chart 4: Revenue and EBITDA
  // Chart 5: Outstanding Debt Balance and Interest
  // Chart 6: Cash, PPE and Total Equity
  // Chart 7: Profitability Ratios
  // Chart 8: AR and Inventory Cycle Days
  // Chart 9: Key Ratios Overview
};
```

#### **Step 8: Chart Data Services**
```typescript
// src/services/charts/ChartDataService.ts
export class ChartDataService {
  transformCalculationsToChartData(calculations: CalculationResults): ChartData {
    // Transform calculation results to chart-friendly format
    // Handle monthly vs annual data
    // Format data for different chart types
  }
}
```

### **Phase 4: AI Integration (Week 4)**

#### **Step 9: Gemini AI Service**
```typescript
// src/services/ai/GeminiAIService.ts
export class GeminiAIService {
  async generateFinancialReport(calculations: CalculationResults): Promise<AIReport>
  async analyzeFinancialHealth(calculations: CalculationResults): Promise<FinancialAnalysis>
  async generateRefinancingRecommendations(calculations: CalculationResults): Promise<Recommendations>
}
```

#### **Step 10: AI Report Component**
```typescript
// src/components/ai/AIReportGenerator.tsx
export const AIReportGenerator = () => {
  // AI-powered financial analysis
  // Automated report generation
  // Refinancing recommendations
  // Risk assessment
};
```

---

## 📋 **DETAILED TASK BREAKDOWN**

### **Week 1: Core Engine**
- [ ] **Day 1:** Database schema design and Supabase setup
- [ ] **Day 2:** Core calculation engine (P&L, Balance Sheet, Debt)
- [ ] **Day 3:** Multi-year projection algorithms
- [ ] **Day 4:** Working capital and depreciation calculations
- [ ] **Day 5:** Real-time calculation hooks and data services

### **Week 2: Enhanced Forms**
- [ ] **Day 1:** Advanced financial form with 5-column layout
- [ ] **Day 2:** Growth assumptions form (dynamic years)
- [ ] **Day 3:** Working capital form with real-time calculations
- [ ] **Day 4:** Debt structure configuration
- [ ] **Day 5:** Revenue seasonality form

### **Week 3: Chart Integration**
- [ ] **Day 1:** Connect existing charts to real calculation data
- [ ] **Day 2:** Implement Chart 1-3 (Debt analysis)
- [ ] **Day 3:** Implement Chart 4-6 (Financial performance)
- [ ] **Day 4:** Implement Chart 7-9 (Profitability & Working Capital)
- [ ] **Day 5:** Chart data services and real-time updates

### **Week 4: AI Features**
- [ ] **Day 1:** Gemini AI service setup
- [ ] **Day 2:** Financial analysis AI component
- [ ] **Day 3:** Report generation AI
- [ ] **Day 4:** Refinancing recommendations AI
- [ ] **Day 5:** AI integration testing and optimization

---

## 🎯 **SUCCESS CRITERIA**

### **Functional Requirements:**
- ✅ **Real-time calculations** as user types
- ✅ **Multi-year projections** (up to 12 years)
- ✅ **9 interactive charts** with real data
- ✅ **AI-powered reporting** with Gemini
- ✅ **Working capital dynamics** (AR, Inventory, AP)
- ✅ **Debt amortization schedules**
- ✅ **Depreciation tracking**
- ✅ **Revenue seasonality** (monthly breakdowns)

### **Performance Requirements:**
- ✅ **Sub-second chart updates**
- ✅ **Real-time data validation**
- ✅ **Responsive UI** (mobile-friendly)
- ✅ **Error handling** and user feedback
- ✅ **Data persistence** in Supabase

### **User Experience Requirements:**
- ✅ **Intuitive data entry** (5-column layout)
- ✅ **Live calculations** displayed as user types
- ✅ **Professional charts** with tooltips
- ✅ **AI insights** and recommendations
- ✅ **Export capabilities** (PDF reports)

---

## 🚀 **IMPLEMENTATION STRATEGY**

### **Day-by-Day Approach:**
1. **Start with core calculations** - Get basic P&L and Balance Sheet working
2. **Add real-time updates** - Connect forms to calculation engine
3. **Implement charts** - Connect existing charts to real data
4. **Add advanced features** - Multi-year projections and working capital
5. **Integrate AI** - Add Gemini AI for automated analysis

### **Testing Strategy:**
- **Unit tests** for calculation engine
- **Integration tests** for data flow
- **User acceptance tests** for UI/UX
- **Performance tests** for real-time updates

### **Deployment Strategy:**
- **Phase 1:** Core engine + basic forms
- **Phase 2:** Enhanced forms + charts
- **Phase 3:** AI integration
- **Phase 4:** Optimization and polish

**This plan will transform your React app into a sophisticated financial modeling platform that matches and exceeds the Streamlit app's capabilities!** 