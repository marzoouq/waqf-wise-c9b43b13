import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_USER = 5;      // 5 طلبات/ساعة للمستخدمين
const RATE_LIMIT_CRON = 2;      // 2 طلبات/ساعة للمهام المجدولة
const RATE_WINDOW = 60 * 60 * 1000; // ساعة واحدة

function checkRateLimit(identifier: string, limit: number): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: limit - 1, resetIn: RATE_WINDOW };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: limit - record.count, resetIn: record.resetTime - now };
}

// ============ Input Validation ============
function validateDaysBeforeExpiry(value: unknown): { valid: boolean; value: number; error?: string } {
  // القيمة الافتراضية
  if (value === undefined || value === null) {
    return { valid: true, value: 30 };
  }
  
  const numValue = Number(value);
  
  if (isNaN(numValue)) {
    return { valid: false, value: 0, error: 'daysBeforeExpiry يجب أن يكون رقماً' };
  }
  
  if (!Number.isInteger(numValue)) {
    return { valid: false, value: 0, error: 'daysBeforeExpiry يجب أن يكون عدداً صحيحاً' };
  }
  
  if (numValue < 1) {
    return { valid: false, value: 0, error: 'daysBeforeExpiry يجب أن يكون 1 على الأقل' };
  }
  
  if (numValue > 365) {
    return { valid: false, value: 0, error: 'daysBeforeExpiry يجب أن يكون 365 كحد أقصى' };
  }
  
  return { valid: true, value: numValue };
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط
    const bodyText = await req.text();
    let bodyData: Record<string, unknown> = {};
    
    if (bodyText) {
      try {
        bodyData = JSON.parse(bodyText);
        
        // ✅ Health Check Support
        if (bodyData.ping || bodyData.healthCheck) {
          console.log('[contract-renewal-alerts] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'contract-renewal-alerts',
            timestamp: new Date().toISOString()
          });
        }
      } catch {
        // ليس JSON - تجاهل
      }
    }

    // ============ المصادقة والتفويض ============
    let isAuthorized = false;
    let authMethod: 'cron' | 'jwt' | null = null;
    let authorizedUserId: string | null = null;

    // 1️⃣ فحص CRON_SECRET للمهام المجدولة
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
      isAuthorized = true;
      authMethod = 'cron';
      console.log('[contract-renewal-alerts] ✅ Authorized via CRON_SECRET');
      
      // Rate limiting للمهام المجدولة
      const rateLimitResult = checkRateLimit('cron_contract_alerts', RATE_LIMIT_CRON);
      if (!rateLimitResult.allowed) {
        console.warn('[contract-renewal-alerts] Rate limit exceeded for CRON');
        return errorResponse(`تجاوز الحد المسموح للمهام المجدولة. يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 60000)} دقيقة.`, 429);
      }
    }

    // 2️⃣ فحص JWT للمستخدمين (إذا لم يكن CRON)
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn('[contract-renewal-alerts] ❌ No authentication provided');
        return unauthorizedResponse('المصادقة مطلوبة - يرجى تسجيل الدخول');
      }

      const token = authHeader.replace('Bearer ', '');
      
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.warn('[contract-renewal-alerts] ❌ Invalid token:', authError?.message);
        return unauthorizedResponse('جلسة غير صالحة - يرجى إعادة تسجيل الدخول');
      }

      // فحص الصلاحيات - admin/nazer فقط
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: roles, error: rolesError } = await supabaseService
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('[contract-renewal-alerts] Error fetching roles:', rolesError);
        return errorResponse('خطأ في التحقق من الصلاحيات', 500);
      }

      const allowedRoles = ['admin', 'nazer'];
      const hasAccess = roles?.some(r => allowedRoles.includes(r.role));

      if (!hasAccess) {
        console.warn(`[contract-renewal-alerts] ❌ Forbidden - User ${user.id} lacks required role (has: ${roles?.map(r => r.role).join(', ') || 'none'})`);
        return forbiddenResponse('ليس لديك صلاحية لتشغيل هذه الوظيفة - يتطلب صلاحية مدير أو ناظر');
      }

      isAuthorized = true;
      authMethod = 'jwt';
      authorizedUserId = user.id;
      console.log(`[contract-renewal-alerts] ✅ Authorized via JWT - User: ${user.id}, Roles: ${roles?.map(r => r.role).join(', ')}`);

      // Rate limiting للمستخدمين
      const rateLimitResult = checkRateLimit(`user_${user.id}`, RATE_LIMIT_USER);
      if (!rateLimitResult.allowed) {
        console.warn(`[contract-renewal-alerts] Rate limit exceeded for user: ${user.id}`);
        return errorResponse(`تجاوزت الحد المسموح (${RATE_LIMIT_USER} طلبات/ساعة). يرجى الانتظار ${Math.ceil(rateLimitResult.resetIn / 60000)} دقيقة.`, 429);
      }
    }

    // تأكيد المصادقة
    if (!isAuthorized) {
      console.error('[contract-renewal-alerts] ❌ Authorization failed unexpectedly');
      return unauthorizedResponse('فشل في المصادقة');
    }

    // ============ إنشاء Supabase Client ============
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // ============ التحقق من المدخلات ============
    const daysValidation = validateDaysBeforeExpiry(bodyData.daysBeforeExpiry);
    if (!daysValidation.valid) {
      console.warn(`[contract-renewal-alerts] Invalid input: ${daysValidation.error}`);
      return errorResponse(daysValidation.error!, 400);
    }
    const daysBeforeExpiry = daysValidation.value;

    console.log(`[contract-renewal-alerts] Checking contracts expiring in ${daysBeforeExpiry} days... (auth: ${authMethod})`);

    // حساب تاريخ انتهاء الصلاحية
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);

    // جلب العقود المنتهية قريباً
    const { data: expiringContracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        contract_number,
        start_date,
        end_date,
        monthly_rent,
        status,
        tenant_name,
        property_id,
        properties (
          name,
          type,
          location
        )
      `)
      .eq('status', 'active')
      .lte('end_date', expiryDate.toISOString().split('T')[0])
      .gte('end_date', today.toISOString().split('T')[0])
      .order('end_date', { ascending: true });

    if (contractsError) {
      console.error('[contract-renewal-alerts] Error fetching contracts:', contractsError);
      return errorResponse('فشل في جلب العقود', 500);
    }

    console.log(`[contract-renewal-alerts] Found ${expiringContracts?.length || 0} contracts expiring soon`);

    const alerts: Array<{
      contractId: string;
      contractNumber: string;
      tenantName: string;
      propertyName: string;
      endDate: string;
      daysRemaining: number;
      alertSent: boolean;
    }> = [];

    for (const contract of expiringContracts || []) {
      const endDate = new Date(contract.end_date);
      const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // التحقق من عدم إرسال تنبيه مسبقاً لهذا العقد
      const { data: existingAlert } = await supabase
        .from('notifications')
        .select('id')
        .eq('reference_type', 'contract_expiry')
        .eq('reference_id', contract.id)
        .gte('created_at', new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .maybeSingle();

      if (!existingAlert) {
        // جلب المسؤولين (admin/nazer) لإرسال الإشعارات
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'nazer']);

        // إنشاء تنبيه جديد
        const alertTitle = daysRemaining <= 7 
          ? `⚠️ عقد ينتهي خلال ${daysRemaining} يوم!`
          : `📅 تنبيه: عقد ينتهي خلال ${daysRemaining} يوم`;

        const props = contract.properties as { name?: string; type?: string; location?: string }[] | { name?: string; type?: string; location?: string } | null;
        const propertyName = Array.isArray(props) ? props[0]?.name : props?.name;
        
        const alertMessage = `
العقد رقم: ${contract.contract_number}
المستأجر: ${contract.tenant_name}
العقار: ${propertyName || 'غير محدد'}
تاريخ الانتهاء: ${contract.end_date}
الإيجار الشهري: ${contract.monthly_rent?.toLocaleString('ar-SA')} ريال
        `.trim();

        // إرسال إشعار لكل مسؤول (admin/nazer)
        let alertSentSuccessfully = false;
        for (const admin of admins || []) {
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              user_id: admin.user_id,
              title: alertTitle,
              message: alertMessage,
              type: daysRemaining <= 7 ? 'warning' : 'info',
              priority: daysRemaining <= 7 ? 'high' : 'medium',
              reference_type: 'contract_expiry',
              reference_id: contract.id,
              is_read: false
            });
          
          if (!notifError) alertSentSuccessfully = true;
        }

        // إضافة تنبيه ذكي (لا يحتاج user_id)
        await supabase
          .from('smart_alerts')
          .insert({
            title: alertTitle,
            description: alertMessage,
            alert_type: 'contract_expiry',
            severity: daysRemaining <= 7 ? 'critical' : 'warning',
            data: {
              contract_id: contract.id,
              contract_number: contract.contract_number,
              end_date: contract.end_date,
              days_remaining: daysRemaining,
              tenant_name: contract.tenant_name,
              monthly_rent: contract.monthly_rent
            },
            is_dismissed: false
          });

        alerts.push({
          contractId: contract.id,
          contractNumber: contract.contract_number,
          tenantName: contract.tenant_name,
          propertyName: propertyName || 'غير محدد',
          endDate: contract.end_date,
          daysRemaining,
          alertSent: alertSentSuccessfully
        });

        console.log(`[contract-renewal-alerts] Alert created for contract ${contract.contract_number}, notified ${admins?.length || 0} admins`);
      }
    }

    // تسجيل في سجل العمليات
    await supabase
      .from('audit_logs')
      .insert({
        action_type: 'contract_renewal_check',
        user_id: authorizedUserId,
        description: `تم فحص العقود المنتهية: ${expiringContracts?.length || 0} عقد، إرسال ${alerts.length} تنبيه (${authMethod})`,
        new_values: {
          total_checked: expiringContracts?.length || 0,
          alerts_sent: alerts.length,
          days_before_expiry: daysBeforeExpiry,
          auth_method: authMethod
        }
      });

    console.log(`[contract-renewal-alerts] ✅ Completed - ${alerts.length} alerts sent`);

    return jsonResponse({
      success: true,
      summary: {
        totalExpiringContracts: expiringContracts?.length || 0,
        alertsSent: alerts.length,
        daysBeforeExpiry,
        authMethod
      },
      alerts
    });

  } catch (error) {
    console.error('[contract-renewal-alerts] Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ في فحص العقود',
      500
    );
  }
});
