import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id, x-request-time',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Helper function for logging
const logStep = (step: string, data?: any) => {
  console.log(`[auth] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    logStep('Starting authentication');

    // Create Supabase client with anon key for authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    logStep('Supabase client created successfully');

    // Parse request body
    const { email, password } = await req.json()

    logStep('Auth attempt received', { email, passwordLength: password?.length });

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Authenticate user
    logStep('Attempting to authenticate with Supabase...');
    
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    logStep('Auth result', { 
      success: !error, 
      error: error?.message,
      errorCode: error?.status,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      userEmail: data?.user?.email
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data.user || !data.session) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

        // Return user and session data in the expected format
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at,
            updated_at: data.user.updated_at,
            user_metadata: data.user.user_metadata,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          }
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Auth function error:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 