import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id, x-request-time",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROJECTS-API] ${step}${detailsStr}`);
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
    const projectId = pathParts[pathParts.length - 1];
    const companyId = url.searchParams.get('company_id');

    switch (req.method) {
      case "GET": {
        if (projectId && projectId !== "projects") {
          // Get specific project by ID
          logStep("Getting project by ID", { projectId });
          
          const { data: project, error } = await supabaseClient
            .from('projects')
            .select(`
              *,
              companies (*)
            `)
            .eq('id', projectId)
            .eq('user_id', userId)
            .single();

          if (error) {
            logStep("Error getting project", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Project retrieved successfully", { projectId });
          return new Response(JSON.stringify({ success: true, data: project }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else if (companyId) {
          // Get projects by company ID
          logStep("Getting projects by company", { companyId });
          
          const { data: projects, error } = await supabaseClient
            .from('projects')
            .select('*')
            .eq('company_id', companyId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            logStep("Error getting projects by company", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Projects by company retrieved successfully", { count: projects?.length || 0 });
          return new Response(JSON.stringify({ success: true, data: projects || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Get all user projects with companies
          logStep("Getting all user projects");
          
          const { data: projects, error } = await supabaseClient
            .from('projects')
            .select(`
              *,
              companies (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            logStep("Error getting all projects", { error: error.message });
            throw new Error(error.message);
          }

          logStep("All projects retrieved successfully", { count: projects?.length || 0 });
          return new Response(JSON.stringify({ success: true, data: projects || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      case "POST": {
        // Create new project
        const body = await req.json();
        logStep("Creating project", { data: body });

        const { data: project, error } = await supabaseClient
          .from('projects')
          .insert({
            ...body,
            user_id: userId
          })
          .select()
          .single();

        if (error) {
          logStep("Error creating project", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Project created successfully", { projectId: project.id });
        return new Response(JSON.stringify({ success: true, data: project }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "PUT": {
        // Update project
        if (!projectId || projectId === "projects") {
          throw new Error("Project ID is required for update");
        }

        const body = await req.json();
        logStep("Updating project", { projectId, data: body });

        const { data: project, error } = await supabaseClient
          .from('projects')
          .update(body)
          .eq('id', projectId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          logStep("Error updating project", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Project updated successfully", { projectId });
        return new Response(JSON.stringify({ success: true, data: project }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "DELETE": {
        // Delete project
        if (!projectId || projectId === "projects") {
          throw new Error("Project ID is required for deletion");
        }

        logStep("Deleting project", { projectId });

        const { error } = await supabaseClient
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', userId);

        if (error) {
          logStep("Error deleting project", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Project deleted successfully", { projectId });
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default: {
        throw new Error(`Method ${req.method} not allowed`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in projects API", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});