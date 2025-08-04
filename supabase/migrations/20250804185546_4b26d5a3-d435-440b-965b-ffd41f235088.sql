-- Fix RLS security issues - Enable RLS on existing tables that need it
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- The new financial tables should already have RLS enabled from the previous migration
-- but let's ensure they are properly enabled
ALTER TABLE public.company_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profit_loss_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_sheet_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_structure_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_flow_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_assumptions_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_capital_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonality_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_calculations ENABLE ROW LEVEL SECURITY;