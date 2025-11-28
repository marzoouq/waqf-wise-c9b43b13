import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ✅ تقييد المحاولات - إصلاح أمني
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 دقيقة

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record) {
    rateLimitMap.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  // إعادة تعيين بعد فترة الحظر
  if (now - record.lastAttempt > LOCKOUT_DURATION) {
    rateLimitMap.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }
  
  record.count++;
  record.lastAttempt = now;
  return true;
}

function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier);
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credentialId, userId, challenge } = await req.json();
    
    console.log("Biometric auth request:", { credentialId: credentialId?.substring(0, 20), userId });

    if (!credentialId || !userId) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing credentialId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ التحقق من rate limit
    const rateLimitKey = `biometric_${userId}`;
    if (!checkRateLimit(rateLimitKey)) {
      console.error("Rate limit exceeded for user:", userId);
      
      // تسجيل محاولة مشبوهة
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      
      await supabaseAdmin.from('security_events_log').insert({
        event_type: 'biometric_rate_limit_exceeded',
        severity: 'warning',
        user_id: userId,
        description: 'تجاوز حد محاولات المصادقة البيومترية',
        metadata: { credentialId: credentialId?.substring(0, 20) }
      });
      
      return new Response(
        JSON.stringify({ error: "تم تجاوز حد المحاولات. يرجى المحاولة بعد 15 دقيقة" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for user operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify credential exists and belongs to user
    const { data: credential, error: credError } = await supabaseAdmin
      .from("webauthn_credentials")
      .select("user_id, credential_id, public_key")
      .eq("credential_id", credentialId)
      .eq("user_id", userId)
      .single();

    if (credError || !credential) {
      console.error("Credential verification failed:", credError);
      
      // تسجيل محاولة فاشلة
      await supabaseAdmin.from('security_events_log').insert({
        event_type: 'biometric_auth_failed',
        severity: 'warning',
        user_id: userId,
        description: 'فشل التحقق من بيانات المصادقة البيومترية',
        metadata: { credentialId: credentialId?.substring(0, 20) }
      });
      
      return new Response(
        JSON.stringify({ error: "Invalid credential or user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Credential verified for user:", userId);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("User not found:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User found:", userData.user.email);

    // Generate a magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("Magic link generation failed:", linkError);
      return new Response(
        JSON.stringify({ error: "Failed to generate authentication token" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Magic link generated successfully");

    // ✅ إعادة تعيين عداد المحاولات عند النجاح
    resetRateLimit(rateLimitKey);

    // Update last used timestamp
    await supabaseAdmin
      .from("webauthn_credentials")
      .update({ last_used_at: new Date().toISOString() })
      .eq("credential_id", credentialId);

    // ✅ تسجيل نجاح المصادقة
    await supabaseAdmin.from('security_events_log').insert({
      event_type: 'biometric_auth_success',
      severity: 'info',
      user_id: userId,
      description: 'نجاح المصادقة البيومترية',
      resolved: true
    });

    return new Response(
      JSON.stringify({
        success: true,
        token_hash: linkData.properties.hashed_token,
        email: userData.user.email,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Biometric auth error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
