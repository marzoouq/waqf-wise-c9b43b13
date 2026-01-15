/**
 * Tenant Send OTP Edge Function
 * إرسال رمز OTP للمستأجر عبر رقم الهاتف
 * @version 1.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone } = await req.json();

    if (!phone || phone.length < 9) {
      return new Response(
        JSON.stringify({ error: "رقم الهاتف غير صالح" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // إزالة أي أحرف غير رقمية
    const cleanPhone = phone.replace(/\D/g, "");

    // Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // البحث عن المستأجر برقم الهاتف
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from("tenants")
      .select("id, full_name, phone, email")
      .or(`phone.eq.${cleanPhone},phone.eq.+966${cleanPhone},phone.eq.0${cleanPhone}`)
      .maybeSingle();

    if (tenantError) {
      console.error("Error finding tenant:", tenantError);
      return new Response(
        JSON.stringify({ error: "حدث خطأ أثناء البحث" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tenant) {
      return new Response(
        JSON.stringify({ error: "رقم الهاتف غير مسجل في النظام" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // توليد رمز OTP (6 أرقام)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 دقائق

    // حذف رموز OTP القديمة لنفس المستأجر
    await supabaseAdmin
      .from("tenant_otp_codes")
      .delete()
      .eq("tenant_id", tenant.id);

    // إنشاء رمز OTP جديد
    const { error: otpError } = await supabaseAdmin
      .from("tenant_otp_codes")
      .insert({
        tenant_id: tenant.id,
        phone: cleanPhone,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) {
      console.error("Error creating OTP:", otpError);
      return new Response(
        JSON.stringify({ error: "فشل في إنشاء رمز التحقق" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // في الإنتاج: إرسال SMS عبر خدمة مثل Twilio
    // هنا نعرض الرمز للتطوير فقط
    console.log(`OTP for ${cleanPhone}: ${otpCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "تم إرسال رمز التحقق",
        tenantName: tenant.full_name,
        // للتطوير فقط - يُزال في الإنتاج
        devOtp: Deno.env.get("ENVIRONMENT") === "development" ? otpCode : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in tenant-send-otp:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ في الخادم" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
