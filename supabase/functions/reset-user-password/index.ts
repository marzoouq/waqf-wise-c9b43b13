import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
  RATE_LIMITS
} from '../_shared/rate-limiter.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support / Test Mode
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck || parsed.testMode) {
          console.log('[reset-user-password] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'reset-user-password',
            timestamp: new Date().toISOString(),
            testMode: parsed.testMode || false
          });
        }
      } catch { /* not JSON, continue */ }
    }
    // 🔒 Rate Limiting - 5 محاولات كل 15 دقيقة
    const clientId = getClientIdentifier(req);
    const rateLimitResult = checkRateLimit(clientId, {
      ...RATE_LIMITS.SENSITIVE,
      keyPrefix: 'reset-password'
    });

    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for reset-user-password: ${clientId}`);
      return createRateLimitResponse(rateLimitResult);
    }

    // إنشاء عميل Supabase بصلاحيات Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // الحصول على المستخدم الحالي من JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('غير مصرح', req);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return unauthorizedResponse('غير مصرح', req);
    }

    // التحقق من صلاحيات المستخدم (admin أو nazer فقط)
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
    
    const hasPermission = roles?.some(r => r.role === 'admin' || r.role === 'nazer');
    
    if (!hasPermission) {
      // تسجيل المحاولة غير المصرح بها
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        table_name: 'auth.users',
        severity: 'warning',
        description: 'محاولة غير مصرح بها لإعادة تعيين كلمة مرور',
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP'),
        user_agent: req.headers.get('User-Agent')
      });

      return forbiddenResponse('ليس لديك صلاحية لتنفيذ هذه العملية', req);
    }

    // قراءة البيانات من الطلب
    const { user_id, new_password } = await req.json();

    if (!user_id || !new_password) {
      return errorResponse('البيانات المطلوبة ناقصة', 400, undefined, req);
    }

    if (new_password.length < 8) {
      return errorResponse('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400, undefined, req);
    }

    // تحديث كلمة المرور
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    );

    if (updateError) throw updateError;

    // تسجيل العملية في audit_logs
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, email')
      .eq('user_id', user_id)
      .single();

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action_type: 'PASSWORD_RESET',
      table_name: 'auth.users',
      record_id: user_id,
      description: `تم تعيين كلمة مرور مؤقتة للمستخدم: ${targetProfile?.full_name || user_id}`,
      severity: 'warning',
      ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP'),
      user_agent: req.headers.get('User-Agent')
    });

    // إرسال إشعار للمستخدم المستهدف
    await supabaseAdmin.rpc('create_notification', {
      p_user_id: user_id,
      p_title: 'تم تغيير كلمة المرور',
      p_message: 'تم تعيين كلمة مرور جديدة لحسابك من قبل المسؤول. يرجى تغييرها عند تسجيل الدخول التالي.',
      p_type: 'warning',
      p_action_url: '/settings'
    });

    return jsonResponse({ 
      success: true,
      message: 'تم تحديث كلمة المرور بنجاح'
    }, 200, req);

  } catch (error) {
    console.error('Error in reset-user-password:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500,
      undefined,
      req
    );
  }
});
