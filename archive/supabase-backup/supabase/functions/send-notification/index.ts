import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailJSPayload {
  service_id: string;
  template_id: string;
  user_id: string;
  template_params: Record<string, any>;
}

interface NotificationRequest {
  type: string;
  recipient_email: string;
  template_id?: string;
  template_params: Record<string, any>;
  subject?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing notification request...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get EmailJS configuration
    const emailjsServiceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const emailjsUserId = Deno.env.get('EMAILJS_USER_ID');
    const emailjsTemplateId = Deno.env.get('EMAILJS_TEMPLATE_ID');

    if (!emailjsServiceId || !emailjsUserId || !emailjsTemplateId) {
      console.error('EmailJS configuration missing');
      return new Response(
        JSON.stringify({ success: false, error: 'EmailJS configuration not found' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, recipient_email, template_params, subject }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to ${recipient_email}`);

    // Get user ID from auth context or from email lookup
    const authHeader = req.headers.get('Authorization');
    let userId = null;

    if (authHeader) {
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(jwt);
      userId = user?.id;
    }

    // If no user ID from auth, try to find user by email
    if (!userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', recipient_email)
        .single();
      
      userId = profile?.user_id;
    }

    // Prepare EmailJS payload
    const emailjsPayload: EmailJSPayload = {
      service_id: emailjsServiceId,
      template_id: template_params.template_id || emailjsTemplateId,
      user_id: emailjsUserId,
      template_params: {
        to_email: recipient_email,
        subject: subject || 'Notification from FinancialFlow Analytics',
        ...template_params
      }
    };

    console.log('Sending email via EmailJS...');

    // Send email via EmailJS API
    const emailjsResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailjsPayload)
    });

    const emailjsResult = await emailjsResponse.text();
    const success = emailjsResponse.ok;

    console.log(`EmailJS response: ${emailjsResponse.status} - ${emailjsResult}`);

    // Log notification attempt to database
    const notificationData = {
      user_id: userId,
      type,
      status: success ? 'sent' : 'failed',
      template_id: template_params.template_id || emailjsTemplateId,
      recipient_email,
      subject,
      template_params,
      error_message: success ? null : emailjsResult
    };

    const { data: notification, error: dbError } = await supabase
      .from('notification_history')
      .insert(notificationData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
    }

    if (!success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to send email: ${emailjsResult}`,
          notification_id: notification?.id
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Notification sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification_id: notification?.id,
        message: 'Notification sent successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-notification function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);