/**
 * Tenant Verify OTP Edge Function
 * التحقق من رقم العقد وإنشاء جلسة للمستأجر
 * @version 2.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// توليد توكن جلسة آمن
function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp || otp.length < 1) {
      return new Response(
        JSON.stringify({ error: "البيانات غير صالحة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanOtp = otp.trim(); // رقم العقد

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // البحث عن سجل التحقق الصالح
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from("tenant_otp_codes")
      .select("*, tenants(*)")
      .eq("phone", cleanPhone)
      .eq("otp_code", cleanOtp)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (otpError || !otpRecord) {
      // التحقق المباشر من رقم العقد في حالة عدم وجود سجل
      const { data: directContract, error: directError } = await supabaseAdmin
        .from("contracts")
        .select("id, tenant_id, tenants(*)")
        .eq("contract_number", cleanOtp)
        .in("status", ["نشط", "منتهي", "مسودة"]) // قبول جميع الحالات للتجربة
        .maybeSingle();

      if (directError || !directContract) {
        return new Response(
          JSON.stringify({ error: "رقم العقد غير صحيح" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // التحقق من تطابق رقم الهاتف مع المستأجر
      const tenant = directContract.tenants as any;
      const tenantPhone = tenant?.phone?.replace(/\D/g, "") || "";
      
      if (!tenantPhone.includes(cleanPhone) && !cleanPhone.includes(tenantPhone.slice(-9))) {
        return new Response(
          JSON.stringify({ error: "رقم الهاتف لا يتطابق مع العقد" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // إنشاء جلسة جديدة
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

      // حذف الجلسات القديمة
      await supabaseAdmin
        .from("tenant_sessions")
        .delete()
        .eq("tenant_id", directContract.tenant_id);

      // إنشاء جلسة جديدة
      const { error: sessionError } = await supabaseAdmin
        .from("tenant_sessions")
        .insert({
          tenant_id: directContract.tenant_id,
          session_token: sessionToken,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
          user_agent: req.headers.get("user-agent"),
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        console.error("Error creating session:", sessionError);
        return new Response(
          JSON.stringify({ error: "فشل في إنشاء الجلسة" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken,
          expiresAt: expiresAt.toISOString(),
          tenant: {
            id: tenant.id,
            fullName: tenant.full_name,
            phone: tenant.phone,
            email: tenant.email,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تحديث حالة سجل التحقق
    await supabaseAdmin
      .from("tenant_otp_codes")
      .update({ is_used: true, verified_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    // إنشاء جلسة جديدة
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

    // حذف الجلسات القديمة
    await supabaseAdmin
      .from("tenant_sessions")
      .delete()
      .eq("tenant_id", otpRecord.tenant_id);

    // إنشاء جلسة جديدة
    const { error: sessionError } = await supabaseAdmin
      .from("tenant_sessions")
      .insert({
        tenant_id: otpRecord.tenant_id,
        session_token: sessionToken,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "فشل في إنشاء الجلسة" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tenant = otpRecord.tenants;

    return new Response(
      JSON.stringify({
        success: true,
        sessionToken,
        expiresAt: expiresAt.toISOString(),
        tenant: {
          id: tenant.id,
          fullName: tenant.full_name,
          phone: tenant.phone,
          email: tenant.email,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in tenant-verify-otp:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
