export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      balance_sheet_data: {
        Row: {
          accounts_payable_provisions: number | null
          accounts_receivable: number | null
          additional_capex_planned_next_year: number | null
          asset_depreciated_over_years: number | null
          asset_depreciated_over_years_new: number | null
          capital_expenditure_additions: number | null
          cash: number | null
          created_at: string
          debt_tranche1: number | null
          equity: number | null
          id: string
          inventory: number | null
          other_assets: number | null
          other_current_assets: number | null
          other_long_term_debt: number | null
          ppe: number | null
          project_id: string
          retained_earnings: number | null
          senior_secured: number | null
          short_term_debt: number | null
          total_assets: number | null
          total_liabilities_and_equity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accounts_payable_provisions?: number | null
          accounts_receivable?: number | null
          additional_capex_planned_next_year?: number | null
          asset_depreciated_over_years?: number | null
          asset_depreciated_over_years_new?: number | null
          capital_expenditure_additions?: number | null
          cash?: number | null
          created_at?: string
          debt_tranche1?: number | null
          equity?: number | null
          id?: string
          inventory?: number | null
          other_assets?: number | null
          other_current_assets?: number | null
          other_long_term_debt?: number | null
          ppe?: number | null
          project_id: string
          retained_earnings?: number | null
          senior_secured?: number | null
          short_term_debt?: number | null
          total_assets?: number | null
          total_liabilities_and_equity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accounts_payable_provisions?: number | null
          accounts_receivable?: number | null
          additional_capex_planned_next_year?: number | null
          asset_depreciated_over_years?: number | null
          asset_depreciated_over_years_new?: number | null
          capital_expenditure_additions?: number | null
          cash?: number | null
          created_at?: string
          debt_tranche1?: number | null
          equity?: number | null
          id?: string
          inventory?: number | null
          other_assets?: number | null
          other_current_assets?: number | null
          other_long_term_debt?: number | null
          ppe?: number | null
          project_id?: string
          retained_earnings?: number | null
          senior_secured?: number | null
          short_term_debt?: number | null
          total_assets?: number | null
          total_liabilities_and_equity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_sheet_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_flow_data: {
        Row: {
          capital_expenditures: number | null
          created_at: string
          debt_service: number | null
          free_cash_flow: number | null
          id: string
          operating_cash_flow: number | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capital_expenditures?: number | null
          created_at?: string
          debt_service?: number | null
          free_cash_flow?: number | null
          id?: string
          operating_cash_flow?: number | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capital_expenditures?: number | null
          created_at?: string
          debt_service?: number | null
          free_cash_flow?: number | null
          id?: string
          operating_cash_flow?: number | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_flow_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          description: string | null
          headquarters: string | null
          id: string
          industry: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      company_details: {
        Row: {
          business_case: string | null
          company_name: string | null
          company_website: string | null
          country: string | null
          created_at: string
          employee_count: number | null
          founded: number | null
          id: string
          industry: string | null
          notes: string | null
          project_id: string
          projection_start_month: number | null
          projection_start_year: number | null
          projections_year: number | null
          region: string | null
          reporting_currency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_case?: string | null
          company_name?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          founded?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          project_id: string
          projection_start_month?: number | null
          projection_start_year?: number | null
          projections_year?: number | null
          region?: string | null
          reporting_currency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_case?: string | null
          company_name?: string | null
          company_website?: string | null
          country?: string | null
          created_at?: string
          employee_count?: number | null
          founded?: number | null
          id?: string
          industry?: string | null
          notes?: string | null
          project_id?: string
          projection_start_month?: number | null
          projection_start_year?: number | null
          projections_year?: number | null
          region?: string | null
          reporting_currency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_details_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      debt_structure_data: {
        Row: {
          additional_loan_senior_secured: number | null
          additional_loan_short_term: number | null
          amortization_y_senior_secured: number | null
          amortization_y_short_term: number | null
          bank_base_rate_senior_secured: number | null
          bank_base_rate_short_term: number | null
          created_at: string
          credit_risk_premiums_senior_secured: number | null
          credit_risk_premiums_short_term: number | null
          id: string
          liquidity_premiums_senior_secured: number | null
          liquidity_premiums_short_term: number | null
          maturity_y_senior_secured: number | null
          maturity_y_short_term: number | null
          project_id: string
          senior_secured_loan_type: string | null
          short_term_loan_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_loan_senior_secured?: number | null
          additional_loan_short_term?: number | null
          amortization_y_senior_secured?: number | null
          amortization_y_short_term?: number | null
          bank_base_rate_senior_secured?: number | null
          bank_base_rate_short_term?: number | null
          created_at?: string
          credit_risk_premiums_senior_secured?: number | null
          credit_risk_premiums_short_term?: number | null
          id?: string
          liquidity_premiums_senior_secured?: number | null
          liquidity_premiums_short_term?: number | null
          maturity_y_senior_secured?: number | null
          maturity_y_short_term?: number | null
          project_id: string
          senior_secured_loan_type?: string | null
          short_term_loan_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_loan_senior_secured?: number | null
          additional_loan_short_term?: number | null
          amortization_y_senior_secured?: number | null
          amortization_y_short_term?: number | null
          bank_base_rate_senior_secured?: number | null
          bank_base_rate_short_term?: number | null
          created_at?: string
          credit_risk_premiums_senior_secured?: number | null
          credit_risk_premiums_short_term?: number | null
          id?: string
          liquidity_premiums_senior_secured?: number | null
          liquidity_premiums_short_term?: number | null
          maturity_y_senior_secured?: number | null
          maturity_y_short_term?: number | null
          project_id?: string
          senior_secured_loan_type?: string | null
          short_term_loan_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_structure_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_calculations: {
        Row: {
          asset_turnover: number | null
          calculated_at: string
          calculation_version: number | null
          created_at: string
          current_ratio: number | null
          debt_to_ebitda: number | null
          debt_to_equity: number | null
          dscr: number | null
          ebitda_margin: number | null
          gross_margin: number | null
          id: string
          interest_coverage: number | null
          net_margin: number | null
          operating_margin: number | null
          project_id: string
          quick_ratio: number | null
          return_on_assets: number | null
          return_on_equity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_turnover?: number | null
          calculated_at?: string
          calculation_version?: number | null
          created_at?: string
          current_ratio?: number | null
          debt_to_ebitda?: number | null
          debt_to_equity?: number | null
          dscr?: number | null
          ebitda_margin?: number | null
          gross_margin?: number | null
          id?: string
          interest_coverage?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          project_id: string
          quick_ratio?: number | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_turnover?: number | null
          calculated_at?: string
          calculation_version?: number | null
          created_at?: string
          current_ratio?: number | null
          debt_to_ebitda?: number | null
          debt_to_equity?: number | null
          dscr?: number | null
          ebitda_margin?: number | null
          gross_margin?: number | null
          id?: string
          interest_coverage?: number | null
          net_margin?: number | null
          operating_margin?: number | null
          project_id?: string
          quick_ratio?: number | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_data: {
        Row: {
          created_at: string
          data: Json
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_assumptions_data: {
        Row: {
          created_at: string
          gr_capex_1: number | null
          gr_capex_10: number | null
          gr_capex_11: number | null
          gr_capex_12: number | null
          gr_capex_2: number | null
          gr_capex_3: number | null
          gr_capex_4: number | null
          gr_capex_5: number | null
          gr_capex_6: number | null
          gr_capex_7: number | null
          gr_capex_8: number | null
          gr_capex_9: number | null
          gr_cost_1: number | null
          gr_cost_10: number | null
          gr_cost_11: number | null
          gr_cost_12: number | null
          gr_cost_2: number | null
          gr_cost_3: number | null
          gr_cost_4: number | null
          gr_cost_5: number | null
          gr_cost_6: number | null
          gr_cost_7: number | null
          gr_cost_8: number | null
          gr_cost_9: number | null
          gr_cost_oper_1: number | null
          gr_cost_oper_10: number | null
          gr_cost_oper_11: number | null
          gr_cost_oper_12: number | null
          gr_cost_oper_2: number | null
          gr_cost_oper_3: number | null
          gr_cost_oper_4: number | null
          gr_cost_oper_5: number | null
          gr_cost_oper_6: number | null
          gr_cost_oper_7: number | null
          gr_cost_oper_8: number | null
          gr_cost_oper_9: number | null
          gr_revenue_1: number | null
          gr_revenue_10: number | null
          gr_revenue_11: number | null
          gr_revenue_12: number | null
          gr_revenue_2: number | null
          gr_revenue_3: number | null
          gr_revenue_4: number | null
          gr_revenue_5: number | null
          gr_revenue_6: number | null
          gr_revenue_7: number | null
          gr_revenue_8: number | null
          gr_revenue_9: number | null
          id: string
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gr_capex_1?: number | null
          gr_capex_10?: number | null
          gr_capex_11?: number | null
          gr_capex_12?: number | null
          gr_capex_2?: number | null
          gr_capex_3?: number | null
          gr_capex_4?: number | null
          gr_capex_5?: number | null
          gr_capex_6?: number | null
          gr_capex_7?: number | null
          gr_capex_8?: number | null
          gr_capex_9?: number | null
          gr_cost_1?: number | null
          gr_cost_10?: number | null
          gr_cost_11?: number | null
          gr_cost_12?: number | null
          gr_cost_2?: number | null
          gr_cost_3?: number | null
          gr_cost_4?: number | null
          gr_cost_5?: number | null
          gr_cost_6?: number | null
          gr_cost_7?: number | null
          gr_cost_8?: number | null
          gr_cost_9?: number | null
          gr_cost_oper_1?: number | null
          gr_cost_oper_10?: number | null
          gr_cost_oper_11?: number | null
          gr_cost_oper_12?: number | null
          gr_cost_oper_2?: number | null
          gr_cost_oper_3?: number | null
          gr_cost_oper_4?: number | null
          gr_cost_oper_5?: number | null
          gr_cost_oper_6?: number | null
          gr_cost_oper_7?: number | null
          gr_cost_oper_8?: number | null
          gr_cost_oper_9?: number | null
          gr_revenue_1?: number | null
          gr_revenue_10?: number | null
          gr_revenue_11?: number | null
          gr_revenue_12?: number | null
          gr_revenue_2?: number | null
          gr_revenue_3?: number | null
          gr_revenue_4?: number | null
          gr_revenue_5?: number | null
          gr_revenue_6?: number | null
          gr_revenue_7?: number | null
          gr_revenue_8?: number | null
          gr_revenue_9?: number | null
          id?: string
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gr_capex_1?: number | null
          gr_capex_10?: number | null
          gr_capex_11?: number | null
          gr_capex_12?: number | null
          gr_capex_2?: number | null
          gr_capex_3?: number | null
          gr_capex_4?: number | null
          gr_capex_5?: number | null
          gr_capex_6?: number | null
          gr_capex_7?: number | null
          gr_capex_8?: number | null
          gr_capex_9?: number | null
          gr_cost_1?: number | null
          gr_cost_10?: number | null
          gr_cost_11?: number | null
          gr_cost_12?: number | null
          gr_cost_2?: number | null
          gr_cost_3?: number | null
          gr_cost_4?: number | null
          gr_cost_5?: number | null
          gr_cost_6?: number | null
          gr_cost_7?: number | null
          gr_cost_8?: number | null
          gr_cost_9?: number | null
          gr_cost_oper_1?: number | null
          gr_cost_oper_10?: number | null
          gr_cost_oper_11?: number | null
          gr_cost_oper_12?: number | null
          gr_cost_oper_2?: number | null
          gr_cost_oper_3?: number | null
          gr_cost_oper_4?: number | null
          gr_cost_oper_5?: number | null
          gr_cost_oper_6?: number | null
          gr_cost_oper_7?: number | null
          gr_cost_oper_8?: number | null
          gr_cost_oper_9?: number | null
          gr_revenue_1?: number | null
          gr_revenue_10?: number | null
          gr_revenue_11?: number | null
          gr_revenue_12?: number | null
          gr_revenue_2?: number | null
          gr_revenue_3?: number | null
          gr_revenue_4?: number | null
          gr_revenue_5?: number | null
          gr_revenue_6?: number | null
          gr_revenue_7?: number | null
          gr_revenue_8?: number | null
          gr_revenue_9?: number | null
          id?: string
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_assumptions_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          product_name: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          product_name?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      profit_loss_data: {
        Row: {
          cogs: number | null
          created_at: string
          depreciation: number | null
          ebit: number | null
          ebitda: number | null
          gross_profit: number | null
          id: string
          interest_expense: number | null
          net_income: number | null
          operating_expenses: number | null
          pretax_income: number | null
          project_id: string
          revenue: number | null
          tax_rates: number | null
          taxes: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cogs?: number | null
          created_at?: string
          depreciation?: number | null
          ebit?: number | null
          ebitda?: number | null
          gross_profit?: number | null
          id?: string
          interest_expense?: number | null
          net_income?: number | null
          operating_expenses?: number | null
          pretax_income?: number | null
          project_id: string
          revenue?: number | null
          tax_rates?: number | null
          taxes?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cogs?: number | null
          created_at?: string
          depreciation?: number | null
          ebit?: number | null
          ebitda?: number | null
          gross_profit?: number | null
          id?: string
          interest_expense?: number | null
          net_income?: number | null
          operating_expenses?: number | null
          pretax_income?: number | null
          project_id?: string
          revenue?: number | null
          tax_rates?: number | null
          taxes?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profit_loss_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          project_type: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_type?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_type?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      role_capabilities: {
        Row: {
          capability: Database["public"]["Enums"]["capability"]
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          capability: Database["public"]["Enums"]["capability"]
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          capability?: Database["public"]["Enums"]["capability"]
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      seasonality_data: {
        Row: {
          april: number | null
          august: number | null
          created_at: string
          december: number | null
          february: number | null
          id: string
          january: number | null
          july: number | null
          june: number | null
          march: number | null
          may: number | null
          november: number | null
          october: number | null
          project_id: string
          seasonal_working_capital: number | null
          seasonality_pattern: string | null
          september: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          april?: number | null
          august?: number | null
          created_at?: string
          december?: number | null
          february?: number | null
          id?: string
          january?: number | null
          july?: number | null
          june?: number | null
          march?: number | null
          may?: number | null
          november?: number | null
          october?: number | null
          project_id: string
          seasonal_working_capital?: number | null
          seasonality_pattern?: string | null
          september?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          april?: number | null
          august?: number | null
          created_at?: string
          december?: number | null
          february?: number | null
          id?: string
          january?: number | null
          july?: number | null
          june?: number | null
          march?: number | null
          may?: number | null
          november?: number | null
          october?: number | null
          project_id?: string
          seasonal_working_capital?: number | null
          seasonality_pattern?: string | null
          september?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonality_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      working_capital_data: {
        Row: {
          account_receivable_percent: number | null
          accounts_payable_percent: number | null
          created_at: string
          id: string
          inventory_percent: number | null
          other_current_assets_percent: number | null
          project_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_receivable_percent?: number | null
          accounts_payable_percent?: number | null
          created_at?: string
          id?: string
          inventory_percent?: number | null
          other_current_assets_percent?: number | null
          project_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_receivable_percent?: number | null
          accounts_payable_percent?: number | null
          created_at?: string
          id?: string
          inventory_percent?: number | null
          other_current_assets_percent?: number | null
          project_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "working_capital_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_has_capability: {
        Args: {
          _user_id: string
          _capability: Database["public"]["Enums"]["capability"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "analyst"
      capability:
        | "manage_users"
        | "manage_roles"
        | "view_analytics"
        | "create_reports"
        | "manage_companies"
        | "manage_projects"
        | "view_financial_data"
        | "edit_financial_data"
        | "export_data"
        | "system_settings"
      user_type: "tech" | "business"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "analyst"],
      capability: [
        "manage_users",
        "manage_roles",
        "view_analytics",
        "create_reports",
        "manage_companies",
        "manage_projects",
        "view_financial_data",
        "edit_financial_data",
        "export_data",
        "system_settings",
      ],
      user_type: ["tech", "business"],
    },
  },
} as const
