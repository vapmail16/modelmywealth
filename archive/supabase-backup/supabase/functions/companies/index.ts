import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-request-id, x-request-time",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[COMPANIES-API] ${step}${detailsStr}`);
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
    const companyId = pathParts[pathParts.length - 1];

    switch (req.method) {
      case "GET": {
        if (companyId && companyId !== "companies") {
          // Get specific company by ID
          logStep("Getting company by ID", { companyId });
          
          const { data: company, error } = await supabaseClient
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .eq('user_id', userId)
            .single();

          if (error) {
            logStep("Error getting company", { error: error.message });
            throw new Error(error.message);
          }

          logStep("Company retrieved successfully", { companyId });
          return new Response(JSON.stringify({ success: true, data: company }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } else {
          // Get all user companies with projects
          logStep("Getting all user companies");
          
          const { data: companies, error } = await supabaseClient
            .from('companies')
            .select(`
              *,
              projects (*)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            logStep("Error getting companies", { error: error.message });
            throw new Error(error.message);
          }

          const companiesWithProjects = companies?.map(company => ({
            ...company,
            projects: company.projects || []
          })) || [];

          logStep("Companies retrieved successfully", { count: companiesWithProjects.length });
          return new Response(JSON.stringify({ success: true, data: companiesWithProjects }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        }
      }

      case "POST": {
        // Create new company
        const body = await req.json();
        logStep("Creating company", { data: body });

        const { data: company, error } = await supabaseClient
          .from('companies')
          .insert({
            ...body,
            user_id: userId
          })
          .select()
          .single();

        if (error) {
          logStep("Error creating company", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Company created successfully", { companyId: company.id });
        return new Response(JSON.stringify({ success: true, data: company }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201,
        });
      }

      case "PUT": {
        // Update company
        if (!companyId || companyId === "companies") {
          throw new Error("Company ID is required for update");
        }

        const body = await req.json();
        logStep("Updating company", { companyId, data: body });

        const { data: company, error } = await supabaseClient
          .from('companies')
          .update(body)
          .eq('id', companyId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) {
          logStep("Error updating company", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Company updated successfully", { companyId });
        return new Response(JSON.stringify({ success: true, data: company }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "DELETE": {
        // Delete company
        if (!companyId || companyId === "companies") {
          throw new Error("Company ID is required for deletion");
        }

        logStep("Deleting company", { companyId });

        const { error } = await supabaseClient
          .from('companies')
          .delete()
          .eq('id', companyId)
          .eq('user_id', userId);

        if (error) {
          logStep("Error deleting company", { error: error.message });
          throw new Error(error.message);
        }

        logStep("Company deleted successfully", { companyId });
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
    logStep("ERROR in companies API", { message: errorMessage });
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});