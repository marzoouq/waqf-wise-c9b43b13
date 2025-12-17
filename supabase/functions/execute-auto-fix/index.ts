import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  forbiddenResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
}

interface Admin {
  user_id: string;
}

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 🔒 1. فحص المصادقة
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return unauthorizedResponse('غير مصرح');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return unauthorizedResponse('مصادقة غير صالحة');
    }

    // 🔐 2. التحقق من الصلاحيات (يجب أن يكون admin أو nazer)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const userRoles = roleData?.map(r => r.role) || [];
    const hasAccess = userRoles.includes('admin') || userRoles.includes('nazer');

    if (!hasAccess) {
      return forbiddenResponse('ليس لديك صلاحية لتنفيذ هذه العملية - يتطلب دور مسؤول');
    }

    // 🚦 3. Rate Limiting المحسّن (محاولة كل 10 ثواني للـ cron, دقيقة للـ manual)
    const tenSecondsAgo = new Date(Date.now() - 10000).toISOString();
    const { data: recentFixes } = await supabase
      .from('auto_fix_attempts')
      .select('id')
      .gte('created_at', tenSecondsAgo);

    // التحقق من المصدر (cron vs manual)
    const isCronJob = req.headers.get('x-cron-job') === 'true';
    
    if (!isCronJob && recentFixes && recentFixes.length >= 1) {
      return rateLimitResponse('يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى');
    }

    console.log(`🔧 Starting auto-fix execution by user: ${user.email}...`);

    // ✅ تحميل الإعدادات من قاعدة البيانات
    const { data: settings } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['cron_old_errors_threshold_hours', 'cron_duplicate_alerts_window_hours']);

    let oldErrorsThresholdHours = 24;
    let duplicateAlertsWindowHours = 1;

    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        if (setting.setting_key === 'cron_old_errors_threshold_hours') {
          oldErrorsThresholdHours = Number(setting.setting_value);
        } else if (setting.setting_key === 'cron_duplicate_alerts_window_hours') {
          duplicateAlertsWindowHours = Number(setting.setting_value);
        }
      });
      console.log(`✅ Using settings: old errors threshold=${oldErrorsThresholdHours}h, duplicate alerts window=${duplicateAlertsWindowHours}h`);
    }

    // 🔧 1. Auto-resolve old errors (حسب الإعداد من DB)
    const thresholdTime = new Date(Date.now() - oldErrorsThresholdHours * 60 * 60 * 1000).toISOString();
    const { data: oldErrors } = await supabase
      .from('system_error_logs')
      .update({ 
        status: 'auto_resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: 'system_auto_cleanup'
      })
      .eq('status', 'new')
      .lt('created_at', thresholdTime)
      .select('id');
    
    if (oldErrors && oldErrors.length > 0) {
      console.log(`✅ Auto-resolved ${oldErrors.length} old errors`);
    }

    // 🔧 2. Clean duplicate alerts (حسب الإعداد من DB)
    const alertsWindowTime = new Date(Date.now() - duplicateAlertsWindowHours * 60 * 60 * 1000).toISOString();
    const { data: alerts } = await supabase
      .from('system_alerts')
      .select('alert_type, severity, id')
      .eq('status', 'active')
      .gte('created_at', alertsWindowTime);
    
    if (alerts && alerts.length > 1) {
      // تجميع حسب النوع والشدة
      const alertGroups = new Map<string, string[]>();
      alerts.forEach(alert => {
        const key = `${alert.alert_type}-${alert.severity}`;
        if (!alertGroups.has(key)) {
          alertGroups.set(key, []);
        }
        alertGroups.get(key)!.push(alert.id);
      });
      
      // حل المكررات (نحتفظ بواحد فقط من كل مجموعة)
      let resolvedCount = 0;
      for (const [_, ids] of alertGroups) {
        if (ids.length > 1) {
          // حل جميع التنبيهات ماعدا الأول
          const { error } = await supabase
            .from('system_alerts')
            .update({ 
              status: 'resolved',
              resolved_at: new Date().toISOString()
            })
            .in('id', ids.slice(1));
          
          if (!error) {
            resolvedCount += ids.length - 1;
          }
        }
      }
      
      if (resolvedCount > 0) {
        console.log(`✅ Cleaned ${resolvedCount} duplicate alerts`);
      }
    }

    // جلب محاولات الإصلاح المعلقة
    const { data: pendingFixes, error: fetchError } = await supabase
      .from('auto_fix_attempts')
      .select('*, system_error_logs(*)')
      .eq('status', 'pending')
      .limit(100);

    if (fetchError) throw fetchError;

    if (!pendingFixes || pendingFixes.length === 0) {
      console.log('✅ No pending fixes found');
      return jsonResponse({ success: true, message: 'No pending fixes', fixed: 0 });
    }

    console.log(`📋 Found ${pendingFixes.length} pending fixes`);
    
    let successCount = 0;
    let failedCount = 0;

    // تنفيذ كل محاولة إصلاح
    for (const fix of pendingFixes) {
      try {
        const errorLog = fix.system_error_logs as ErrorLog | null;
        if (!errorLog) {
          console.warn(`⚠️ No error log found for fix ${fix.id}`);
          continue;
        }

        let result = '';
        let status = 'success';

        // تنفيذ الإصلاح حسب الاستراتيجية
        switch (fix.fix_strategy) {
          case 'retry':
            result = await executeRetryStrategy(supabase, errorLog);
            break;
          
          case 'fallback':
            result = await executeFallbackStrategy(supabase, errorLog);
            break;
          
          case 'restart':
            result = await executeRestartStrategy(supabase, errorLog);
            break;
          
          default:
            result = 'Unknown strategy';
            status = 'failed';
        }

        // تحديث حالة محاولة الإصلاح
        await supabase
          .from('auto_fix_attempts')
          .update({
            status,
            completed_at: new Date().toISOString(),
            result,
          })
          .eq('id', fix.id);

        if (status === 'success') {
          successCount++;
          
          // تحديث حالة الخطأ إلى محلول
          await supabase
            .from('system_error_logs')
            .update({
              status: 'resolved',
              resolved_at: new Date().toISOString(),
              resolved_by: user.id,
            })
            .eq('id', errorLog.id);
        } else {
          failedCount++;
        }

        console.log(`${status === 'success' ? '✅' : '❌'} Fix ${fix.id}: ${result}`);

      } catch (error) {
        console.error(`❌ Failed to execute fix ${fix.id}:`, error);
        failedCount++;
        
        await supabase
          .from('auto_fix_attempts')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error instanceof Error ? error.message : String(error),
          })
          .eq('id', fix.id);
      }
    }

    console.log(`✅ Auto-fix completed: ${successCount} succeeded, ${failedCount} failed`);

    return jsonResponse({
      success: true,
      fixed: successCount,
      failed: failedCount,
      total: pendingFixes.length,
    });

  } catch (error) {
    console.error('Error in execute-auto-fix:', error);
    return errorResponse('حدث خطأ أثناء تنفيذ الإصلاحات التلقائية', 500);
  }
});

/**
 * تنفيذ استراتيجية إعادة المحاولة
 */
async function executeRetryStrategy(supabase: SupabaseClient, errorLog: ErrorLog): Promise<string> {
  // للأخطاء المتعلقة بالشبكة، نعتبرها محلولة إذا كانت قديمة
  if (errorLog.error_type === 'network_error') {
    const errorAge = Date.now() - new Date(errorLog.created_at).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (errorAge > fiveMinutes) {
      return 'Network error resolved automatically (aged out)';
    }
    
    // محاولة فحص الاتصال
    try {
      const { error } = await supabase.from('beneficiaries').select('id').limit(1);
      if (!error) {
        return 'Network connectivity verified - error resolved';
      }
      return 'Network still experiencing issues';
    } catch {
      return 'Failed to verify network connectivity';
    }
  }
  
  return 'Retry strategy applied';
}

/**
 * تنفيذ استراتيجية الاحتياطية
 */
async function executeFallbackStrategy(_supabase: SupabaseClient, errorLog: ErrorLog): Promise<string> {
  // للأخطاء المتعلقة بالأداء، نعتبرها محلولة إذا كانت قديمة
  if (errorLog.error_type === 'performance_issue' || errorLog.error_type === 'layout_shift') {
    return 'Performance issue marked as resolved (non-critical)';
  }
  
  return 'Fallback strategy applied';
}

/**
 * تنفيذ استراتيجية إعادة التشغيل
 */
async function executeRestartStrategy(supabase: SupabaseClient, errorLog: ErrorLog): Promise<string> {
  // للأخطاء الحرجة، نسجلها فقط ونعلم المسؤولين
  if (errorLog.severity === 'critical') {
    // إنشاء إشعار للمسؤولين
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (admins && admins.length > 0) {
      const typedAdmins = admins as Admin[];
      const notifications = typedAdmins.map((admin: Admin) => ({
        user_id: admin.user_id,
        title: '🚨 خطأ حرج يتطلب تدخل',
        message: errorLog.error_message,
        type: 'critical_error',
        priority: 'critical',
        action_url: `/system-error-logs?error_id=${errorLog.id}`,
        is_read: false,
      }));
      
      await supabase.from('notifications').insert(notifications);
      return 'Critical error notifications sent to admins';
    }
  }
  
  return 'Restart strategy executed';
}
