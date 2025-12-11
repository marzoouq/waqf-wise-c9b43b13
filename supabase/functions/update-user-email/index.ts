import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
      return unauthorizedResponse("غير مصرح");
    }

    // إنشاء عميل للتحقق من المستخدم الحالي
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: currentUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !currentUser) {
      console.error("Auth error:", authError);
      return unauthorizedResponse("غير مصرح - يرجى تسجيل الدخول");
    }

    // التحقق من صلاحيات المستخدم الحالي
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id);

    if (rolesError) {
      console.error("Roles error:", rolesError);
      return errorResponse("خطأ في التحقق من الصلاحيات", 500);
    }

    const allowedRoles = ["nazer", "admin"];
    const hasPermission = userRoles?.some((r) => allowedRoles.includes(r.role));

    if (!hasPermission) {
      return forbiddenResponse("ليس لديك صلاحية تعديل البريد الإلكتروني");
    }

    // قراءة البيانات من الطلب
    const { userId, newEmail } = await req.json();

    if (!userId || !newEmail) {
      return errorResponse("البيانات المطلوبة غير مكتملة", 400);
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return errorResponse("البريد الإلكتروني غير صحيح", 400);
    }

    // التحقق من عدم وجود البريد الإلكتروني مسبقاً
    const { data: existingUser } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", newEmail.toLowerCase())
      .neq("user_id", userId)
      .maybeSingle();

    if (existingUser) {
      return errorResponse("البريد الإلكتروني مستخدم بالفعل", 400);
    }

    console.log(`Updating email for user ${userId} to ${newEmail}`);

    // تحديث البريد في auth.users
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email: newEmail.toLowerCase() }
    );

    if (authUpdateError) {
      console.error("Auth update error:", authUpdateError);
      return errorResponse(`خطأ في تحديث البريد: ${authUpdateError.message}`, 500);
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
      return errorResponse(`خطأ في تحديث الملف الشخصي: ${profileUpdateError.message}`, 500);
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

    return jsonResponse({ success: true, message: "تم تحديث البريد الإلكتروني بنجاح" });
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse("حدث خطأ غير متوقع", 500);
  }
});
