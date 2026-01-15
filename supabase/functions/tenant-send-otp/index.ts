/**
 * Tenant Send OTP Edge Function
 * التحقق من المستأجر وإرجاع معلومات للتحقق برقم العقد
 * @version 2.0.0
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

    // التحقق من وجود عقد للمستأجر
    const { data: contracts, error: contractError } = await supabaseAdmin
      .from("contracts")
      .select("id, contract_number, status")
      .eq("tenant_id", tenant.id)
      .in("status", ["نشط", "منتهي", "مسودة"]) // قبول جميع الحالات للتجربة
      .limit(1);

    if (contractError) {
      console.error("Error finding contracts:", contractError);
      return new Response(
        JSON.stringify({ error: "حدث خطأ أثناء البحث عن العقود" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!contracts || contracts.length === 0) {
      return new Response(
        JSON.stringify({ error: "لا يوجد عقد نشط مرتبط بهذا الرقم" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // حفظ بيانات التحقق مؤقتاً
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 دقائق

    // حذف رموز OTP القديمة لنفس المستأجر
    await supabaseAdmin
      .from("tenant_otp_codes")
      .delete()
      .eq("tenant_id", tenant.id);

    // إنشاء سجل تحقق جديد (نستخدم رقم العقد كرمز)
    const { error: otpError } = await supabaseAdmin
      .from("tenant_otp_codes")
      .insert({
        tenant_id: tenant.id,
        phone: cleanPhone,
        otp_code: contracts[0].contract_number, // رقم العقد كرمز تحقق
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) {
      console.error("Error creating verification record:", otpError);
      return new Response(
        JSON.stringify({ error: "فشل في إنشاء سجل التحقق" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "يرجى إدخال رقم العقد للتحقق",
        tenantName: tenant.full_name,
        verificationMethod: "contract_number",
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
