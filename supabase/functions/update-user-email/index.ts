import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // إنشاء عميل Supabase مع service role للوصول الإداري
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // التحقق من المستخدم الحالي
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "غير مصرح" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // إنشاء عميل للتحقق من المستخدم الحالي
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !currentUser) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "غير مصرح - يرجى تسجيل الدخول" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // التحقق من صلاحيات المستخدم الحالي
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (rolesError) {
      console.error("Roles error:", rolesError);
      return new Response(
        JSON.stringify({ error: "خطأ في التحقق من الصلاحيات" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedRoles = ["nazer", "admin"];
    const hasPermission = userRoles?.some((r) => allowedRoles.includes(r.role));

    if (!hasPermission) {
      return new Response(
        JSON.stringify({ error: "ليس لديك صلاحية تعديل البريد الإلكتروني" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // قراءة البيانات من الطلب
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return new Response(
        JSON.stringify({ error: "البيانات المطلوبة غير مكتملة" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return new Response(
        JSON.stringify({ error: "البريد الإلكتروني غير صحيح" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", newEmail.toLowerCase())
      .neq("user_id", userId)
      .single();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "البريد الإلكتروني مستخدم بالفعل" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Updating email for user ${userId} to ${newEmail}`);

    // تحديث البريد في auth.users
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail.toLowerCase() }
    );

    if (authUpdateError) {
      console.error("Auth update error:", authUpdateError);
      return new Response(
        JSON.stringify({ error: `خطأ في تحديث البريد: ${authUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تحديث البريد في profiles
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .update({ 
        email: newEmail.toLowerCase(),
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (profileUpdateError) {
      console.error("Profile update error:", profileUpdateError);
      // محاولة التراجع عن تحديث auth.users
      // لكن هذا قد لا يكون ممكناً، لذا نسجل الخطأ فقط
      return new Response(
        JSON.stringify({ error: `خطأ في تحديث الملف الشخصي: ${profileUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // تسجيل العملية في سجل المراجعة
    await supabaseAdmin.from("audit_logs").insert({
      action_type: "UPDATE_USER_EMAIL",
      user_id: currentUser.id,
      user_email: currentUser.email,
      record_id: userId,
      table_name: "profiles",
      description: `تم تحديث البريد الإلكتروني للمستخدم ${userId} إلى ${newEmail}`,
      new_values: { email: newEmail },
      severity: "info",
    });

    console.log(`Successfully updated email for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "تم تحديث البريد الإلكتروني بنجاح" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ غير متوقع" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
