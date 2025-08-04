import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const method = req.method;
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const endpoint = pathSegments[pathSegments.length - 1];

    console.log(`Processing ${method} request to ${endpoint} for user ${user.id}`);

    // Handle different endpoints
    switch (endpoint) {
      case 'send':
        if (method === 'POST') {
          // Send notification - proxy to send-notification function
          const body = await req.json();
          
          const { data, error } = await supabase.functions.invoke('send-notification', {
            body,
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json'
            }
          });

          if (error) {
            throw error;
          }

          return new Response(
            JSON.stringify(data),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'history':
        if (method === 'GET') {
          const page = parseInt(url.searchParams.get('page') || '1');
          const limit = parseInt(url.searchParams.get('limit') || '50');
          const offset = (page - 1) * limit;

          const { data: notifications, error: historyError } = await supabase
            .from('notification_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (historyError) {
            throw historyError;
          }

          const { count } = await supabase
            .from('notification_history')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          return new Response(
            JSON.stringify({ notifications: notifications || [], total: count || 0 }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'preferences':
        if (method === 'GET') {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('notification_preferences')
            .eq('user_id', user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          return new Response(
            JSON.stringify({ preferences: profile?.notification_preferences || {} }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (method === 'PUT') {
          const { preferences } = await req.json();

          const { error: updateError } = await supabase
            .from('profiles')
            .update({ notification_preferences: preferences })
            .eq('user_id', user.id);

          if (updateError) {
            throw updateError;
          }

          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'unsubscribe':
        if (method === 'POST') {
          const { token } = await req.json();
          
          // Simple token validation (in production, use proper JWT)
          if (!token || token.length < 10) {
            return new Response(
              JSON.stringify({ error: 'Invalid unsubscribe token' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Disable all email notifications
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              notification_preferences: {
                email_enabled: false,
                frequency: 'immediate',
                types: {
                  security: false,
                  reports: false,
                  system: false,
                  collaboration: false,
                  welcome: false
                }
              }
            })
            .eq('user_id', user.id);

          if (updateError) {
            throw updateError;
          }

          return new Response(
            JSON.stringify({ success: true, message: 'Successfully unsubscribed from all notifications' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in notification-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);