import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { errors } = await req.json();

    if (!Array.isArray(errors) || errors.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid input: errors array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process batch errors
    const results = await Promise.allSettled(
      errors.map(async (error: any) => {
        return supabase.from('system_error_logs').insert({
          error_type: error.error_type || 'unknown_error',
          error_message: error.error_message || 'No message',
          error_stack: error.error_stack,
          severity: error.severity || 'medium',
          url: error.url || '',
          user_agent: error.user_agent || '',
          user_id: error.user_id,
          additional_data: error.additional_data,
          status: 'new',
        });
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Batch processed: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: errors.length,
        successful,
        failed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in log-batch function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
