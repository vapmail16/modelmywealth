const debtCalculationRepository = require('../repositories/debtCalculationRepository');
const debtStructureRepository = require('../repositories/debtStructureRepository');
const balanceSheetRepository = require('../repositories/balanceSheetRepository');
const auditService = require('./auditService');
const loggerService = require('./logger');
const logger = loggerService.logger;

class DebtCalculationService {
  async validateRequiredData(projectId) {
    try {
      // Get debt structure data
      const debtStructureData = await debtStructureRepository.getByProjectId(projectId);
      if (!debtStructureData) {
        throw new Error('Debt structure data not found');
      }

      // Get balance sheet data
      const balanceSheetData = await balanceSheetRepository.getByProjectId(projectId);
      if (!balanceSheetData) {
        throw new Error('Balance sheet data not found');
      }

      return { debtStructureData, balanceSheetData };
    } catch (error) {
      throw new Error(`Data validation failed: ${error.message}`);
    }
  }

  calculateDebtSchedule(debtStructureData, balanceSheetData) {
    try {
      // Extract Senior Secured parameters
      const seniorSecured = {
        loanType: debtStructureData.senior_secured_loan_type,
        initialAmount: parseFloat(balanceSheetData.senior_secured || 0),
        additionalLoan: parseFloat(debtStructureData.additional_loan_senior_secured || 0),
        bankBaseRate: parseFloat(debtStructureData.bank_base_rate_senior_secured || 0) / 100,
        liquidityPremiums: parseFloat(debtStructureData.liquidity_premiums_senior_secured || 0) / 100,
        creditRiskPremiums: parseFloat(debtStructureData.credit_risk_premiums_senior_secured || 0) / 100,
        maturityYears: parseInt(debtStructureData.maturity_y_senior_secured || 0),
        amortizationYears: parseInt(debtStructureData.amortization_y_senior_secured || 0)
      };

      // Extract Short Term parameters
      const shortTerm = {
        loanType: debtStructureData.short_term_loan_type,
        initialAmount: parseFloat(balanceSheetData.debt_tranche1 || 0),
        additionalLoan: parseFloat(debtStructureData.additional_loan_short_term || 0),
        bankBaseRate: parseFloat(debtStructureData.bank_base_rate_short_term || 0) / 100,
        liquidityPremiums: parseFloat(debtStructureData.liquidity_premiums_short_term || 0) / 100,
        creditRiskPremiums: parseFloat(debtStructureData.credit_risk_premiums_short_term || 0) / 100,
        maturityYears: parseInt(debtStructureData.maturity_y_short_term || 0),
        amortizationYears: parseInt(debtStructureData.amortization_y_short_term || 0)
      };

      // Calculate interest rates
      seniorSecured.interestRatePerAnnum = seniorSecured.bankBaseRate + seniorSecured.liquidityPremiums + seniorSecured.creditRiskPremiums;
      seniorSecured.interestRatePerMonth = seniorSecured.interestRatePerAnnum / 12;
      seniorSecured.maturityMonths = seniorSecured.maturityYears * 12;
      seniorSecured.amortizationMonths = seniorSecured.amortizationYears * 12;
      seniorSecured.repaymentOverMonths = seniorSecured.maturityMonths - seniorSecured.amortizationMonths;

      shortTerm.interestRatePerAnnum = shortTerm.bankBaseRate + shortTerm.liquidityPremiums + shortTerm.creditRiskPremiums;
      shortTerm.interestRatePerMonth = shortTerm.interestRatePerAnnum / 12;
      shortTerm.maturityMonths = shortTerm.maturityYears * 12;
      shortTerm.amortizationMonths = shortTerm.amortizationYears * 12;
      shortTerm.repaymentOverMonths = shortTerm.maturityMonths - shortTerm.amortizationMonths;

      // Initialize combined state (matching Streamlit logic)
      this.combinedState = {
        previousClosingBalance: 0,
        previousRepayment: 0,
        repaymentInit: 0,
        outAftAmortization: (seniorSecured.initialAmount + seniorSecured.additionalLoan) + (shortTerm.initialAmount + shortTerm.additionalLoan),
        flgAmort: 0
      };

      // Generate 120-month schedule
      const schedule = [];
      let cumulativeInterest = 0;

      for (let month = 1; month <= 120; month++) {
        const year = Math.ceil(month / 12);
        
        // Calculate combined debt for this month (matching Streamlit logic)
        const combinedResult = this.calculateCombinedMonthlyDebt(seniorSecured, shortTerm, month);
        
        cumulativeInterest += combinedResult.interest;

        schedule.push({
          project_id: balanceSheetData.project_id,
          month: month,
          year: year,
          opening_balance: combinedResult.openingBalance,
          payment: combinedResult.repayment,
          interest_payment: combinedResult.interest,
          principal_payment: combinedResult.repayment,
          closing_balance: combinedResult.closingBalance,
          cumulative_interest: cumulativeInterest
        });
      }

      return schedule;
    } catch (error) {
      throw new Error(`Calculation failed: ${error.message}`);
    }
  }

  calculateCombinedMonthlyDebt(seniorSecured, shortTerm, month) {
    let openingBalance, additionalLoan, interest, repayment, closingBalance;
    
    if (month === 1) {
      // First month - combine both debt types (matching Streamlit logic)
      openingBalance = seniorSecured.initialAmount + shortTerm.initialAmount;
      additionalLoan = seniorSecured.additionalLoan + shortTerm.additionalLoan;
    } else {
      // Subsequent months - use previous combined closing balance
      openingBalance = this.combinedState.previousClosingBalance;
      additionalLoan = 0;
    }

    // Calculate interest for both debt types (matching Streamlit logic)
    let seniorSecuredInterest = 0;
    let shortTermInterest = 0;

    // Senior Secured interest (matching Streamlit logic)
    if (month <= seniorSecured.maturityMonths) {
      if (month <= seniorSecured.amortizationMonths) {
        // During amortization period (interest-only)
        seniorSecuredInterest = (seniorSecured.initialAmount + seniorSecured.additionalLoan) * seniorSecured.interestRatePerMonth;
      } else {
        // After amortization period
        seniorSecuredInterest = openingBalance * seniorSecured.interestRatePerMonth;
      }
    }

    // Short Term interest (matching Streamlit logic)
    if (month <= shortTerm.maturityMonths) {
      if (month <= shortTerm.amortizationMonths) {
        // During amortization period (interest-only)
        shortTermInterest = (shortTerm.initialAmount + shortTerm.additionalLoan) * shortTerm.interestRatePerMonth;
      } else {
        // After amortization period
        shortTermInterest = openingBalance * shortTerm.interestRatePerMonth;
      }
    }

    interest = seniorSecuredInterest + shortTermInterest;

    // Calculate repayment for both debt types (matching Streamlit logic)
    let seniorSecuredRepayment = 0;
    let shortTermRepayment = 0;

    // Senior Secured repayment (matching Streamlit logic)
    if (seniorSecured.amortizationMonths !== 0) {
      // Interest-only period exists
      seniorSecuredRepayment = 0;
    } else {
      // No interest-only period
      if (month > seniorSecured.amortizationMonths && this.combinedState.repaymentInit === 0) {
        const outAftAmortization = seniorSecured.initialAmount + seniorSecured.additionalLoan;
        seniorSecuredRepayment = this.calculatePMT(seniorSecured.interestRatePerMonth, seniorSecured.repaymentOverMonths, outAftAmortization);
      }
    }

    // Short Term repayment (matching Streamlit logic)
    if (shortTerm.amortizationMonths !== 0) {
      // Interest-only period exists
      shortTermRepayment = 0;
    } else {
      // No interest-only period
      if (month > shortTerm.amortizationMonths && this.combinedState.repaymentInit === 0) {
        const outAftAmortization = shortTerm.initialAmount + shortTerm.additionalLoan;
        shortTermRepayment = this.calculatePMT(shortTerm.interestRatePerMonth, shortTerm.repaymentOverMonths, outAftAmortization);
      }
    }

    repayment = seniorSecuredRepayment + shortTermRepayment;

    closingBalance = openingBalance + additionalLoan + interest + repayment;
    
    // Round to 2 decimal places and handle small values (matching Streamlit logic)
    if (Math.abs(closingBalance) < 1) {
      closingBalance = 0;
    }

    // Store for next iteration
    this.combinedState.previousClosingBalance = closingBalance;
    this.combinedState.previousRepayment = repayment;

    return {
      openingBalance,
      additionalLoan,
      interest,
      repayment,
      closingBalance
    };
  }

  calculatePMT(rate, nper, pv) {
    // PMT calculation matching numpy_financial.pmt
    if (rate === 0) return -pv / nper;
    
    const pmt = -pv * (rate * Math.pow(1 + rate, nper)) / (Math.pow(1 + rate, nper) - 1);
    return pmt;
  }

  async performDebtCalculation(projectId, userId, changeReason = 'Debt calculation performed') {
    try {
      const startTime = Date.now();
      
      // Validate required data
      const { debtStructureData, balanceSheetData } = await this.validateRequiredData(projectId);

      // Create calculation run record
      const calculationRun = await debtCalculationRepository.createCalculationRun({
        project_id: projectId,
        run_name: `Debt Calculation ${new Date().toISOString()}`,
        calculation_type: 'debt_calculation',
        input_data: { debtStructureData, balanceSheetData },
        output_data: {},
        status: 'running',
        created_by: userId
      });

      // Perform calculation
      const schedule = this.calculateDebtSchedule(debtStructureData, balanceSheetData);

      // Delete existing calculations for this project
      await debtCalculationRepository.deleteByProjectId(projectId);

      // Insert new calculations
      const calculationResults = [];
      for (const monthData of schedule) {
        const result = await debtCalculationRepository.create(monthData);
        calculationResults.push(result);
      }

      // Update calculation run with results
      const executionTime = Date.now() - startTime;
      await debtCalculationRepository.updateCalculationRun(calculationRun.id, {
        output_data: { 
          total_months: schedule.length,
          summary: {
            total_principal: schedule[0].opening_balance,
            total_interest: schedule[schedule.length - 1].cumulative_interest,
            final_balance: schedule[schedule.length - 1].closing_balance
          }
        },
        status: 'completed',
        completed_at: new Date(),
        execution_time_ms: executionTime
      });

      // Log audit trail
      await auditService.logChange({
        table_name: 'debt_calculations',
        record_id: calculationRun.id,
        action: 'INSERT',
        old_values: {},
        new_values: {
          project_id: projectId,
          calculation_run_id: calculationRun.id,
          total_records: calculationResults.length
        },
        changed_fields: ['calculation_performed'],
        change_reason: changeReason,
        user_id: userId,
        ip_address: null
      });

      return {
        success: true,
        calculationRun,
        results: calculationResults,
        summary: {
          total_months: schedule.length,
          total_principal: schedule[0].opening_balance,
          total_interest: schedule[schedule.length - 1].cumulative_interest,
          final_balance: schedule[schedule.length - 1].closing_balance,
          execution_time_ms: executionTime
        }
      };
    } catch (error) {
      logger.error(`Debt calculation failed: ${error.message}`);
      throw error;
    }
  }

  async getDebtCalculations(projectId) {
    try {
      const calculations = await debtCalculationRepository.getByProjectId(projectId);
      return calculations;
    } catch (error) {
      logger.error(`Failed to get debt calculations: ${error.message}`);
      throw error;
    }
  }

  async getCalculationHistory(projectId) {
    try {
      const history = await debtCalculationRepository.getCalculationHistory(projectId);
      return history;
    } catch (error) {
      logger.error(`Failed to get calculation history: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new DebtCalculationService(); 