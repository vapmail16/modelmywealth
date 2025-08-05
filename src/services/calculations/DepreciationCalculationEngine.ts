import { httpClient } from '../http/client';
import { ApiResponse } from '@/types/api';

export interface DepreciationCalculationInput {
  projectId: string;
  openingBalance: number; // Starting asset value
  monthlyCapex: number; // Monthly capital expenditure addition
  depreciationRate: number; // Annual depreciation rate as percentage
  depreciationMethod: 'straight_line' | 'declining_balance';
}

export interface DepreciationScheduleRow {
  monthCum: number;
  year: number;
  month: string;
  openingBalance: number;
  capexAddition: number;
  depreciation: number;
  closingBalance: number;
}

export interface DepreciationCalculationResult {
  schedule: DepreciationScheduleRow[];
  summary: {
    totalDepreciation: number;
    finalNetBookValue: number;
    averageMonthlyDepreciation: number;
  };
}

export class DepreciationCalculationEngine {
  /**
   * Calculate monthly depreciation schedule
   */
  static calculateDepreciationSchedule(input: DepreciationCalculationInput): DepreciationScheduleRow[] {
    const {
      openingBalance,
      monthlyCapex,
      depreciationRate,
      depreciationMethod
    } = input;

    // Convert annual depreciation rate to monthly
    const monthlyDepreciationRate = depreciationRate / 100 / 12;

    // Generate 10 years of monthly data (120 months) - matching Excel logic
    const schedule: DepreciationScheduleRow[] = [];

    for (let monthCum = 1; monthCum <= 120; monthCum++) {
      const year = Math.ceil(monthCum / 12);
      const monthNumber = ((monthCum - 1) % 12) + 1;
      const month = new Date(2024, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'long' });

      let currentOpeningBalance: number;
      let capexAddition: number;
      let depreciation: number;

      if (monthCum === 1) {
        // First month
        currentOpeningBalance = openingBalance;
        capexAddition = monthlyCapex;
      } else {
        // Subsequent months
        currentOpeningBalance = schedule[monthCum - 2].closingBalance;
        capexAddition = monthlyCapex;
      }

      // Calculate depreciation based on opening balance + capex
      const depreciableValue = currentOpeningBalance + capexAddition;
      
      if (depreciationMethod === 'straight_line') {
        depreciation = depreciableValue * monthlyDepreciationRate;
      } else {
        // Declining balance
        depreciation = currentOpeningBalance * monthlyDepreciationRate;
      }

      // Calculate closing balance: Opening + Capex - Depreciation
      const closingBalance = currentOpeningBalance + capexAddition - depreciation;

      schedule.push({
        monthCum,
        year,
        month,
        openingBalance: currentOpeningBalance,
        capexAddition,
        depreciation,
        closingBalance
      });
    }

    return schedule;
  }

  /**
   * Save depreciation schedule to Supabase
   */
  static async saveDepreciationSchedule(
    projectId: string,
    schedule: DepreciationScheduleRow[]
  ): Promise<void> {
    try {
      console.log('DepreciationCalculationEngine: Saving depreciation schedule for project:', projectId);
      
      // Transform the schedule to match the Edge Function's expected format
      const transformedSchedule = schedule.map(row => ({
        monthCum: row.monthCum,
        year: row.year,
        month: row.month,
        assetValue: row.openingBalance,
        depreciationRate: 10, // Default rate, could be made configurable
        monthlyDepreciation: row.depreciation,
        accumulatedDepreciation: 0, // This would need to be calculated
        netBookValue: row.closingBalance
      }));

      // Insert new depreciation schedule (the Edge Function will handle deletion and insertion)
      const response = await httpClient.post('/depreciation-schedule', {
        projectId,
        schedule: transformedSchedule
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to save depreciation schedule');
      }
      
      console.log('DepreciationCalculationEngine: Successfully saved depreciation schedule');
    } catch (error) {
      console.error('Error saving depreciation schedule:', error);
      throw error;
    }
  }

  /**
   * Load depreciation schedule from Supabase
   */
  static async loadDepreciationSchedule(projectId: string): Promise<DepreciationScheduleRow[]> {
    try {
      const response = await httpClient.get<DepreciationScheduleRow[]>(
        `/depreciation-schedule/${projectId}`
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to load depreciation schedule');
      }

      return response.data || [];
    } catch (error) {
      console.error('Error loading depreciation schedule:', error);
      throw error;
    }
  }

  /**
   * Calculate summary statistics
   */
  static calculateSummary(schedule: DepreciationScheduleRow[]): {
    totalDepreciation: number;
    totalCapex: number;
    finalClosingBalance: number;
    averageMonthlyDepreciation: number;
  } {
    const totalDepreciation = schedule.reduce((sum, row) => sum + row.depreciation, 0);
    const totalCapex = schedule.reduce((sum, row) => sum + row.capexAddition, 0);
    const finalClosingBalance = schedule[schedule.length - 1]?.closingBalance || 0;
    const averageMonthlyDepreciation = totalDepreciation / schedule.length;

    return {
      totalDepreciation,
      totalCapex,
      finalClosingBalance,
      averageMonthlyDepreciation
    };
  }

  /**
   * Calculate depreciation for a specific year
   */
  static calculateYearlyDepreciation(schedule: DepreciationScheduleRow[], year: number): {
    yearlyDepreciation: number;
    yearEndNetBookValue: number;
  } {
    const yearRows = schedule.filter(row => row.year === year);
    const yearlyDepreciation = yearRows.reduce((sum, row) => sum + row.monthlyDepreciation, 0);
    const yearEndNetBookValue = yearRows[yearRows.length - 1]?.netBookValue || 0;

    return {
      yearlyDepreciation,
      yearEndNetBookValue
    };
  }
} 