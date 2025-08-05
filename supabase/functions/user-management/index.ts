import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id, x-request-time",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[USER-MANAGEMENT-API] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client with service role for bypassing RLS
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started", { method: req.method, url: req.url });

    // Authenticate user using anon key client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;
    logStep("User authenticated", { userId });

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts[pathParts.length - 1];

    switch (req.method) {
      case "GET": {
        if (endpoint === "users") {
          // Get all users
          const userType = url.searchParams.get('user_type');
          logStep("Getting users", { userType });
          
          let query = supabaseClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

          if (userType) {
            query = query.eq('user_type', userType);
          }

          const { data: users, error } = await query;

          if (error) {
            logStep("Error getting users", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Users retrieved successfully", { count: users?.length || 0 });
          return new Response(JSON.stringify({ success: true, data: users || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (endpoint === "roles") {
          // Get user roles
          const targetUserId = url.searchParams.get('user_id');
          if (!targetUserId) {
            throw new Error("User ID is required");
          }

          logStep("Getting user roles", { targetUserId });
          
          const { data: roles, error } = await supabaseClient
            .from('user_roles')
            .select('*')
            .eq('user_id', targetUserId);

          if (error) {
            logStep("Error getting user roles", { error: error.message });
            throw new Error(error.message);
          }

          logStep("User roles retrieved successfully", { count: roles?.length || 0 });
          return new Response(JSON.stringify({ success: true, data: roles || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (endpoint === "role-capabilities") {
          // Get all role capabilities
          logStep("Getting role capabilities");
          
          const { data: capabilities, error } = await supabaseClient
            .from('role_capabilities')
            .select('*')
            .order('role', { ascending: true });

          if (error) {
            logStep("Error getting role capabilities", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Role capabilities retrieved successfully", { count: capabilities?.length || 0 });
          return new Response(JSON.stringify({ success: true, data: capabilities || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (endpoint === "capabilities") {
          // Check user capability
          const capability = url.searchParams.get('capability');
          if (!capability) {
            throw new Error("Capability is required");
          }

          logStep("Checking user capability", { userId, capability });
          
          const { data, error } = await supabaseClient
            .rpc('user_has_capability', {
              _user_id: userId,
              _capability: capability
            });

          if (error) {
            logStep("Error checking capability", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Capability check completed", { hasCapability: data });
          return new Response(JSON.stringify({ success: true, data: data || false }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (pathParts.length >= 2 && pathParts[pathParts.length - 2] === "users") {
          // Get individual user by ID
          const targetUserId = pathParts[pathParts.length - 1];
          logStep("Getting individual user", { targetUserId });
          
          const { data: user, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', targetUserId)
            .single();

          if (error) {
            logStep("Error getting user", { error: error.message });
            throw new Error(error.message);
          }

          logStep("User retrieved successfully", { user });
          return new Response(JSON.stringify({ success: true, data: user }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        break;
      }

      case "POST": {
        if (endpoint === "users") {
          // Create user profile
          const body = await req.json();
          const { user_id, email, full_name, user_type } = body;
          
          if (!user_id || !email || !full_name || !user_type) {
            throw new Error("user_id, email, full_name, and user_type are required");
          }

          logStep("Creating user profile", { user_id, email, full_name, user_type });

          const { data: profile, error } = await supabaseClient
            .from('profiles')
            .insert({
              user_id,
              email,
              full_name,
              user_type
            })
            .select()
            .single();

          if (error) {
            logStep("Error creating user profile", { error: error.message });
            throw new Error(error.message);
          }

          logStep("User profile created successfully", { profile });
          return new Response(JSON.stringify({ success: true, data: profile }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201,
          });
        } else if (endpoint === "assign-role") {
          // Assign role to user
          const body = await req.json();
          const { user_id, role, user_type } = body;
          
          if (!user_id || !role || !user_type) {
            throw new Error("user_id, role, and user_type are required");
          }

          logStep("Assigning role to user", { user_id, role, user_type });

          const { data: userRole, error } = await supabaseClient
            .from('user_roles')
            .insert({
              user_id,
              role,
              user_type
            })
            .select()
            .single();

          if (error) {
            logStep("Error assigning role", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Role assigned successfully", { userRole });
          return new Response(JSON.stringify({ success: true, data: userRole }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 201,
          });
        } else if (endpoint === "remove-role") {
          // Remove role from user
          const body = await req.json();
          const { user_id, role, user_type } = body;
          
          if (!user_id || !role || !user_type) {
            throw new Error("user_id, role, and user_type are required");
          }

          logStep("Removing role from user", { user_id, role, user_type });

          const { error } = await supabaseClient
            .from('user_roles')
            .delete()
            .eq('user_id', user_id)
            .eq('role', role)
            .eq('user_type', user_type);

          if (error) {
            logStep("Error removing role", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Role removed successfully");
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
        break;
      }

      default: {
        throw new Error(`Method ${req.method} not allowed`);
      }
    }

    throw new Error("Invalid endpoint");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in user management API", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});