/**
 * Test Auth Edge Function
 * 
 * وظيفة للحصول على JWT لمستخدم الاختبار
 * تُستخدم فقط في CI/CD للاختبارات
 * 
 * @security - تقبل فقط بريد @test.local
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('[test-auth] Request received');

  try {
    const { email, password, action } = await req.json();

    // Health check endpoint
    if (action === 'health-check') {
      return new Response(
        JSON.stringify({ 
          status: 'healthy',
          message: 'Test auth function is running',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!email || !password) {
      console.log('[test-auth] Missing email or password');
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Security check: Only allow test users
    const allowedDomains = ['@test.local', '@ci-test.local', '@integration-test.local'];
    const isTestUser = allowedDomains.some(domain => email.endsWith(domain));
    
    if (!isTestUser) {
      console.log(`[test-auth] Rejected non-test email: ${email}`);
      return new Response(
        JSON.stringify({ 
          error: 'Only test users are allowed',
          hint: 'Email must end with @test.local, @ci-test.local, or @integration-test.local'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[test-auth] Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log(`[test-auth] Attempting login for: ${email}`);

    // Sign in the test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`[test-auth] Login failed: ${error.message}`);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          code: error.name || 'AUTH_ERROR'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data.session) {
      console.error('[test-auth] No session returned');
      return new Response(
        JSON.stringify({ error: 'No session created' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[test-auth] Login successful for: ${email}`);

    // Return the JWT token
    return new Response(
      JSON.stringify({ 
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        user_id: data.user?.id,
        email: data.user?.email,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[test-auth] Error: ${errorMessage}`);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        type: 'INTERNAL_ERROR'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
