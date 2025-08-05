import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id, x-request-time',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const url = new URL(req.url)
    const path = url.pathname

    // Extract project ID and debt type from path
    const pathParts = path.split('/')
    const projectId = pathParts[pathParts.length - 2]
    const debtType = pathParts[pathParts.length - 1]

    if (req.method === 'GET') {
      // Get debt calculations for a project and debt type
      const { data, error } = await supabase
        .from('debt_calculations')
        .select('*')
        .eq('project_id', projectId)
        .eq('debt_type', debtType)
        .order('month_cum')

      if (error) {
        console.error('Error fetching debt calculations:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch debt calculations' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      // Save debt calculations
      const body = await req.json()
      const { projectId: bodyProjectId, debtType: bodyDebtType, schedule } = body

      // First, delete existing calculations
      const { error: deleteError } = await supabase
        .from('debt_calculations')
        .delete()
        .eq('project_id', bodyProjectId)
        .eq('debt_type', bodyDebtType)

      if (deleteError) {
        console.error('Error deleting existing debt calculations:', deleteError)
      }

      // Insert new calculations
      const calculationsToInsert = schedule.map((row: any) => ({
        project_id: bodyProjectId,
        debt_type: bodyDebtType,
        month_cum: row.monthCum,
        year: row.year,
        month: row.month,
        opening_balance: row.openingBalance,
        additional_loan: row.additionalLoan,
        amortisation: row.amortisation,
        interest: row.interest,
        repayment: row.repayment,
        closing_balance: row.closingBalance
      }))

      const { data, error } = await supabase
        .from('debt_calculations')
        .insert(calculationsToInsert)

      if (error) {
        console.error('Error inserting debt calculations:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save debt calculations' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'DELETE') {
      // Delete debt calculations for a project and debt type
      const { error } = await supabase
        .from('debt_calculations')
        .delete()
        .eq('project_id', projectId)
        .eq('debt_type', debtType)

      if (error) {
        console.error('Error deleting debt calculations:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to delete debt calculations' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 