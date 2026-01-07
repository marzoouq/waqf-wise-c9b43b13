import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

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
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط
    const bodyText = await req.text();
    let bodyData: Record<string, any> = {};
    
    if (bodyText) {
      try {
        bodyData = JSON.parse(bodyText);
        
        // ✅ Health Check Support / Test Mode
        if (bodyData.ping || bodyData.healthCheck || bodyData.testMode) {
          console.log('[biometric-auth] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'biometric-auth',
            timestamp: new Date().toISOString(),
            testMode: bodyData.testMode || false
          });
        }
      } catch {
        // ليس JSON - تجاهل
      }
    }

    // ✅ استخدام bodyData المحفوظة بدلاً من req.json()
    const { credentialId, userId, challenge } = bodyData;
    
    // ✅ التحقق من وجود المعاملات (تجاوز في وضع الاختبار)
    if (!credentialId || !userId) {
      console.error("Missing required parameters");
      return errorResponse("Missing credentialId or userId", 400);
    }

    // ✅ التحقق من صحة UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error("Invalid userId format:", userId);
      return errorResponse("Invalid userId format - must be a valid UUID", 400);
    }
    
    console.log("Biometric auth request:", { credentialId: credentialId?.substring(0, 20), userId });

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
      
      return rateLimitResponse("تم تجاوز حد المحاولات. يرجى المحاولة بعد 15 دقيقة");
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
      
      return unauthorizedResponse("Invalid credential or user");
    }

    console.log("Credential verified for user:", userId);

    // Get user email from auth.users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user?.email) {
      console.error("User not found:", userError);
      return errorResponse("User not found", 404);
    }

    console.log("User found for biometric auth");

    // Generate a magic link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: userData.user.email,
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("Magic link generation failed:", linkError);
      return errorResponse("Failed to generate authentication token", 500);
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

    return jsonResponse({
      success: true,
      token_hash: linkData.properties.hashed_token,
      email: userData.user.email,
    });
  } catch (error) {
    console.error("Biometric auth error:", error);
    return errorResponse("Internal server error", 500);
  }
});
