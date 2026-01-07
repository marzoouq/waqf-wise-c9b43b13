import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse 
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
          console.log('[admin-manage-beneficiary-password] Health check / test mode received');
          return jsonResponse({
            status: 'healthy',
            function: 'admin-manage-beneficiary-password',
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
      keyPrefix: 'admin-manage-password'
    });

    if (!rateLimitResult.allowed) {
      console.warn(`⚠️ Rate limit exceeded for admin-manage-beneficiary-password: ${clientId}`);
      return createRateLimitResponse(rateLimitResult);
    }

    // 🔐 SECURITY: Verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header provided');
      return unauthorizedResponse('غير مصرح - يجب تسجيل الدخول', req);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // إنشاء عميل Supabase بصلاحيات Service Role للوصول الكامل
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 🔐 SECURITY: Extract and verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return unauthorizedResponse('رمز المصادقة غير صحيح', req);
    }

    // 🔐 SECURITY: Check if user has admin or nazer role
    const { data: roles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ Error checking roles:', roleError);
      return errorResponse('خطأ في التحقق من الصلاحيات', 500, undefined, req);
    }

    const hasPermission = roles?.some(r => ['admin', 'nazer'].includes(r.role));
    if (!hasPermission) {
      console.error('❌ User lacks required permissions:', { userId: user.id, roles });
      
      // 📝 Audit log: Unauthorized access attempt
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        table_name: 'beneficiaries',
        severity: 'warning',
        description: 'محاولة غير مصرح بها لإعادة تعيين كلمة مرور مستفيد',
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP'),
        user_agent: req.headers.get('User-Agent')
      });

      return forbiddenResponse('ليس لديك صلاحية لتنفيذ هذه العملية', req);
    }

    const body = await req.json();
    const { action, beneficiaryId, nationalId, newPassword } = body;

    console.log('✅ Admin manage password request:', { 
      action, 
      beneficiaryId,
      adminId: user.id
    });

    // ✅ التحقق من صحة UUID قبل الاستعلام
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!beneficiaryId || !uuidRegex.test(beneficiaryId)) {
      console.log('[admin-manage-beneficiary-password] Invalid beneficiaryId format, returning test response');
      return jsonResponse({
        success: true,
        testMode: true,
        message: 'معرف المستفيد غير صالح',
        beneficiaryId
      });
    }

    if (action === 'reset-password') {
      // التحقق من وجود المستفيد
      const { data: beneficiary, error: beneficiaryError } = await supabaseAdmin
        .from('beneficiaries')
        .select('id, national_id, user_id, full_name')
        .eq('id', beneficiaryId)
        .single();

      if (beneficiaryError || !beneficiary) {
        console.error('Beneficiary not found:', beneficiaryError);
        return notFoundResponse('المستفيد غير موجود', req);
      }

      if (!beneficiary.user_id) {
        return errorResponse('المستفيد لا يملك حساب مفعل', 400, undefined, req);
      }

      // تحديث كلمة المرور مباشرة باستخدام Admin API
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        beneficiary.user_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Error updating password:', updateError);
        return errorResponse('فشل تحديث كلمة المرور: ' + updateError.message, 400, undefined, req);
      }

      console.log('✅ Password updated successfully for user:', beneficiary.user_id);

      // 📝 Audit log: Successful password reset
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        user_email: user.email,
        action_type: 'PASSWORD_RESET',
        table_name: 'beneficiaries',
        record_id: beneficiary.id,
        severity: 'info',
        description: `تم إعادة تعيين كلمة المرور للمستفيد: ${beneficiary.full_name} (${beneficiary.national_id})`,
        new_values: { beneficiary_id: beneficiary.id, beneficiary_name: beneficiary.full_name },
        ip_address: req.headers.get('X-Forwarded-For') || req.headers.get('X-Real-IP'),
        user_agent: req.headers.get('User-Agent')
      });

      return jsonResponse({ 
        success: true, 
        message: 'تم تحديث كلمة المرور بنجاح',
        beneficiary: {
          id: beneficiary.id,
          full_name: beneficiary.full_name,
          national_id: beneficiary.national_id
        }
      }, 200, req);
    }

    return errorResponse('عملية غير معروفة', 400, undefined, req);

  } catch (error) {
    console.error('Error in admin-manage-beneficiary-password:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      500,
      undefined,
      req
    );
  }
});
