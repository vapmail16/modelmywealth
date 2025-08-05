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

    // Extract project ID from path
    const pathParts = path.split('/')
    const projectId = pathParts[pathParts.length - 1]

    if (req.method === 'GET') {
      // Get depreciation schedule for a project
      const { data, error } = await supabase
        .from('depreciation_schedule')
        .select('*')
        .eq('project_id', projectId)
        .order('month_cum')

      if (error) {
        console.error('Error fetching depreciation schedule:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch depreciation schedule' }),
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
      // Save depreciation schedule
      const body = await req.json()
      const { projectId: bodyProjectId, schedule } = body

      // First, delete existing depreciation schedule
      const { error: deleteError } = await supabase
        .from('depreciation_schedule')
        .delete()
        .eq('project_id', bodyProjectId)

      if (deleteError) {
        console.error('Error deleting existing depreciation schedule:', deleteError)
      }

      // Insert new depreciation schedule
      const scheduleToInsert = schedule.map((row: any) => ({
        project_id: bodyProjectId,
        month_cum: row.monthCum,
        year: row.year,
        month: row.month,
        asset_value: row.assetValue,
        depreciation_rate: row.depreciationRate,
        monthly_depreciation: row.monthlyDepreciation,
        accumulated_depreciation: row.accumulatedDepreciation,
        net_book_value: row.netBookValue
      }))

      const { data, error } = await supabase
        .from('depreciation_schedule')
        .insert(scheduleToInsert)

      if (error) {
        console.error('Error inserting depreciation schedule:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save depreciation schedule' }),
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
      // Delete depreciation schedule for a project
      const { error } = await supabase
        .from('depreciation_schedule')
        .delete()
        .eq('project_id', projectId)

      if (error) {
        console.error('Error deleting depreciation schedule:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to delete depreciation schedule' }),
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