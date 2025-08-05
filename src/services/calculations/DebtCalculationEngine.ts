import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';

export interface DebtCalculationInput {
  projectId: string;
  debtType: 'senior_secured' | 'short_term';
  principal: number;
  additionalLoan: number;
  bankBaseRate: number; // percentage (e.g., 5.0 for 5%)
  liquidityPremium: number; // percentage
  creditRiskPremium: number; // percentage
  maturityYears: number;
  amortizationYears: number;
  debtTypeOption: 'Individual' | 'Consolidated';
}

export interface DebtScheduleRow {
  monthCum: number;
  year: number;
  month: string;
  openingBalance: number;
  additionalLoan: number;
  amortisation: number;
  interest: number;
  repayment: number;
  closingBalance: number;
}

export interface DebtCalculationResult {
  schedule: DebtScheduleRow[];
  summary: {
    totalInterest: number;
    totalRepayment: number;
    totalAdditionalLoan: number;
    finalBalance: number;
  };
}

export class DebtCalculationEngine {
  /**
   * Calculate monthly debt schedule based on Streamlit app logic
   */
  static calculateDebtSchedule(input: DebtCalculationInput): DebtScheduleRow[] {
    const {
      principal,
      additionalLoan,
      bankBaseRate,
      liquidityPremium,
      creditRiskPremium,
      maturityYears,
      amortizationYears,
      debtTypeOption
    } = input;

    // Convert percentages to decimals
    const bankBaseRateDecimal = bankBaseRate / 100;
    const liquidityPremiumDecimal = liquidityPremium / 100;
    const creditRiskPremiumDecimal = creditRiskPremium / 100;

    // Calculate interest rates
    const interestRatePerAnnum = bankBaseRateDecimal + liquidityPremiumDecimal + creditRiskPremiumDecimal;
    const interestRatePerMonth = interestRatePerAnnum / 12;

    // Generate 10 years of monthly data (120 months) - matching Excel logic
    const schedule: DebtScheduleRow[] = [];

    for (let monthCum = 1; monthCum <= 120; monthCum++) {
      const year = Math.ceil(monthCum / 12);
      const monthNumber = ((monthCum - 1) % 12) + 1;
      const month = new Date(2024, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'long' });

      let openingBalance: number;
      let additionalLoanAmount: number;
      let amortisation: number;
      let interest: number;
      let repayment: number;

      if (monthCum === 1) {
        // First month - match Streamlit app logic
        openingBalance = principal;
        additionalLoanAmount = additionalLoan;
        
        // Amortisation calculation
        if (monthCum <= amortizationYears * 12) {
          amortisation = openingBalance * interestRatePerMonth;
        } else {
          amortisation = 0;
        }
        
        // Interest calculation
        if (monthCum <= maturityYears * 12 && monthCum > amortizationYears * 12) {
          interest = (openingBalance + additionalLoanAmount) * interestRatePerMonth;
        } else {
          interest = 0;
        }
        
        // Repayment calculation
        if (amortizationYears * 12 !== 0) {
          repayment = 0;
        } else {
          if (monthCum > amortizationYears * 12) {
            repayment = this.calculatePMT(interestRatePerMonth, (maturityYears - amortizationYears) * 12, principal + additionalLoan);
          } else {
            repayment = 0;
          }
        }
      } else {
        // Subsequent months
        openingBalance = schedule[monthCum - 2].closingBalance;
        additionalLoanAmount = 0;
        
        // Amortisation calculation
        if (monthCum <= amortizationYears * 12) {
          amortisation = openingBalance * interestRatePerMonth;
        } else {
          amortisation = 0;
        }
        
        // Interest calculation
        if (monthCum <= maturityYears * 12 && monthCum > amortizationYears * 12) {
          interest = openingBalance * interestRatePerMonth;
        } else {
          interest = 0;
        }
        
        // Repayment calculation
        if (schedule[monthCum - 2].closingBalance < 1) {
          repayment = 0;
        } else {
          if (monthCum > amortizationYears * 12 && schedule[monthCum - 2].repayment === 0) {
            repayment = this.calculatePMT(interestRatePerMonth, (maturityYears - amortizationYears) * 12, principal + additionalLoan);
          } else {
            repayment = schedule[monthCum - 2].repayment;
          }
        }
      }

      // Calculate closing balance - match Streamlit app: Opening + Additional Loan + Amortisation + Interest + Repayment
      const closingBalance = openingBalance + additionalLoanAmount + amortisation + interest + repayment;

      // Set to 0 if very small
      const finalClosingBalance = Math.abs(closingBalance) < 1 ? 0 : closingBalance;

      schedule.push({
        monthCum,
        year,
        month,
        openingBalance,
        additionalLoan: additionalLoanAmount,
        amortisation,
        interest,
        repayment,
        closingBalance: finalClosingBalance
      });
    }

    return schedule;
  }

  /**
   * Calculate PMT function equivalent (monthly payment)
   */
  private static calculatePMT(rate: number, nper: number, pv: number): number {
    if (rate === 0) {
      return -pv / nper;
    }

    const pvif = Math.pow(1 + rate, nper);
    const pmt = rate * pv * (pvif + 1) / (pvif - 1);
    return -pmt;
  }

  /**
   * Save debt calculations to Supabase
   */
  static async saveDebtCalculations(
    projectId: string,
    debtType: 'senior_secured' | 'short_term',
    schedule: DebtScheduleRow[]
  ): Promise<void> {
    try {
      console.log('DebtCalculationEngine: Saving debt calculations for project:', projectId, 'debt type:', debtType);
      
      // Insert new calculations (the Edge Function will handle deletion and insertion)
      const response = await httpClient.post('/debt-calculations', {
        projectId,
        debtType,
        schedule
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to save debt calculations');
      }
      
      console.log('DebtCalculationEngine: Successfully saved debt calculations');
    } catch (error) {
      console.error('Error saving debt calculations:', error);
      throw error;
    }
  }

  /**
   * Load debt calculations from Supabase
   */
  static async loadDebtCalculations(
    projectId: string,
    debtType: 'senior_secured' | 'short_term'
  ): Promise<DebtScheduleRow[]> {
    try {
      const response = await httpClient.get<DebtScheduleRow[]>(
        `/debt-calculations/${projectId}/${debtType}`
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load debt calculations');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error loading debt calculations:', error);
      throw error;
    }
  }

  /**
   * Calculate summary statistics
   */
  static calculateSummary(schedule: DebtScheduleRow[]): {
    totalInterest: number;
    totalRepayment: number;
    totalAdditionalLoan: number;
    finalBalance: number;
  } {
    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    const totalRepayment = schedule.reduce((sum, row) => sum + row.repayment, 0);
    const totalAdditionalLoan = schedule.reduce((sum, row) => sum + row.additionalLoan, 0);
    const finalBalance = schedule[schedule.length - 1]?.closingBalance || 0;

    return {
      totalInterest,
      totalRepayment,
      totalAdditionalLoan,
      finalBalance
    };
  }
} 