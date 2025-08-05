import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Calculator, TrendingUp, BarChart3, Save, Download, Calendar, PieChart, Target } from "lucide-react";
import { DebtCalculationEngine, DebtCalculationInput, DebtScheduleRow } from "@/services/calculations/DebtCalculationEngine";
import { DepreciationCalculationEngine, DepreciationCalculationInput, DepreciationScheduleRow } from "@/services/calculations/DepreciationCalculationEngine";
import { SupabaseDataService } from "@/services/api/SupabaseDataService";

interface CalculationEngineProps {
  projectId?: string;
}

export default function CalculationEngine({ projectId = "05632bb7-b506-453d-9ca1-253344e04b6b" }: CalculationEngineProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("debt");
  const [isCalculating, setIsCalculating] = useState(false);

  // Debt calculation state
  const [debtInput, setDebtInput] = useState<DebtCalculationInput>({
    projectId,
    debtType: 'senior_secured',
    principal: 50000, // Use additional loan amount as principal
    additionalLoan: 50000, // Match Debt Structure form
    bankBaseRate: 5.0, // Match Debt Structure form
    liquidityPremium: 1.0, // Match Debt Structure form
    creditRiskPremium: 1.0, // Match Debt Structure form
    maturityYears: 10, // Match Debt Structure form
    amortizationYears: 4, // Match Debt Structure form
    debtTypeOption: 'Individual'
  });

  const [debtSchedule, setDebtSchedule] = useState<DebtScheduleRow[]>([]);
  const [debtSummary, setDebtSummary] = useState<any>(null);

  // Depreciation calculation state
  const [depreciationInput, setDepreciationInput] = useState<DepreciationCalculationInput>({
    projectId,
    openingBalance: 15000, // Match Excel: Opening Balance
    monthlyCapex: 1667, // Match Excel: Capex Addition
    depreciationRate: 10.0, // Match Excel: Annual depreciation rate
    depreciationMethod: 'straight_line'
  });

  const [depreciationSchedule, setDepreciationSchedule] = useState<DepreciationScheduleRow[]>([]);
  const [depreciationSummary, setDepreciationSummary] = useState<any>(null);

  // Consolidation state
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [quarterlyData, setQuarterlyData] = useState<any[]>([]);
  const [annualData, setAnnualData] = useState<any[]>([]);
  const [consolidationSummary, setConsolidationSummary] = useState<any>(null);

  // Load existing calculations and Data Entry values on mount
  useEffect(() => {
    loadExistingCalculations();
    loadDataEntryValues();
  }, [projectId]);

  const loadDataEntryValues = async () => {
    try {
      console.log('CalculationEngine: Loading Data Entry values for project:', projectId);
      
      // Load debt structure data from Data Entry
      const debtStructureData = await SupabaseDataService.loadDebtStructureData(projectId);
      console.log('CalculationEngine: Debt structure data loaded:', debtStructureData);
      
      if (debtStructureData) {
        // Use additional loan amount as principal for debt calculation
        const principal = parseFloat(debtStructureData.additional_loan_senior_secured || '0');
        const additionalLoan = parseFloat(debtStructureData.additional_loan_senior_secured || '0');
        const bankBaseRate = parseFloat(debtStructureData.bank_base_rate_senior_secured || '0');
        const liquidityPremium = parseFloat(debtStructureData.liquidity_premiums_senior_secured || '0');
        const creditRiskPremium = parseFloat(debtStructureData.credit_risk_premiums_senior_secured || '0');
        const maturityYears = parseFloat(debtStructureData.maturity_y_senior_secured || '10');
        const amortizationYears = parseFloat(debtStructureData.amortization_y_senior_secured || '4');
        
        console.log('CalculationEngine: Parsed debt values:', {
          principal, additionalLoan, bankBaseRate, liquidityPremium, 
          creditRiskPremium, maturityYears, amortizationYears
        });
        
        setDebtInput(prev => ({
          ...prev,
          principal,
          additionalLoan,
          bankBaseRate,
          liquidityPremium,
          creditRiskPremium,
          maturityYears,
          amortizationYears,
        }));
      }

      // Load balance sheet data for depreciation inputs
      const balanceSheetData = await SupabaseDataService.loadBalanceSheetData(projectId);
      console.log('CalculationEngine: Balance sheet data loaded:', balanceSheetData);
      
      if (balanceSheetData) {
        const openingBalance = parseFloat(balanceSheetData.ppe || '0');
        const monthlyCapex = parseFloat(balanceSheetData.capital_expenditure_additions || '0') / 12; // Convert annual to monthly
        const depreciationRate = parseFloat(balanceSheetData.asset_depreciated_over_years || '0') > 0 
          ? (100 / parseFloat(balanceSheetData.asset_depreciated_over_years || '10')) 
          : 10; // Default 10% if not specified
        
        console.log('CalculationEngine: Parsed depreciation values:', {
          openingBalance, monthlyCapex, depreciationRate
        });
        
        setDepreciationInput(prev => ({
          ...prev,
          openingBalance,
          monthlyCapex,
          depreciationRate,
        }));
      }
    } catch (error) {
      console.log('CalculationEngine: No Data Entry values found, using defaults:', error);
    }
  };

  const loadExistingCalculations = async () => {
    try {
      // Load debt calculations
      const seniorSecuredDebt = await DebtCalculationEngine.loadDebtCalculations(projectId, 'senior_secured');
      const shortTermDebt = await DebtCalculationEngine.loadDebtCalculations(projectId, 'short_term');
      
      if (seniorSecuredDebt.length > 0) {
        setDebtSchedule(seniorSecuredDebt);
        setDebtSummary(DebtCalculationEngine.calculateSummary(seniorSecuredDebt));
      }

      // Load depreciation schedule
      const depreciation = await DepreciationCalculationEngine.loadDepreciationSchedule(projectId);
      if (depreciation.length > 0) {
        setDepreciationSchedule(depreciation);
        setDepreciationSummary(DepreciationCalculationEngine.calculateSummary(depreciation));
      }
    } catch (error) {
      console.log('No existing calculations found');
    }
  };

  const calculateDebt = async () => {
    setIsCalculating(true);
    try {
      // Validate inputs - allow calculation if we have either principal or additional loan
      if ((debtInput.principal <= 0 && debtInput.additionalLoan <= 0)) {
        throw new Error('Please enter a valid principal amount or additional loan amount');
      }

      const schedule = DebtCalculationEngine.calculateDebtSchedule(debtInput);
      
      if (!schedule || schedule.length === 0) {
        throw new Error('No schedule generated');
      }

      const summary = DebtCalculationEngine.calculateSummary(schedule);
      
      setDebtSchedule(schedule);
      setDebtSummary(summary);

      // Save to Supabase (don't fail if save fails)
      try {
        console.log('CalculationEngine: Attempting to save debt calculations...');
        await DebtCalculationEngine.saveDebtCalculations(projectId, debtInput.debtType, schedule);
        console.log('CalculationEngine: Successfully saved debt calculations');
      } catch (saveError) {
        console.warn('CalculationEngine: Failed to save debt calculations to database:', saveError);
        // Don't throw - the calculation worked, just the save failed
      }

      toast({
        title: "Debt Calculation Complete",
        description: `Calculated ${schedule.length} months of debt schedule`,
      });
    } catch (error) {
      console.error('Debt calculation error:', error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate debt schedule",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const calculateDepreciation = async () => {
    setIsCalculating(true);
    try {
      // Validate inputs
      if (depreciationInput.openingBalance <= 0 || depreciationInput.monthlyCapex < 0 || depreciationInput.depreciationRate <= 0) {
        throw new Error('Invalid input values');
      }

      const schedule = DepreciationCalculationEngine.calculateDepreciationSchedule(depreciationInput);
      
      if (!schedule || schedule.length === 0) {
        throw new Error('No schedule generated');
      }

      const summary = DepreciationCalculationEngine.calculateSummary(schedule);
      
      setDepreciationSchedule(schedule);
      setDepreciationSummary(summary);

      // Save to Supabase (don't fail if save fails)
      try {
        console.log('CalculationEngine: Attempting to save depreciation schedule...');
        await DepreciationCalculationEngine.saveDepreciationSchedule(projectId, schedule);
        console.log('CalculationEngine: Successfully saved depreciation schedule');
      } catch (saveError) {
        console.warn('CalculationEngine: Failed to save depreciation schedule to database:', saveError);
        // Don't throw - the calculation worked, just the save failed
      }

      toast({
        title: "Depreciation Calculation Complete",
        description: `Calculated ${schedule.length} months of depreciation schedule`,
      });
    } catch (error) {
      console.error('Depreciation calculation error:', error);
      toast({
        title: "Calculation Error",
        description: error instanceof Error ? error.message : "Failed to calculate depreciation schedule",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Consolidation functions
  const generateMonthlyConsolidatedData = async () => {
    try {
      setIsCalculating(true);
      
      console.log('Loading data for project:', projectId);
      
      // Load all required data from Data Entry
      const [
        profitLossData,
        balanceSheetData,
        debtStructureData,
        workingCapitalData,
        growthAssumptionsData,
        seasonalityData
      ] = await Promise.all([
        SupabaseDataService.loadProfitLossData(projectId),
        SupabaseDataService.loadBalanceSheetData(projectId),
        SupabaseDataService.loadDebtStructureData(projectId),
        SupabaseDataService.loadWorkingCapitalData(projectId),
        SupabaseDataService.loadGrowthAssumptionsData(projectId),
        SupabaseDataService.loadSeasonalityData(projectId)
      ]);

      console.log('Loaded data:', {
        profitLossData: !!profitLossData,
        balanceSheetData: !!balanceSheetData,
        debtStructureData: !!debtStructureData,
        workingCapitalData: !!workingCapitalData,
        growthAssumptionsData: !!growthAssumptionsData,
        seasonalityData: !!seasonalityData
      });

      if (!profitLossData || !balanceSheetData || !debtStructureData) {
        const missingData = [];
        if (!profitLossData) missingData.push('Profit & Loss');
        if (!balanceSheetData) missingData.push('Balance Sheet');
        if (!debtStructureData) missingData.push('Debt Structure');
        
        toast({
          title: "Data Missing",
          description: `Please populate the following Data Entry sections: ${missingData.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      // Calculate debt schedules
      console.log('Calculating debt schedules...');
      const seniorSecuredSchedule = DebtCalculationEngine.calculateDebtSchedule({
        projectId,
        debtType: 'senior_secured',
        principal: balanceSheetData.senior_secured || 0,
        additionalLoan: debtStructureData.additional_loan_senior_secured || 0,
        bankBaseRate: debtStructureData.bank_base_rate_senior_secured || 0,
        liquidityPremium: debtStructureData.liquidity_premiums_senior_secured || 0,
        creditRiskPremium: debtStructureData.credit_risk_premiums_senior_secured || 0,
        maturityYears: debtStructureData.maturity_y_senior_secured || 10,
        amortizationYears: debtStructureData.amortization_y_senior_secured || 4,
        debtTypeOption: 'Individual'
      });

      const shortTermSchedule = DebtCalculationEngine.calculateDebtSchedule({
        projectId,
        debtType: 'short_term',
        principal: balanceSheetData.debt_tranche1 || 0,
        additionalLoan: debtStructureData.additional_loan_short_term || 0,
        bankBaseRate: debtStructureData.bank_base_rate_short_term || 0,
        liquidityPremium: debtStructureData.liquidity_premiums_short_term || 0,
        creditRiskPremium: debtStructureData.credit_risk_premiums_short_term || 0,
        maturityYears: debtStructureData.maturity_y_short_term || 3,
        amortizationYears: debtStructureData.amortization_y_short_term || 1,
        debtTypeOption: 'Individual'
      });

      // Calculate depreciation schedule
      console.log('Calculating depreciation schedule...');
      const depreciationSchedule = DepreciationCalculationEngine.calculateDepreciationSchedule({
        projectId,
        openingBalance: balanceSheetData.ppe || 0,
        monthlyCapex: (balanceSheetData.capital_expenditure_additions || 0) / 12,
        depreciationRate: balanceSheetData.asset_depreciated_over_years ? (100 / balanceSheetData.asset_depreciated_over_years) : 10,
        depreciationMethod: 'straight_line'
      });

      // Generate monthly consolidated data
      console.log('Generating monthly consolidated data...');
      const monthlyConsolidated = generateMonthlyData(
        profitLossData,
        balanceSheetData,
        seniorSecuredSchedule,
        shortTermSchedule,
        depreciationSchedule,
        growthAssumptionsData,
        seasonalityData,
        workingCapitalData
      );

      console.log('Generated monthly data:', monthlyConsolidated.length, 'months');
      console.log('First month:', monthlyConsolidated[0]);
      console.log('Last month:', monthlyConsolidated[monthlyConsolidated.length - 1]);
      
      // Validate that all required fields exist
      if (monthlyConsolidated.length > 0) {
        const requiredFields = ['revenue', 'netIncome', 'closingCash', 'accountsReceivable', 'inventory'];
        const missingFields = requiredFields.filter(field => !(field in monthlyConsolidated[0]));
        if (missingFields.length > 0) {
          console.error('Missing required fields in monthly data:', missingFields);
        }
      }
      
      setMonthlyData(monthlyConsolidated);
      
      // Generate quarterly and annual data
      console.log('Generating quarterly and annual data...');
      const quarterlyConsolidated = aggregateToQuarterly(monthlyConsolidated);
      const annualConsolidated = aggregateToAnnual(monthlyConsolidated);
      
      console.log('Generated quarterly data:', quarterlyConsolidated.length, 'quarters');
      console.log('Generated annual data:', annualConsolidated.length, 'years');
      
      setQuarterlyData(quarterlyConsolidated);
      setAnnualData(annualConsolidated);
      
      // Calculate summary
      const summaryData = calculateConsolidationSummary(monthlyConsolidated, quarterlyConsolidated, annualConsolidated);
      setConsolidationSummary(summaryData);

      toast({
        title: "Consolidation Complete",
        description: `Generated ${monthlyConsolidated.length} months of consolidated financial data.`
      });

    } catch (error) {
      console.error('Error generating consolidation data:', error);
      toast({
        title: "Error",
        description: "Failed to generate consolidation data.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const generateMonthlyData = (
    profitLossData: any,
    balanceSheetData: any,
    seniorSecuredSchedule: any[],
    shortTermSchedule: any[],
    depreciationSchedule: any[],
    growthAssumptionsData: any,
    seasonalityData: any,
    workingCapitalData: any
  ) => {
    // Validate base values are reasonable
    const baseRevenue = Math.abs(profitLossData.revenue || 0);
    const baseCash = Math.abs(balanceSheetData.cash || 0);
    
    console.log('CalculationEngine: Base values validation:', {
      baseRevenue,
      baseCash,
      hasProfitLossData: !!profitLossData,
      hasBalanceSheetData: !!balanceSheetData
    });
    
    // Warn if values seem unreasonable
    if (baseRevenue > 1000000000) { // > 1 billion
      console.warn('CalculationEngine: Very large base revenue detected:', baseRevenue);
    }
    if (baseCash > 1000000000) { // > 1 billion
      console.warn('CalculationEngine: Very large base cash detected:', baseCash);
    }
    
    const monthlyData: any[] = [];
    
    // Generate 120 months (10 years)
    for (let monthCum = 1; monthCum <= 120; monthCum++) {
      const year = Math.ceil(monthCum / 12);
      const month = monthCum % 12 === 0 ? 12 : monthCum % 12;
      const monthName = new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
      
      // Get debt data for this month
      const seniorSecuredData = seniorSecuredSchedule.find(d => d.monthCum === monthCum) || {
        openingBalance: 0, additionalLoan: 0, amortisation: 0, interest: 0, repayment: 0, closingBalance: 0
      };
      
      const shortTermData = shortTermSchedule.find(d => d.monthCum === monthCum) || {
        openingBalance: 0, additionalLoan: 0, amortisation: 0, interest: 0, repayment: 0, closingBalance: 0
      };
      
      // Get depreciation data for this month
      const depreciationData = depreciationSchedule.find(d => d.monthCum === monthCum) || {
        openingBalance: 0, capexAddition: 0, depreciation: 0, closingBalance: 0
      };
      
      // Calculate annual projections first (like Streamlit)
      const baseRevenue = Math.abs(profitLossData.revenue || 0);
      const baseCOGS = Math.abs(profitLossData.cogs || 0);
      const baseOperatingExpenses = Math.abs(profitLossData.operating_expenses || 0);
      
      // Get growth rates for this year
      const revenueGrowthRate = Math.min(Math.max(growthAssumptionsData?.[`gr_revenue_${year}`] || 0, -0.5), 2.0);
      const cogsGrowthRate = Math.min(Math.max(growthAssumptionsData?.[`gr_cost_${year}`] || 0, -0.5), 2.0);
      const operatingGrowthRate = Math.min(Math.max(growthAssumptionsData?.[`gr_cost_oper_${year}`] || 0, -0.5), 2.0);
      
      // Calculate annual values (like Streamlit projectionDF)
      let annualRevenue, annualCOGS, annualOperatingExpenses;
      
      if (year === 1) {
        // Year 1: Apply growth to base values
        annualRevenue = baseRevenue * (1 + revenueGrowthRate);
        annualCOGS = baseCOGS * (1 + cogsGrowthRate);
        annualOperatingExpenses = baseOperatingExpenses * (1 + operatingGrowthRate);
      } else {
        // Year 2+: Apply growth to previous year's values
        const prevYearRevenue = baseRevenue * Math.pow(1 + revenueGrowthRate, year - 1);
        const prevYearCOGS = baseCOGS * Math.pow(1 + cogsGrowthRate, year - 1);
        const prevYearOperatingExpenses = baseOperatingExpenses * Math.pow(1 + operatingGrowthRate, year - 1);
        
        annualRevenue = prevYearRevenue * (1 + revenueGrowthRate);
        annualCOGS = prevYearCOGS * (1 + cogsGrowthRate);
        annualOperatingExpenses = prevYearOperatingExpenses * (1 + operatingGrowthRate);
      }
      
      // Apply seasonality to get monthly values (like Streamlit)
      const seasonalityFactor = Math.min(Math.max(seasonalityData?.[monthName.toLowerCase()] || 1, 0.1), 10);
      const revenue = annualRevenue * seasonalityFactor;
      const costOfGoodsSold = -annualCOGS * seasonalityFactor;
      const operatingExpenses = -annualOperatingExpenses * seasonalityFactor;
      
      // P&L Calculations
      const grossProfit = revenue + costOfGoodsSold;
      const ebitda = grossProfit + operatingExpenses;
      const depreciation = -depreciationData.depreciation;
      const ebit = ebitda + depreciation;
      const interestExpense = -(seniorSecuredData.interest + shortTermData.interest + seniorSecuredData.amortisation + shortTermData.amortisation);
      const netIncomeBeforeTax = ebit + interestExpense;
      const taxExpense = -(netIncomeBeforeTax * 0.3); // 30% tax rate
      const netIncome = netIncomeBeforeTax + taxExpense;
      
      // Balance Sheet Calculations (use base values for first month, then calculate changes)
      const baseCash = balanceSheetData.cash || 0;
      const baseAccountsReceivable = balanceSheetData.accounts_receivable || 0;
      const baseInventory = balanceSheetData.inventory || 0;
      const baseOtherCurrentAssets = balanceSheetData.other_current_assets || 0;
      const baseAccountsPayable = balanceSheetData.accounts_payable_provisions || 0;
      
      // Calculate working capital as monthly changes
      const accountsReceivableChange = revenue * (workingCapitalData.account_receivable_percent || 0.176) / 12; // Monthly change
      const inventoryChange = Math.abs(costOfGoodsSold) * (workingCapitalData.inventory_percent || 0.264) / 12; // Monthly change
      const otherCurrentAssetsChange = revenue * (workingCapitalData.other_current_assets_percent || 0.044) / 12; // Monthly change
      const accountsPayableChange = (Math.abs(costOfGoodsSold) + Math.abs(operatingExpenses)) * (workingCapitalData.accounts_payable_percent || 0.132) / 12; // Monthly change
      
      // Calculate current month values
      const accountsReceivable = monthCum === 1 ? baseAccountsReceivable : 
        (monthlyData[monthCum - 2]?.accountsReceivable || baseAccountsReceivable) + accountsReceivableChange;
      const inventory = monthCum === 1 ? baseInventory : 
        (monthlyData[monthCum - 2]?.inventory || baseInventory) + inventoryChange;
      const otherCurrentAssets = monthCum === 1 ? baseOtherCurrentAssets : 
        (monthlyData[monthCum - 2]?.otherCurrentAssets || baseOtherCurrentAssets) + otherCurrentAssetsChange;
      const accountsPayable = monthCum === 1 ? baseAccountsPayable : 
        (monthlyData[monthCum - 2]?.accountsPayable || baseAccountsPayable) + accountsPayableChange;
      
      // Cash Flow Calculations (use changes in working capital)
      const previousAccountsReceivable = monthCum === 1 ? (balanceSheetData.accounts_receivable || 0) : 
        (monthlyData[monthCum - 2]?.accountsReceivable || balanceSheetData.accounts_receivable || 0);
      const previousInventory = monthCum === 1 ? (balanceSheetData.inventory || 0) : 
        (monthlyData[monthCum - 2]?.inventory || balanceSheetData.inventory || 0);
      const previousOtherCurrentAssets = monthCum === 1 ? (balanceSheetData.other_current_assets || 0) : 
        (monthlyData[monthCum - 2]?.otherCurrentAssets || balanceSheetData.other_current_assets || 0);
      const previousAccountsPayable = monthCum === 1 ? (balanceSheetData.accounts_payable_provisions || 0) : 
        (monthlyData[monthCum - 2]?.accountsPayable || balanceSheetData.accounts_payable_provisions || 0);
      
      const operatingCashFlow = netIncome + depreciation + 
        (accountsReceivable - previousAccountsReceivable) + 
        (inventory - previousInventory) + 
        (otherCurrentAssets - previousOtherCurrentAssets) - 
        (accountsPayable - previousAccountsPayable);
      const investingCashFlow = -depreciationData.capexAddition;
      const financingCashFlow = seniorSecuredData.additionalLoan + shortTermData.additionalLoan - seniorSecuredData.repayment - shortTermData.repayment;
      const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
      
      const openingCash = monthCum === 1 ? baseCash : monthlyData[monthCum - 2]?.closingCash || baseCash;
      const closingCash = openingCash + netCashFlow;
      
      // Balance Sheet Calculations (after cash is calculated)
      const ppe = depreciationData.closingBalance;
      const otherAssets = balanceSheetData.other_assets || 0;
      const totalAssets = closingCash + accountsReceivable + inventory + otherCurrentAssets + ppe + otherAssets;
      
      const shortTermDebt = shortTermData.closingBalance;
      const longTermDebt = 0; // Additional long-term debt if any
      const seniorSecured = seniorSecuredData.closingBalance;
      const debtTranche1 = balanceSheetData.debt_tranche1 || 0;
      const equity = balanceSheetData.equity || 0;
      const retainedEarnings = monthCum === 1 ? (balanceSheetData.retained_earnings || 0) : 
        (monthlyData[monthCum - 2]?.retainedEarnings || balanceSheetData.retained_earnings || 0) + netIncome;
      const totalLiabilitiesAndEquity = accountsPayable + shortTermDebt + longTermDebt + seniorSecured + debtTranche1 + equity + retainedEarnings;
      
      // Debug logging for first few months and last few months
      if (monthCum <= 3 || monthCum >= 118) {
        console.log(`Month ${monthCum} (Year ${year}) calculations:`, {
          annualRevenue,
          annualCOGS,
          annualOperatingExpenses,
          revenue,
          costOfGoodsSold,
          operatingExpenses,
          netIncome,
          openingCash,
          closingCash
        });
      }
      
      monthlyData.push({
        monthCum,
        year,
        month: monthName,
        revenue,
        costOfGoodsSold,
        grossProfit,
        operatingExpenses,
        ebitda,
        depreciation,
        ebit,
        interestExpense,
        netIncomeBeforeTax,
        taxExpense,
        netIncome,
        openingCash,
        closingCash,
        accountsReceivable,
        inventory,
        otherCurrentAssets,
        ppe,
        otherAssets,
        totalAssets,
        accountsPayable,
        shortTermDebt,
        longTermDebt,
        seniorSecured,
        debtTranche1,
        equity,
        retainedEarnings,
        totalLiabilitiesAndEquity,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        netCashFlow
      });
    }
    
    return monthlyData;
  };

  const aggregateToQuarterly = (monthlyData: any[]) => {
    const quarterlyData: any[] = [];
    
    // Group by year and quarter
    for (let year = 1; year <= 10; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const startMonth = (year - 1) * 12 + (quarter - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        
        const quarterMonths = monthlyData.filter(d => d.monthCum >= startMonth && d.monthCum <= endMonth);
        
        if (quarterMonths.length === 0) continue;
        
        // Aggregate P&L data (sum for quarter)
        const revenue = quarterMonths.reduce((sum, d) => sum + d.revenue, 0);
        const costOfGoodsSold = quarterMonths.reduce((sum, d) => sum + d.costOfGoodsSold, 0);
        const grossProfit = quarterMonths.reduce((sum, d) => sum + d.grossProfit, 0);
        const operatingExpenses = quarterMonths.reduce((sum, d) => sum + d.operatingExpenses, 0);
        const ebitda = quarterMonths.reduce((sum, d) => sum + d.ebitda, 0);
        const depreciation = quarterMonths.reduce((sum, d) => sum + d.depreciation, 0);
        const ebit = quarterMonths.reduce((sum, d) => sum + d.ebit, 0);
        const interestExpense = quarterMonths.reduce((sum, d) => sum + d.interestExpense, 0);
        const netIncomeBeforeTax = quarterMonths.reduce((sum, d) => sum + d.netIncomeBeforeTax, 0);
        const taxExpense = quarterMonths.reduce((sum, d) => sum + d.taxExpense, 0);
        const netIncome = quarterMonths.reduce((sum, d) => sum + d.netIncome, 0);
        
        // Balance Sheet data (end of quarter values)
        const lastMonth = quarterMonths[quarterMonths.length - 1];
        const cash = lastMonth.closingCash; // Use closingCash instead of cash
        const accountsReceivable = lastMonth.accountsReceivable;
        const inventory = lastMonth.inventory;
        const otherCurrentAssets = lastMonth.otherCurrentAssets;
        const ppe = lastMonth.ppe;
        const otherAssets = lastMonth.otherAssets;
        const totalAssets = lastMonth.totalAssets;
        const accountsPayable = lastMonth.accountsPayable;
        const shortTermDebt = lastMonth.shortTermDebt;
        const longTermDebt = lastMonth.longTermDebt;
        const seniorSecured = lastMonth.seniorSecured;
        const debtTranche1 = lastMonth.debtTranche1;
        const equity = lastMonth.equity;
        const retainedEarnings = lastMonth.retainedEarnings;
        const totalLiabilitiesAndEquity = lastMonth.totalLiabilitiesAndEquity;
        
        // Cash Flow data (sum for quarter)
        const operatingCashFlow = quarterMonths.reduce((sum, d) => sum + d.operatingCashFlow, 0);
        const investingCashFlow = quarterMonths.reduce((sum, d) => sum + d.investingCashFlow, 0);
        const financingCashFlow = quarterMonths.reduce((sum, d) => sum + d.financingCashFlow, 0);
        const netCashFlow = quarterMonths.reduce((sum, d) => sum + d.netCashFlow, 0);
        const openingCash = quarterMonths[0].openingCash;
        const closingCash = lastMonth.closingCash;
        
        // Calculate key metrics
        const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
        const netIncomeMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
        const debtToEquity = equity > 0 ? ((seniorSecured + shortTermDebt) / equity) * 100 : 0;
        const currentRatio = (accountsPayable + shortTermDebt) > 0 ? (cash + accountsReceivable + inventory + otherCurrentAssets) / (accountsPayable + shortTermDebt) : 0;
        
        quarterlyData.push({
          quarter,
          year,
          quarterLabel: `Q${quarter} ${2024 + year - 1}`,
          revenue,
          costOfGoodsSold,
          grossProfit,
          operatingExpenses,
          ebitda,
          depreciation,
          ebit,
          interestExpense,
          netIncomeBeforeTax,
          taxExpense,
          netIncome,
          cash,
          accountsReceivable,
          inventory,
          otherCurrentAssets,
          ppe,
          otherAssets,
          totalAssets,
          accountsPayable,
          shortTermDebt,
          longTermDebt,
          seniorSecured,
          debtTranche1,
          equity,
          retainedEarnings,
          totalLiabilitiesAndEquity,
          operatingCashFlow,
          investingCashFlow,
          financingCashFlow,
          netCashFlow,
          openingCash,
          closingCash,
          ebitdaMargin,
          netIncomeMargin,
          debtToEquity,
          currentRatio
        });
      }
    }
    
    return quarterlyData;
  };

  const aggregateToAnnual = (monthlyData: any[]) => {
    const annualData: any[] = [];
    
    // Group by year
    for (let year = 1; year <= 10; year++) {
      const yearMonths = monthlyData.filter(d => d.year === year);
      
      if (yearMonths.length === 0) continue;
      
      // Aggregate P&L data (sum for year)
      const revenue = yearMonths.reduce((sum, d) => sum + d.revenue, 0);
      const costOfGoodsSold = yearMonths.reduce((sum, d) => sum + d.costOfGoodsSold, 0);
      const grossProfit = yearMonths.reduce((sum, d) => sum + d.grossProfit, 0);
      const operatingExpenses = yearMonths.reduce((sum, d) => sum + d.operatingExpenses, 0);
      const ebitda = yearMonths.reduce((sum, d) => sum + d.ebitda, 0);
      const depreciation = yearMonths.reduce((sum, d) => sum + d.depreciation, 0);
      const ebit = yearMonths.reduce((sum, d) => sum + d.ebit, 0);
      const interestExpense = yearMonths.reduce((sum, d) => sum + d.interestExpense, 0);
      const netIncomeBeforeTax = yearMonths.reduce((sum, d) => sum + d.netIncomeBeforeTax, 0);
      const taxExpense = yearMonths.reduce((sum, d) => sum + d.taxExpense, 0);
      const netIncome = yearMonths.reduce((sum, d) => sum + d.netIncome, 0);
      
      // Balance Sheet data (end of year values)
      const lastMonth = yearMonths[yearMonths.length - 1];
      const cash = lastMonth.closingCash; // Use closingCash instead of cash
      const accountsReceivable = lastMonth.accountsReceivable;
      const inventory = lastMonth.inventory;
      const otherCurrentAssets = lastMonth.otherCurrentAssets;
      const ppe = lastMonth.ppe;
      const otherAssets = lastMonth.otherAssets;
      const totalAssets = lastMonth.totalAssets;
      const accountsPayable = lastMonth.accountsPayable;
      const shortTermDebt = lastMonth.shortTermDebt;
      const longTermDebt = lastMonth.longTermDebt;
      const seniorSecured = lastMonth.seniorSecured;
      const debtTranche1 = lastMonth.debtTranche1;
      const equity = lastMonth.equity;
      const retainedEarnings = lastMonth.retainedEarnings;
      const totalLiabilitiesAndEquity = lastMonth.totalLiabilitiesAndEquity;
      
      // Cash Flow data (sum for year)
      const operatingCashFlow = yearMonths.reduce((sum, d) => sum + d.operatingCashFlow, 0);
      const investingCashFlow = yearMonths.reduce((sum, d) => sum + d.investingCashFlow, 0);
      const financingCashFlow = yearMonths.reduce((sum, d) => sum + d.financingCashFlow, 0);
      const netCashFlow = yearMonths.reduce((sum, d) => sum + d.netCashFlow, 0);
      const openingCash = yearMonths[0].openingCash;
      const closingCash = lastMonth.closingCash;
      
      // Calculate key metrics
      const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
      const netIncomeMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      const debtToEquity = equity > 0 ? ((seniorSecured + shortTermDebt) / equity) * 100 : 0;
      const currentRatio = (accountsPayable + shortTermDebt) > 0 ? (cash + accountsReceivable + inventory + otherCurrentAssets) / (accountsPayable + shortTermDebt) : 0;
      const returnOnEquity = equity > 0 ? (netIncome / equity) * 100 : 0;
      const returnOnAssets = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
      const debtToAssets = totalAssets > 0 ? ((seniorSecured + shortTermDebt) / totalAssets) * 100 : 0;
      const workingCapital = (cash + accountsReceivable + inventory + otherCurrentAssets) - (accountsPayable + shortTermDebt);
      
      annualData.push({
        year,
        yearLabel: `${2024 + year - 1}`,
        revenue,
        costOfGoodsSold,
        grossProfit,
        operatingExpenses,
        ebitda,
        depreciation,
        ebit,
        interestExpense,
        netIncomeBeforeTax,
        taxExpense,
        netIncome,
        cash,
        accountsReceivable,
        inventory,
        otherCurrentAssets,
        ppe,
        otherAssets,
        totalAssets,
        accountsPayable,
        shortTermDebt,
        longTermDebt,
        seniorSecured,
        debtTranche1,
        equity,
        retainedEarnings,
        totalLiabilitiesAndEquity,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        netCashFlow,
        openingCash,
        closingCash,
        ebitdaMargin,
        netIncomeMargin,
        debtToEquity,
        currentRatio,
        returnOnEquity,
        returnOnAssets,
        debtToAssets,
        workingCapital
      });
    }
    
    return annualData;
  };

  const calculateConsolidationSummary = (monthlyData: any[], quarterlyData: any[], annualData: any[]) => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const lastQuarter = quarterlyData[quarterlyData.length - 1];
    const lastYear = annualData[annualData.length - 1];
    
    return {
      // Sum totals (correct - these accumulate over time)
      totalRevenue: monthlyData.reduce((sum, d) => sum + d.revenue, 0),
      totalNetIncome: monthlyData.reduce((sum, d) => sum + d.netIncome, 0),
      totalInterest: monthlyData.reduce((sum, d) => sum + Math.abs(d.interestExpense), 0),
      totalDepreciation: monthlyData.reduce((sum, d) => sum + Math.abs(d.depreciation), 0),
      
      // Final period values (correct - these are end-of-period balances)
      finalCash: lastMonth?.closingCash || 0,
      finalDebt: (lastMonth?.seniorSecured || 0) + (lastMonth?.shortTermDebt || 0),
      
      // Averages (correct)
      averageEBITDA: monthlyData.reduce((sum, d) => sum + d.ebitda, 0) / monthlyData.length,
      averageEBITDAMargin: quarterlyData.reduce((sum, d) => sum + d.ebitdaMargin, 0) / quarterlyData.length,
      averageNetIncomeMargin: quarterlyData.reduce((sum, d) => sum + d.netIncomeMargin, 0) / quarterlyData.length,
      averageROE: annualData.reduce((sum, d) => sum + d.returnOnEquity, 0) / annualData.length,
      averageROA: annualData.reduce((sum, d) => sum + d.returnOnAssets, 0) / annualData.length
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calculation Engine</h1>
          <p className="text-muted-foreground">
            Run debt and depreciation calculations based on your financial data
          </p>
          {projectId && (
            <p className="text-xs text-muted-foreground">Project ID: {projectId}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportToCSV(debtSchedule, 'debt_calculations.csv')}
            disabled={debtSchedule.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Debt
          </Button>
          <Button
            variant="outline"
            onClick={() => exportToCSV(depreciationSchedule, 'depreciation_schedule.csv')}
            disabled={depreciationSchedule.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Depreciation
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="debt">Debt Calculations</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation Schedule</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Consolidation</TabsTrigger>
          <TabsTrigger value="quarterly">Quarterly Consolidation</TabsTrigger>
          <TabsTrigger value="annual">Annual Consolidation</TabsTrigger>
        </TabsList>

        <TabsContent value="debt" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debt Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Debt Calculation Inputs
                </CardTitle>
                <CardDescription>
                  Configure debt parameters for calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debtType">Debt Type</Label>
                    <Select 
                      value={debtInput.debtType} 
                      onValueChange={(value: 'senior_secured' | 'short_term') => 
                        setDebtInput(prev => ({ ...prev, debtType: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senior_secured">Senior Secured</SelectItem>
                        <SelectItem value="short_term">Short Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="debtTypeOption">Debt Option</Label>
                    <Select 
                      value={debtInput.debtTypeOption} 
                      onValueChange={(value: 'Individual' | 'Consolidated') => 
                        setDebtInput(prev => ({ ...prev, debtTypeOption: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Individual">Individual</SelectItem>
                        <SelectItem value="Consolidated">Consolidated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal Amount</Label>
                    <Input
                      id="principal"
                      type="number"
                      value={debtInput.principal}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, principal: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalLoan">Additional Loan</Label>
                    <Input
                      id="additionalLoan"
                      type="number"
                      value={debtInput.additionalLoan}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, additionalLoan: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankBaseRate">Bank Base Rate (%)</Label>
                    <Input
                      id="bankBaseRate"
                      type="number"
                      step="0.1"
                      value={debtInput.bankBaseRate}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, bankBaseRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="liquidityPremium">Liquidity Premium (%)</Label>
                    <Input
                      id="liquidityPremium"
                      type="number"
                      step="0.1"
                      value={debtInput.liquidityPremium}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, liquidityPremium: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creditRiskPremium">Credit Risk Premium (%)</Label>
                    <Input
                      id="creditRiskPremium"
                      type="number"
                      step="0.1"
                      value={debtInput.creditRiskPremium}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, creditRiskPremium: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maturityYears">Maturity (Years)</Label>
                    <Input
                      id="maturityYears"
                      type="number"
                      value={debtInput.maturityYears}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, maturityYears: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amortizationYears">Amortization (Years)</Label>
                    <Input
                      id="amortizationYears"
                      type="number"
                      value={debtInput.amortizationYears}
                      onChange={(e) => setDebtInput(prev => ({ ...prev, amortizationYears: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateDebt} 
                  disabled={isCalculating}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {isCalculating ? 'Calculating...' : 'Calculate Debt Schedule'}
                </Button>
              </CardContent>
            </Card>

            {/* Debt Summary */}
            {debtSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Debt Calculation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Total Interest</Label>
                      <p className="text-2xl font-bold">${debtSummary.totalInterest.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Repayment</Label>
                      <p className="text-2xl font-bold">${debtSummary.totalRepayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Additional Loan</Label>
                      <p className="text-2xl font-bold">${debtSummary.totalAdditionalLoan.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Final Balance</Label>
                      <p className="text-2xl font-bold">${debtSummary.finalBalance.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Debt Schedule Table */}
          {debtSchedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Debt Schedule (120 Months - Excel View)</CardTitle>
                <CardDescription>
                  Monthly debt schedule showing opening balance, interest, repayment, and closing balance
                </CardDescription>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToCSV(debtSchedule, 'debt_schedule.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Month</TableHead>
                        <TableHead className="min-w-[120px]">Opening Balance</TableHead>
                        <TableHead className="min-w-[120px]">Additional Loan</TableHead>
                        <TableHead className="min-w-[120px]">Amortisation</TableHead>
                        <TableHead className="min-w-[100px]">Interest</TableHead>
                        <TableHead className="min-w-[100px]">Repayment</TableHead>
                        <TableHead className="min-w-[120px]">Closing Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {debtSchedule.map((row) => (
                        <TableRow key={row.monthCum}>
                          <TableCell className="font-medium">{row.month} {row.year}</TableCell>
                          <TableCell>${row.openingBalance.toLocaleString()}</TableCell>
                          <TableCell>${row.additionalLoan.toLocaleString()}</TableCell>
                          <TableCell>${row.amortisation.toLocaleString()}</TableCell>
                          <TableCell>${row.interest.toLocaleString()}</TableCell>
                          <TableCell>${row.repayment.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">${row.closingBalance.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="depreciation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Depreciation Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Depreciation Calculation Inputs
                </CardTitle>
                <CardDescription>
                  Configure depreciation parameters for calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingBalance">Opening Balance</Label>
                    <Input
                      id="openingBalance"
                      type="number"
                      value={depreciationInput.openingBalance}
                      onChange={(e) => setDepreciationInput(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyCapex">Monthly Capex</Label>
                    <Input
                      id="monthlyCapex"
                      type="number"
                      value={depreciationInput.monthlyCapex}
                      onChange={(e) => setDepreciationInput(prev => ({ ...prev, monthlyCapex: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
                    <Input
                      id="depreciationRate"
                      type="number"
                      value={depreciationInput.depreciationRate}
                      onChange={(e) => setDepreciationInput(prev => ({ ...prev, depreciationRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depreciationMethod">Depreciation Method</Label>
                    <Select 
                      value={depreciationInput.depreciationMethod} 
                      onValueChange={(value: 'straight_line' | 'declining_balance') => 
                        setDepreciationInput(prev => ({ ...prev, depreciationMethod: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="straight_line">Straight Line</SelectItem>
                        <SelectItem value="declining_balance">Declining Balance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salvageValue">Salvage Value</Label>
                    <Input
                      id="salvageValue"
                      type="number"
                      value={depreciationInput.salvageValue || 0}
                      onChange={(e) => setDepreciationInput(prev => ({ ...prev, salvageValue: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={calculateDepreciation} 
                  disabled={isCalculating}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  {isCalculating ? 'Calculating...' : 'Calculate Depreciation Schedule'}
                </Button>
              </CardContent>
            </Card>

            {/* Depreciation Summary */}
            {depreciationSummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Depreciation Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Total Depreciation</Label>
                      <p className="text-2xl font-bold">${depreciationSummary.totalDepreciation.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Total Capex</Label>
                      <p className="text-2xl font-bold">${depreciationSummary.totalCapex.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Final Closing Balance</Label>
                      <p className="text-2xl font-bold">${depreciationSummary.finalClosingBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Average Monthly Depreciation</Label>
                      <p className="text-2xl font-bold">${depreciationSummary.averageMonthlyDepreciation.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Depreciation Schedule Table */}
          {depreciationSchedule.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Schedule (120 Months - Excel View)</CardTitle>
                <CardDescription>
                  Monthly depreciation schedule showing asset value, depreciation, and net book value
                </CardDescription>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exportToCSV(depreciationSchedule, 'depreciation_schedule.csv')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Month</TableHead>
                        <TableHead className="min-w-[120px]">Opening Balance</TableHead>
                        <TableHead className="min-w-[120px]">Capex Addition</TableHead>
                        <TableHead className="min-w-[120px]">Depreciation</TableHead>
                        <TableHead className="min-w-[120px]">Closing Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depreciationSchedule.map((row) => (
                        <TableRow key={row.monthCum}>
                          <TableCell className="font-medium">{row.month} {row.year}</TableCell>
                          <TableCell>${row.openingBalance.toLocaleString()}</TableCell>
                          <TableCell>${row.capexAddition.toLocaleString()}</TableCell>
                          <TableCell>${row.depreciation.toLocaleString()}</TableCell>
                          <TableCell className="font-semibold">${row.closingBalance.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Monthly Consolidation Tab */}
        <TabsContent value="monthly" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button onClick={generateMonthlyConsolidatedData} disabled={isCalculating}>
              <Calculator className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? 'Calculating...' : 'Generate Monthly Consolidation'}
            </Button>
            
            <Button onClick={() => exportToCSV(monthlyData, 'monthly_consolidation.csv')} variant="outline" disabled={monthlyData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {consolidationSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalRevenue?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalNetIncome?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Final Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.finalCash?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Final Debt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.finalDebt?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Monthly Financial Consolidation (120 Months)
                </CardTitle>
                <CardDescription>
                  Consolidated monthly financial statements combining Revenue, Cost, Debt, and Depreciation data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost of Goods Sold</TableHead>
                        <TableHead>Gross Profit</TableHead>
                        <TableHead>Operating Expenses</TableHead>
                        <TableHead>EBITDA</TableHead>
                        <TableHead>Depreciation</TableHead>
                        <TableHead>EBIT</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Net Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyData.map((row) => (
                        <TableRow key={row.monthCum}>
                          <TableCell className="font-medium">{row.month}</TableCell>
                          <TableCell>${row.revenue.toLocaleString()}</TableCell>
                          <TableCell>${row.costOfGoodsSold.toLocaleString()}</TableCell>
                          <TableCell>${row.grossProfit.toLocaleString()}</TableCell>
                          <TableCell>${row.operatingExpenses.toLocaleString()}</TableCell>
                          <TableCell>${row.ebitda.toLocaleString()}</TableCell>
                          <TableCell>${row.depreciation.toLocaleString()}</TableCell>
                          <TableCell>${row.ebit.toLocaleString()}</TableCell>
                          <TableCell>${row.interestExpense.toLocaleString()}</TableCell>
                          <TableCell>${row.netIncome.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Quarterly Consolidation Tab */}
        <TabsContent value="quarterly" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button onClick={generateMonthlyConsolidatedData} disabled={isCalculating}>
              <Calculator className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? 'Calculating...' : 'Generate Quarterly Consolidation'}
            </Button>
            
            <Button onClick={() => exportToCSV(quarterlyData, 'quarterly_consolidation.csv')} variant="outline" disabled={quarterlyData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {consolidationSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalRevenue?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalNetIncome?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg EBITDA Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consolidationSummary.averageEBITDAMargin?.toFixed(1) || 0}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Final Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.finalCash?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {quarterlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Quarterly Financial Consolidation (40 Quarters)
                </CardTitle>
                <CardDescription>
                  Consolidated quarterly financial statements aggregating monthly data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quarter</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost of Goods Sold</TableHead>
                        <TableHead>Gross Profit</TableHead>
                        <TableHead>Operating Expenses</TableHead>
                        <TableHead>EBITDA</TableHead>
                        <TableHead>Depreciation</TableHead>
                        <TableHead>EBIT</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Net Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quarterlyData.map((row) => (
                        <TableRow key={`${row.year}-${row.quarter}`}>
                          <TableCell className="font-medium">{row.quarterLabel}</TableCell>
                          <TableCell>${row.revenue.toLocaleString()}</TableCell>
                          <TableCell>${row.costOfGoodsSold.toLocaleString()}</TableCell>
                          <TableCell>${row.grossProfit.toLocaleString()}</TableCell>
                          <TableCell>${row.operatingExpenses.toLocaleString()}</TableCell>
                          <TableCell>${row.ebitda.toLocaleString()}</TableCell>
                          <TableCell>${row.depreciation.toLocaleString()}</TableCell>
                          <TableCell>${row.ebit.toLocaleString()}</TableCell>
                          <TableCell>${row.interestExpense.toLocaleString()}</TableCell>
                          <TableCell>${row.netIncome.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Annual Consolidation Tab */}
        <TabsContent value="annual" className="space-y-6">
          <div className="flex gap-4 mb-6">
            <Button onClick={generateMonthlyConsolidatedData} disabled={isCalculating}>
              <Calculator className={`h-4 w-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? 'Calculating...' : 'Generate Annual Consolidation'}
            </Button>
            
            <Button onClick={() => exportToCSV(annualData, 'annual_consolidation.csv')} variant="outline" disabled={annualData.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>

          {consolidationSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalRevenue?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Net Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.totalNetIncome?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg ROE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{consolidationSummary.averageROE?.toFixed(1) || 0}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Final Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${consolidationSummary.finalCash?.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {annualData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Annual Financial Consolidation (10 Years)
                </CardTitle>
                <CardDescription>
                  Consolidated annual financial statements aggregating monthly data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto max-h-96">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Cost of Goods Sold</TableHead>
                        <TableHead>Gross Profit</TableHead>
                        <TableHead>Operating Expenses</TableHead>
                        <TableHead>EBITDA</TableHead>
                        <TableHead>Depreciation</TableHead>
                        <TableHead>EBIT</TableHead>
                        <TableHead>Interest</TableHead>
                        <TableHead>Net Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {annualData.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">{row.yearLabel}</TableCell>
                          <TableCell>${row.revenue.toLocaleString()}</TableCell>
                          <TableCell>${row.costOfGoodsSold.toLocaleString()}</TableCell>
                          <TableCell>${row.grossProfit.toLocaleString()}</TableCell>
                          <TableCell>${row.operatingExpenses.toLocaleString()}</TableCell>
                          <TableCell>${row.ebitda.toLocaleString()}</TableCell>
                          <TableCell>${row.depreciation.toLocaleString()}</TableCell>
                          <TableCell>${row.ebit.toLocaleString()}</TableCell>
                          <TableCell>${row.interestExpense.toLocaleString()}</TableCell>
                          <TableCell>${row.netIncome.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 