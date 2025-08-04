import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  user_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, any>;
}

interface RateLimitEntry {
  identifier: string;
  limit_type: string;
  attempts: number;
  window_start: string;
  blocked_until?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    const method = req.method;

    console.log(`Security Management API: ${method} ${path}`);

    switch (path) {
      case 'log-event':
        if (method === 'POST') {
          const eventData: SecurityEvent = await req.json();
          
          const { data, error } = await supabaseClient
            .from('security_events')
            .insert({
              user_id: eventData.user_id,
              event_type: eventData.event_type,
              severity: eventData.severity,
              ip_address: eventData.ip_address,
              user_agent: eventData.user_agent,
              details: eventData.details || {}
            });

          if (error) {
            throw error;
          }

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'rate-limit':
        if (method === 'POST') {
          const { identifier, limit_type, max_attempts, window_ms } = await req.json();
          
          const windowStart = new Date(Date.now() - window_ms);
          
          // Check current attempts in window
          const { data: existingLimit, error: fetchError } = await supabaseClient
            .from('rate_limits')
            .select('*')
            .eq('identifier', identifier)
            .eq('limit_type', limit_type)
            .gte('window_start', windowStart.toISOString())
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw fetchError;
          }

          if (existingLimit) {
            // Check if blocked
            if (existingLimit.blocked_until && new Date() < new Date(existingLimit.blocked_until)) {
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  blocked: true,
                  blocked_until: existingLimit.blocked_until 
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            // Increment attempts
            if (existingLimit.attempts >= max_attempts) {
              // Block for 30 minutes
              const blockUntil = new Date(Date.now() + 30 * 60 * 1000);
              
              await supabaseClient
                .from('rate_limits')
                .update({ 
                  blocked_until: blockUntil.toISOString(),
                  attempts: existingLimit.attempts + 1 
                })
                .eq('id', existingLimit.id);

              return new Response(
                JSON.stringify({ 
                  success: false, 
                  blocked: true,
                  blocked_until: blockUntil.toISOString() 
                }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            } else {
              // Increment attempts
              await supabaseClient
                .from('rate_limits')
                .update({ attempts: existingLimit.attempts + 1 })
                .eq('id', existingLimit.id);
            }
          } else {
            // Create new rate limit entry
            await supabaseClient
              .from('rate_limits')
              .insert({
                identifier,
                limit_type,
                attempts: 1,
                window_start: new Date().toISOString()
              });
          }

          return new Response(
            JSON.stringify({ success: true, blocked: false }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'security-events':
        if (method === 'GET') {
          const userId = url.searchParams.get('user_id');
          const severity = url.searchParams.get('severity');
          const limit = parseInt(url.searchParams.get('limit') || '100');

          let query = supabaseClient
            .from('security_events')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

          if (userId) {
            query = query.eq('user_id', userId);
          }

          if (severity) {
            query = query.eq('severity', severity);
          }

          const { data, error } = await query;

          if (error) {
            throw error;
          }

          return new Response(
            JSON.stringify({ success: true, data }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        break;

      case 'session-management':
        if (method === 'POST') {
          const { action, user_id, session_token } = await req.json();

          switch (action) {
            case 'create':
              const { data: sessionData, error: sessionError } = await supabaseClient
                .from('user_sessions')
                .insert({
                  user_id,
                  session_token,
                  ip_address: req.headers.get('x-forwarded-for') || 'unknown',
                  user_agent: req.headers.get('user-agent') || 'unknown'
                })
                .select()
                .single();

              if (sessionError) {
                throw sessionError;
              }

              return new Response(
                JSON.stringify({ success: true, data: sessionData }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );

            case 'invalidate':
              const { error: invalidateError } = await supabaseClient
                .from('user_sessions')
                .update({ is_active: false })
                .eq('user_id', user_id)
                .eq('session_token', session_token);

              if (invalidateError) {
                throw invalidateError;
              }

              return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );

            case 'invalidate_all':
              const { error: invalidateAllError } = await supabaseClient
                .from('user_sessions')
                .update({ is_active: false })
                .eq('user_id', user_id);

              if (invalidateAllError) {
                throw invalidateAllError;
              }

              return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
          }
        }
        break;

      case 'cleanup':
        if (method === 'POST') {
          // Clean up expired sessions
          const { error: cleanupError } = await supabaseClient
            .from('user_sessions')
            .delete()
            .lt('expires_at', new Date().toISOString());

          if (cleanupError) {
            throw cleanupError;
          }

          // Clean up old rate limits
          const { error: rateLimitCleanupError } = await supabaseClient
            .from('rate_limits')
            .delete()
            .lt('window_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

          if (rateLimitCleanupError) {
            throw rateLimitCleanupError;
          }

          return new Response(
            JSON.stringify({ success: true, message: 'Cleanup completed' }),
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

  } catch (error) {
    console.error('Security Management Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});