import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  jsonResponse, 
  errorResponse 
} from '../_shared/cors.ts';

// ============ Rate Limiting - 5 تشغيلات/ساعة لكل مستخدم ============
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

/**
 * Unified Daily Notifications System
 * نظام الإشعارات اليومية الموحد
 * 
 * يشمل جميع أنواع الإشعارات والمهام الدورية:
 * - إشعارات الفواتير المتأخرة
 * - إشعارات الأقساط المتأخرة
 * - إشعارات العقود المنتهية
 * - إشعارات دفعات الإيجار المستحقة
 * - تحديث حالة الأقساط المتأخرة
 * - تحديث حالة الطلبات المتأخرة
 * - تحديث التقارير المالية
 * - تنظيف الإشعارات القديمة
 */
serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[daily-notifications] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'daily-notifications',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // 🔐 التحقق من المصادقة - يدعم طريقتين:
    // 1. JWT token للاستدعاء من التطبيق
    // 2. CRON_SECRET للاستدعاء من المهام المجدولة
    const authHeader = req.headers.get('Authorization');
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // التحقق من صحة الاستدعاء
    let isAuthorized = false;
    let authMethod = '';

    // طريقة 1: التحقق من CRON_SECRET للمهام المجدولة
    if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
      isAuthorized = true;
      authMethod = 'cron_secret';
      console.log('[daily-notifications] ✅ Authorized via CRON_SECRET');
    }
    // طريقة 2: التحقق من JWT token
    else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (!authError && user) {
        // التحقق من صلاحيات المستخدم (admin أو nazer فقط)
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        const hasAccess = roles?.some(r => ['admin', 'nazer'].includes(r.role));
        if (hasAccess) {
          isAuthorized = true;
          authMethod = 'jwt';
          
          // ✅ Rate Limiting للمستخدمين (ليس للمهام المجدولة)
          if (!checkRateLimit(user.id)) {
            console.warn(`[daily-notifications] Rate limit exceeded for user: ${user.id}`);
            return errorResponse('تجاوزت الحد المسموح (5 تشغيلات/ساعة). يرجى الانتظار.', 429);
          }
          
          console.log('[daily-notifications] ✅ Authorized via JWT:', { userId: user.id });
        }
      }
    }

    // رفض الاستدعاء غير المصرح
    if (!isAuthorized) {
      console.error('[daily-notifications] ❌ Unauthorized access attempt');
      return errorResponse('غير مصرح - يجب تسجيل الدخول كمسؤول أو استخدام CRON_SECRET', 401);
    }

    console.log(`🚀 بدء تشغيل نظام الإشعارات اليومية الموحد... (auth: ${authMethod})`);

    const results = {
      invoices: false,
      installments: false,
      contracts: false,
      rentals: false,
      overdueRequests: false,
      overdueInstallments: false,
      reports: false,
      cleanup: false,
      deletedNotifications: 0
    };

    // 1. إرسال إشعارات الفواتير المتأخرة
    console.log('📧 إرسال إشعارات الفواتير المتأخرة...');
    try {
      const { error: invoicesError } = await supabase.rpc('notify_overdue_invoices');
      
      if (invoicesError) {
        console.error('❌ خطأ في إرسال إشعارات الفواتير:', invoicesError);
      } else {
        console.log('✅ تم إرسال إشعارات الفواتير المتأخرة');
        results.invoices = true;
      }
    } catch (err) {
      console.error('💥 استثناء في إرسال إشعارات الفواتير:', err);
    }

    // 2. إرسال إشعارات الأقساط المتأخرة
    console.log('💰 إرسال إشعارات الأقساط المتأخرة...');
    try {
      const { error: installmentsError } = await supabase.rpc('notify_overdue_loan_installments');
      
      if (installmentsError) {
        console.error('❌ خطأ في إرسال إشعارات الأقساط:', installmentsError);
      } else {
        console.log('✅ تم إرسال إشعارات الأقساط المتأخرة');
        results.installments = true;
      }
    } catch (err) {
      console.error('💥 استثناء في إرسال إشعارات الأقساط:', err);
    }

    // 3. إرسال إشعارات العقود القريبة من الانتهاء
    console.log('📄 إرسال إشعارات العقود القريبة من الانتهاء...');
    try {
      const { error: contractsError } = await supabase.rpc('notify_contract_expiring');
      
      if (contractsError) {
        console.error('❌ خطأ في إرسال إشعارات العقود:', contractsError);
      } else {
        console.log('✅ تم إرسال إشعارات العقود');
        results.contracts = true;
      }
    } catch (err) {
      console.error('💥 استثناء في إرسال إشعارات العقود:', err);
    }

    // 4. إرسال إشعارات دفعات الإيجار المستحقة
    console.log('🏠 إرسال إشعارات دفعات الإيجار...');
    try {
      const { error: rentalsError } = await supabase.rpc('notify_rental_payment_due');
      
      if (rentalsError) {
        console.error('❌ خطأ في إرسال إشعارات الإيجارات:', rentalsError);
      } else {
        console.log('✅ تم إرسال إشعارات الإيجارات');
        results.rentals = true;
      }
    } catch (err) {
      console.error('💥 استثناء في إرسال إشعارات الإيجارات:', err);
    }

    // 5. تحديث حالة الأقساط المتأخرة
    console.log('🔄 تحديث حالة الأقساط المتأخرة...');
    try {
      const { error: updateError } = await supabase.rpc('update_overdue_installments');
      
      if (updateError) {
        console.error('❌ خطأ في تحديث الأقساط:', updateError);
      } else {
        console.log('✅ تم تحديث حالة الأقساط');
        results.overdueInstallments = true;
      }
    } catch (err) {
      console.error('💥 استثناء في تحديث الأقساط:', err);
    }

    // 6. تحديث حالة الطلبات المتأخرة
    console.log('📝 تحديث حالة الطلبات المتأخرة...');
    try {
      const { error: requestsError } = await supabase.rpc('check_overdue_requests');
      
      if (requestsError) {
        console.error('❌ خطأ في تحديث الطلبات:', requestsError);
      } else {
        console.log('✅ تم تحديث حالة الطلبات');
        results.overdueRequests = true;
      }
    } catch (err) {
      console.error('💥 استثناء في تحديث الطلبات:', err);
    }

    // 7. تحديث Materialized Views للتقارير
    console.log('📊 تحديث التقارير المالية...');
    try {
      const { error: viewsError } = await supabase.rpc('refresh_financial_views');
      
      if (viewsError) {
        console.error('❌ خطأ في تحديث التقارير:', viewsError);
      } else {
        console.log('✅ تم تحديث التقارير المالية');
        results.reports = true;
      }
    } catch (err) {
      console.error('💥 استثناء في تحديث التقارير:', err);
    }

    // 8. تنظيف الإشعارات القديمة
    console.log('🧹 تنظيف الإشعارات القديمة...');
    try {
      const { data: deletedCount, error: cleanupError } = await supabase.rpc('archive_old_notifications');
      
      if (cleanupError) {
        console.error('❌ خطأ في التنظيف:', cleanupError);
      } else {
        console.log(`✅ تم حذف ${deletedCount || 0} إشعار قديم`);
        results.cleanup = true;
        results.deletedNotifications = deletedCount || 0;
      }
    } catch (err) {
      console.error('💥 استثناء في التنظيف:', err);
    }

    console.log('🎉 اكتمل تشغيل نظام الإشعارات اليومية الموحد');

    return jsonResponse({
      success: true,
      message: 'تم تنفيذ جميع المهام اليومية',
      results: results,
      summary: {
        successful: Object.values(results).filter(v => v === true).length,
        failed: Object.values(results).filter(v => v === false).length - 1, // -1 for deletedNotifications
        total: 8
      }
    });

  } catch (error) {
    console.error('💥 خطأ عام في نظام الإشعارات:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'خطأ غير معروف',
      500
    );
  }
});