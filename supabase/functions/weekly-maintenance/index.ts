/**
 * Edge Function للصيانة الأسبوعية الشاملة
 * Comprehensive Weekly Maintenance Edge Function
 * 
 * ✅ محمي بـ: CRON_SECRET + JWT + Role Check (admin) + Rate Limiting
 */

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
const RATE_LIMIT_CRON = 2;  // 2 تشغيلات/أسبوع للمهام المجدولة
const RATE_LIMIT_USER = 1;  // 1 تشغيل/أسبوع للمستخدمين
const RATE_WINDOW = 7 * 24 * 60 * 60 * 1000; // أسبوع واحد

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

Deno.serve(async (req) => {
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
          console.log('[weekly-maintenance] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'weekly-maintenance',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }

    // ============ المصادقة والتفويض ============
    let isAuthorized = false;
    let authMethod: 'cron' | 'jwt' = 'jwt';
    let authorizedUserId: string | null = null;

    // 1️⃣ فحص CRON_SECRET للمهام المجدولة
    const cronSecret = req.headers.get('x-cron-secret');
    const expectedCronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && expectedCronSecret && cronSecret === expectedCronSecret) {
      isAuthorized = true;
      authMethod = 'cron';
      console.log('[weekly-maintenance] ✅ Authorized via CRON_SECRET');
      
      // Rate limiting للمهام المجدولة
      const rateLimitResult = checkRateLimit('cron_weekly_maint', RATE_LIMIT_CRON);
      if (!rateLimitResult.allowed) {
        const daysRemaining = Math.ceil(rateLimitResult.resetIn / (24 * 60 * 60 * 1000));
        console.warn('[weekly-maintenance] Rate limit exceeded for CRON');
        return errorResponse(`تجاوز الحد المسموح. يرجى الانتظار ${daysRemaining} يوم.`, 429);
      }
    }

    // 2️⃣ فحص JWT للمستخدمين
    if (!isAuthorized) {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        console.warn('[weekly-maintenance] ❌ No authentication provided');
        return unauthorizedResponse('المصادقة مطلوبة - يرجى تسجيل الدخول');
      }

      const token = authHeader.replace('Bearer ', '');
      
      const supabaseAuth = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );

      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError || !user) {
        console.warn('[weekly-maintenance] ❌ Invalid token:', authError?.message);
        return unauthorizedResponse('جلسة غير صالحة - يرجى إعادة تسجيل الدخول');
      }

      // فحص الصلاحيات - admin فقط (صيانة خطيرة)
      const supabaseService = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: roles, error: rolesError } = await supabaseService
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('[weekly-maintenance] Error fetching roles:', rolesError);
        return errorResponse('خطأ في التحقق من الصلاحيات', 500);
      }

      const hasAccess = roles?.some(r => r.role === 'admin');

      if (!hasAccess) {
        console.warn(`[weekly-maintenance] ❌ Forbidden - User ${user.id} is not admin`);
        return forbiddenResponse('ليس لديك صلاحية لتشغيل الصيانة الأسبوعية - يتطلب صلاحية مدير');
      }

      isAuthorized = true;
      authorizedUserId = user.id;
      console.log(`[weekly-maintenance] ✅ Authorized via JWT - Admin: ${user.id}`);

      // Rate limiting للمستخدمين (مرة واحدة في الأسبوع)
      const rateLimitResult = checkRateLimit(`user_${user.id}`, RATE_LIMIT_USER);
      if (!rateLimitResult.allowed) {
        const daysRemaining = Math.ceil(rateLimitResult.resetIn / (24 * 60 * 60 * 1000));
        console.warn(`[weekly-maintenance] Rate limit exceeded for user: ${user.id}`);
        return errorResponse(`تجاوزت الحد المسموح (مرة واحدة/أسبوع). يرجى الانتظار ${daysRemaining} يوم.`, 429);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log("[weekly-maintenance] بدء الصيانة الأسبوعية الشاملة");

    const cleanupResults: Array<{ table: string; status: string; error?: string }> = [];
    const performanceResults: Array<{ operation: string; status: string; result?: unknown; error?: string }> = [];
    const monitoringResults: Array<{ check: string; status: string; result?: unknown; count?: number; tables?: unknown; error?: string }> = [];

    // ===== المرحلة 1: تنظيف البيانات القديمة =====
    
    // حذف سجلات الأخطاء القديمة (أكثر من 30 يوم)
    const { error: errorLogsError } = await supabase
      .from('system_error_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    cleanupResults.push({
      table: 'system_error_logs',
      status: errorLogsError ? 'error' : 'cleaned',
      error: errorLogsError?.message
    });

    // حذف التنبيهات المحلولة القديمة (أكثر من 14 يوم)
    const { error: alertsError } = await supabase
      .from('system_alerts')
      .delete()
      .eq('status', 'resolved')
      .lt('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());

    cleanupResults.push({
      table: 'system_alerts',
      status: alertsError ? 'error' : 'cleaned',
      error: alertsError?.message
    });

    // حذف سجلات التدقيق القديمة (أكثر من 90 يوم)
    const { error: auditError } = await supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    cleanupResults.push({
      table: 'audit_logs',
      status: auditError ? 'error' : 'cleaned',
      error: auditError?.message
    });

    // حذف فحوصات الصحة القديمة (أكثر من 7 أيام)
    const { error: healthError } = await supabase
      .from('system_health_checks')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    cleanupResults.push({
      table: 'system_health_checks',
      status: healthError ? 'error' : 'cleaned',
      error: healthError?.message
    });

    // حذف محادثات Chatbot القديمة (أكثر من 3 أيام)
    const { error: chatbotError } = await supabase
      .from('chatbot_conversations')
      .delete()
      .lt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    cleanupResults.push({
      table: 'chatbot_conversations',
      status: chatbotError ? 'error' : 'cleaned',
      error: chatbotError?.message
    });

    // ===== المرحلة 2: تشغيل التنظيف الشامل (ANALYZE) =====
    console.log("[weekly-maintenance] بدء التنظيف الشامل");
    
    const { data: fullCleanupResult, error: fullCleanupError } = await supabase
      .rpc('run_full_cleanup');
    
    performanceResults.push({
      operation: 'full_cleanup',
      status: fullCleanupError ? 'error' : 'completed',
      result: fullCleanupResult,
      error: fullCleanupError?.message
    });

    // ===== المرحلة 3: تشغيل VACUUM ANALYZE =====
    console.log("[weekly-maintenance] بدء VACUUM ANALYZE");
    
    const { data: vacuumResult, error: vacuumError } = await supabase
      .rpc('run_vacuum_analyze');
    
    performanceResults.push({
      operation: 'vacuum_analyze',
      status: vacuumError ? 'error' : 'completed',
      result: vacuumResult,
      error: vacuumError?.message
    });

    // ===== المرحلة 4: تحليل الجداول الإضافية =====
    const tablesToAnalyze = [
      'user_roles', 'beneficiaries', 'profiles', 'journal_entry_lines',
      'journal_entries', 'payments', 'contracts', 'properties',
      'distributions', 'loans', 'notifications'
    ];

    for (const table of tablesToAnalyze) {
      const { data, error } = await supabase.rpc('analyze_table', { table_name: table });
      performanceResults.push({
        operation: `analyze_${table}`,
        status: error ? 'error' : 'completed',
        error: error?.message
      });
    }

    // ===== المرحلة 5: مراقبة الأداء =====
    console.log("[weekly-maintenance] بدء مراقبة الأداء");

    const { data: performanceHealth, error: healthCheckError } = await supabase
      .rpc('get_performance_health');
    
    monitoringResults.push({
      check: 'performance_health',
      status: healthCheckError ? 'error' : 'completed',
      result: performanceHealth,
      error: healthCheckError?.message
    });

    const { data: unusedIndexes, error: unusedIndexesError } = await supabase
      .rpc('get_unused_indexes_count');
    
    monitoringResults.push({
      check: 'unused_indexes_count',
      status: unusedIndexesError ? 'error' : 'completed',
      count: unusedIndexes,
      error: unusedIndexesError?.message
    });

    const { data: highDeadRows, error: deadRowsError } = await supabase
      .rpc('get_tables_with_high_dead_rows');
    
    monitoringResults.push({
      check: 'high_dead_rows_tables',
      status: deadRowsError ? 'error' : 'completed',
      tables: highDeadRows,
      error: deadRowsError?.message
    });

    // ===== مراقبة الاتصالات الخاملة =====
    console.log("[weekly-maintenance] فحص الاتصالات الخاملة");
    
    const { data: idleConnections, error: idleError } = await supabase
      .rpc('get_idle_connections');

    monitoringResults.push({
      check: 'idle_connections',
      status: idleError ? 'error' : 'completed',
      count: idleConnections?.length || 0,
      result: idleConnections,
      error: idleError?.message
    });

    // إنشاء تنبيه إذا كان هناك اتصالات خاملة كثيرة (أكثر من 20)
    if (idleConnections && idleConnections.length > 20) {
      await supabase.from('system_alerts').insert({
        alert_type: 'idle_connections_warning',
        severity: 'medium',
        title: `تحذير: ${idleConnections.length} اتصال خامل`,
        description: `تم اكتشاف ${idleConnections.length} اتصال خامل لأكثر من 30 دقيقة`,
        status: 'active',
        metadata: { 
          count: idleConnections.length,
          oldest_idle_hours: idleConnections[0]?.idle_hours 
        }
      });
    }

    // ===== المرحلة 6: إنشاء تنبيهات الأداء =====
    const healthStatus = (performanceHealth as { status?: string })?.status || 'unknown';
    
    if (healthStatus === 'warning' || healthStatus === 'critical') {
      await supabase.from('system_alerts').insert({
        alert_type: 'performance_warning',
        severity: healthStatus === 'critical' ? 'high' : 'medium',
        title: `تنبيه أداء: ${healthStatus === 'critical' ? 'حالة حرجة' : 'تحذير'}`,
        description: `الصيانة الأسبوعية اكتشفت مشاكل في الأداء`,
        status: 'active',
        metadata: performanceHealth
      });
    }

    // تسجيل نتيجة الصيانة
    await supabase.from('audit_logs').insert({
      action_type: 'weekly_maintenance',
      user_id: authorizedUserId,
      description: `اكتملت الصيانة الأسبوعية (${authMethod})`,
      new_values: {
        cleanup: cleanupResults.filter(r => r.status === 'cleaned').length,
        analyzed: performanceResults.filter(r => r.status === 'completed').length,
        health_status: healthStatus
      }
    });

    await supabase.from('system_alerts').insert({
      alert_type: 'maintenance_completed',
      severity: 'info',
      title: 'اكتملت الصيانة الأسبوعية الشاملة',
      description: `تم تنظيف ${cleanupResults.filter(r => r.status === 'cleaned').length} جداول. حالة الأداء: ${healthStatus}`,
      status: 'resolved',
      metadata: {
        auth_method: authMethod,
        performed_by: authorizedUserId,
        performance_health: performanceHealth
      }
    });

    console.log("[weekly-maintenance] اكتملت الصيانة بنجاح");

    return jsonResponse({ 
      success: true, 
      message: 'اكتملت الصيانة الأسبوعية الشاملة',
      cleanup: cleanupResults,
      performance: performanceResults,
      monitoring: monitoringResults,
      summary: {
        tablesCleared: cleanupResults.filter(r => r.status === 'cleaned').length,
        tablesAnalyzed: performanceResults.filter(r => r.status === 'completed').length,
        performanceStatus: healthStatus,
        unusedIndexesCount: unusedIndexes,
        highDeadRowsTables: (highDeadRows as unknown[])?.length || 0,
        idleConnectionsCount: idleConnections?.length || 0,
        authMethod
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("[weekly-maintenance] خطأ:", error);
    return errorResponse(
      error instanceof Error ? error.message : String(error),
      500
    );
  }
});
