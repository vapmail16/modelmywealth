import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for better TypeScript support
type Tables = Database['public']['Tables'];
type ProfitLossData = Tables['profit_loss_data']['Insert'];
type BalanceSheetData = Tables['balance_sheet_data']['Insert'];
type DebtStructureData = Tables['debt_structure_data']['Insert'];
type GrowthAssumptionsData = Tables['growth_assumptions_data']['Insert'];
type WorkingCapitalData = Tables['working_capital_data']['Insert'];
type SeasonalityData = Tables['seasonality_data']['Insert'];

/**
 * Service for handling Supabase data operations
 */
export class SupabaseDataService {
  
  /**
   * Save P&L data to Supabase
   */
  static async saveProfitLossData(projectId: string, data: Partial<ProfitLossData>): Promise<void> {
    const { error } = await supabase
      .from('profit_loss_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save P&L data: ${error.message}`);
    }
  }

  /**
   * Save Balance Sheet data to Supabase
   */
  static async saveBalanceSheetData(projectId: string, data: Partial<BalanceSheetData>): Promise<void> {
    const { error } = await supabase
      .from('balance_sheet_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save Balance Sheet data: ${error.message}`);
    }
  }

  /**
   * Save Debt Structure data to Supabase
   */
  static async saveDebtStructureData(projectId: string, data: Partial<DebtStructureData>): Promise<void> {
    const { error } = await supabase
      .from('debt_structure_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save Debt Structure data: ${error.message}`);
    }
  }

  /**
   * Save Growth Assumptions data to Supabase
   */
  static async saveGrowthAssumptions(projectId: string, data: Partial<GrowthAssumptionsData>): Promise<void> {
    const { error } = await supabase
      .from('growth_assumptions_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save Growth Assumptions data: ${error.message}`);
    }
  }

  /**
   * Save Working Capital data to Supabase
   */
  static async saveWorkingCapitalData(projectId: string, data: Partial<WorkingCapitalData>): Promise<void> {
    const { error } = await supabase
      .from('working_capital_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save Working Capital data: ${error.message}`);
    }
  }

  /**
   * Load Debt Structure data from Supabase
   */
  static async loadDebtStructureData(projectId: string): Promise<DebtStructureData | null> {
    const { data, error } = await supabase
      .from('debt_structure_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading debt structure data:', error);
      return null;
    }

    return data;
  }

  /**
   * Load Balance Sheet data from Supabase (for depreciation inputs)
   */
  static async loadBalanceSheetData(projectId: string): Promise<BalanceSheetData | null> {
    const { data, error } = await supabase
      .from('balance_sheet_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading balance sheet data:', error);
      return null;
    }

    return data;
  }

  /**
   * Load Profit Loss data from Supabase
   */
  static async loadProfitLossData(projectId: string): Promise<ProfitLossData | null> {
    const { data, error } = await supabase
      .from('profit_loss_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading profit loss data:', error);
      return null;
    }

    return data;
  }

  /**
   * Load Growth Assumptions data from Supabase
   */
  static async loadGrowthAssumptionsData(projectId: string): Promise<GrowthAssumptionsData | null> {
    const { data, error } = await supabase
      .from('growth_assumptions_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading growth assumptions data:', error);
      return null;
    }

    return data;
  }

  /**
   * Load Working Capital data from Supabase
   */
  static async loadWorkingCapitalData(projectId: string): Promise<WorkingCapitalData | null> {
    const { data, error } = await supabase
      .from('working_capital_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading working capital data:', error);
      return null;
    }

    return data;
  }

  /**
   * Load Seasonality data from Supabase
   */
  static async loadSeasonalityData(projectId: string): Promise<SeasonalityData | null> {
    const { data, error } = await supabase
      .from('seasonality_data')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      console.error('Error loading seasonality data:', error);
      return null;
    }

    return data;
  }

  /**
   * Save Seasonality data to Supabase
   */
  static async saveSeasonalityData(projectId: string, data: Partial<SeasonalityData>): Promise<void> {
    const { error } = await supabase
      .from('seasonality_data')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(`Failed to save Seasonality data: ${error.message}`);
    }
  }

  /**
   * Load all financial data for a project
   */
  static async loadProjectData(projectId: string) {
    console.log('SupabaseDataService: Loading project data for:', projectId);
    
    // Initialize all data variables to null
    let profitLossData = null;
    let balanceSheetData = null;
    let debtStructureData = null;
    let growthAssumptionsData = null;
    let workingCapitalData = null;
    let seasonalityData = null;
    let companyDetailsData = null;
    let cashFlowData = null;
    
    try {
      console.log('SupabaseDataService: Starting queries...');
      
      // Test if Supabase is working
      console.log('SupabaseDataService: Testing connection...');
      const { data: testData, error: testError } = await supabase.from('projects').select('id').limit(1);
      console.log('SupabaseDataService: Connection test result:', { testData: !!testData, testError });
      
      if (testError) {
        console.error('SupabaseDataService: Connection failed:', testError);
        return { profitLossData, balanceSheetData, debtStructureData, growthAssumptionsData, workingCapitalData, seasonalityData };
      }
      
      // Query each table and assign results with timeout
      try {
        console.log('SupabaseDataService: Querying profit_loss_data...');
        const { data, error } = await supabase.from('profit_loss_data').select('*').eq('project_id', projectId).maybeSingle();
        profitLossData = data;
        console.log('SupabaseDataService: profit_loss_data completed, data:', !!data, 'error:', error);
      } catch (e) {
        console.log('SupabaseDataService: profit_loss_data failed:', e);
      }

      try {
        const { data, error } = await supabase.from('balance_sheet_data').select('*').eq('project_id', projectId).maybeSingle();
        balanceSheetData = data;
        console.log('SupabaseDataService: balance_sheet_data completed, data:', !!data);
      } catch (e) {
        console.log('SupabaseDataService: balance_sheet_data failed:', e);
      }

      try {
        const { data, error } = await supabase.from('debt_structure_data').select('*').eq('project_id', projectId).maybeSingle();
        debtStructureData = data;
        console.log('SupabaseDataService: debt_structure_data completed, data:', !!data);
      } catch (e) {
        console.log('SupabaseDataService: debt_structure_data failed:', e);
      }

      try {
        const { data, error } = await supabase.from('growth_assumptions_data').select('*').eq('project_id', projectId).maybeSingle();
        growthAssumptionsData = data;
        console.log('SupabaseDataService: growth_assumptions_data completed, data:', !!data);
      } catch (e) {
        console.log('SupabaseDataService: growth_assumptions_data failed:', e);
      }

      try {
        const { data, error } = await supabase.from('working_capital_data').select('*').eq('project_id', projectId).maybeSingle();
        workingCapitalData = data;
        console.log('SupabaseDataService: working_capital_data completed, data:', !!data);
      } catch (e) {
        console.log('SupabaseDataService: working_capital_data failed:', e);
      }

      try {
        const { data, error } = await supabase.from('seasonality_data').select('*').eq('project_id', projectId).maybeSingle();
        seasonalityData = data;
        console.log('SupabaseDataService: seasonality_data completed, data:', !!data);
      } catch (e) {
        console.log('SupabaseDataService: seasonality_data failed:', e);
      }

      // Add missing queries for company_details and cash_flow_data
      try {
        console.log('SupabaseDataService: Querying company_details...');
        const { data, error } = await supabase.from('company_details').select('*').eq('project_id', projectId).maybeSingle();
        companyDetailsData = data;
        console.log('SupabaseDataService: company_details completed, data:', !!data, 'error:', error);
      } catch (e) {
        console.log('SupabaseDataService: company_details failed:', e);
      }

      try {
        console.log('SupabaseDataService: Querying cash_flow_data...');
        const { data, error } = await supabase.from('cash_flow_data').select('*').eq('project_id', projectId).maybeSingle();
        cashFlowData = data;
        console.log('SupabaseDataService: cash_flow_data completed, data:', !!data, 'error:', error);
      } catch (e) {
        console.log('SupabaseDataService: cash_flow_data failed:', e);
      }

      console.log('SupabaseDataService: All queries completed. Returning data...');
      
    } catch (error) {
      console.error('SupabaseDataService: Exception in loadProjectData:', error);
      // Don't throw - return empty data instead
    }

    // Always return the data object, even if some queries failed
    return {
      profitLossData,
      balanceSheetData,
      debtStructureData,
      growthAssumptionsData,
      workingCapitalData,
      seasonalityData,
      companyDetailsData,
      cashFlowData,
    };
  }

  /**
   * Create a new project
   */
  static async createProject(projectData: {
    name: string;
    description?: string;
    company_id: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        user_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's projects
   */
  static async getUserProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        companies (
          name,
          industry
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user projects: ${error.message}`);
    }

    return data;
  }

  /**
   * Save calculation results
   */
  static async saveCalculationResults(projectId: string, results: any) {
    const { error } = await supabase
      .from('financial_calculations')
      .upsert({
        project_id: projectId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        debt_to_ebitda: results.debtToEbitda,
        dscr: results.dscr,
        interest_coverage: results.interestCoverage,
        debt_to_equity: results.debtToEquity,
        current_ratio: results.currentRatio,
        quick_ratio: results.quickRatio,
        operating_margin: results.operatingMargin,
        gross_margin: results.grossMargin,
        ebitda_margin: results.ebitdaMargin,
        net_margin: results.netMargin,
        return_on_assets: results.returnOnAssets,
        return_on_equity: results.returnOnEquity,
        asset_turnover: results.assetTurnover,
        calculated_at: new Date().toISOString(),
        calculation_version: 1,
      });

    if (error) {
      throw new Error(`Failed to save calculation results: ${error.message}`);
    }
  }
} 