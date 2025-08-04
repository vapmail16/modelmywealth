import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function for logging
const logStep = (step: string, data?: any) => {
  console.log(`[user-profile-creation] ${step}`, data ? JSON.stringify(data, null, 2) : '');
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep('Starting user profile creation');

    // Create Supabase client with service role for bypassing RLS
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData = await req.json();
    logStep('Request data received', requestData);

    const { user_id, email, full_name, user_type } = requestData;

    if (!user_id || !email || !full_name || !user_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    logStep('Creating user profile');

    // Create profile using service role to bypass RLS
    const { error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        user_id,
        email,
        full_name,
        user_type,
      });

    if (profileError) {
      logStep('Profile creation error', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to create profile', details: profileError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create default role using service role
    const defaultRole = user_type === 'tech' ? 'user' : 'analyst';
    
    logStep('Creating user role', { user_id, role: defaultRole, user_type });

    const { error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id,
        role: defaultRole,
        user_type,
      });

    if (roleError) {
      logStep('Role creation error (non-fatal)', roleError);
      // Don't fail the request if role creation fails
    } else {
      logStep('User role created successfully');
    }

    logStep('Profile creation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User profile created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Unexpected error', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});