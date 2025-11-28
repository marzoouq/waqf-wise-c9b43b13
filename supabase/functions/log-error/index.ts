import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

// Schema للتحقق من صحة المدخلات - الأخطاء الحقيقية
const errorReportSchema = z.object({
  error_type: z.string().min(1).max(100),
  error_message: z.string().min(1).max(2000),
  error_stack: z.string().max(10000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  url: z.string().max(2000),
  user_agent: z.string().max(500),
  user_id: z.string().uuid().optional(),
  additional_data: z.record(z.unknown()).optional()
});

// Schema للرسائل العامة (INFO, DEBUG, etc.) - اختياري
const generalLogSchema = z.object({
  level: z.enum(['info', 'debug', 'warn', 'error']).optional(),
  message: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  timestamp: z.string().optional(),
});

type ErrorReport = z.infer<typeof errorReportSchema>;

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 🔒 1. التحقق من API Key + Rate Limiting
    const apiKey = req.headers.get('apikey');
    if (!apiKey || !apiKey.startsWith('eyJ')) {
      return unauthorizedResponse('API key غير صالح');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 🚦 Rate Limiting: 100 requests/minute per user
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
      
      if (userId) {
        // فحص عدد الطلبات خلال الدقيقة الأخيرة
        const { count } = await supabase
          .from('system_error_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', new Date(Date.now() - 60000).toISOString());
        
        if (count && count >= 100) {
          console.log(`⚠️ Rate limit exceeded for user ${userId}: ${count} requests`);
          return rateLimitResponse('Rate limit exceeded. Maximum 100 errors per minute.');
        }
      }
    }

    // ✅ 2. التحقق من صحة المدخلات - مع دعم الرسائل العامة
    let errorReport: ErrorReport;
    try {
      const rawData = await req.json();
      console.log('📥 Received data:', JSON.stringify(rawData, null, 2));
      
      // أولاً: تحقق إذا كانت رسالة عامة (INFO, DEBUG) وليست خطأ حقيقي
      const generalLog = generalLogSchema.safeParse(rawData);
      if (generalLog.success && rawData.level && rawData.level !== 'error') {
        // رسالة INFO/DEBUG عادية - نقبلها بدون تسجيل في جدول الأخطاء
        console.log(`ℹ️ General ${rawData.level} log received - not an error, skipping storage`);
        return jsonResponse({
          success: true,
          message: `${rawData.level} log acknowledged`,
          stored: false,
        });
      }
      
      // ثانياً: محاولة تحليل كخطأ حقيقي
      const parseResult = errorReportSchema.safeParse(rawData);
      
      if (!parseResult.success) {
        // إذا لم يكن خطأ بالصيغة المتوقعة، نتجاهله بدون إرجاع خطأ
        console.warn('⚠️ Data does not match error schema - ignoring:', parseResult.error.issues.map(i => i.path.join('.')));
        return jsonResponse({
          success: true,
          message: 'Data received but not stored (invalid error format)',
          stored: false,
        });
      }
      
      errorReport = parseResult.data;
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return errorResponse('بيانات JSON غير صالحة', 400);
    }

    // 🚦 3. Rate Limiting الذكي - منع الحلقات اللانهائية
    if (userId) {
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      
      const { data: recentErrors } = await supabase
        .from('system_error_logs')
        .select('error_type, error_message')
        .eq('user_id', userId)
        .gte('created_at', oneMinuteAgo);

      if (recentErrors && recentErrors.length >= 15) {
        const sameTypeCount = recentErrors.filter(
          e => e.error_type === errorReport.error_type
        ).length;
        
        if (sameTypeCount >= 5) {
          console.warn(`⚠️ Infinite loop detected for user ${userId}`);
          return rateLimitResponse('تم اكتشاف حلقة أخطاء لا نهائية. يرجى تحديث الصفحة.');
        }
      }
    }

    // 🧹 4. تنظيف رسائل الخطأ من HTML tags
    errorReport.error_message = errorReport.error_message
      .replace(/<[^>]*>/g, '')
      .substring(0, 2000);

    if (errorReport.error_stack) {
      errorReport.error_stack = errorReport.error_stack.substring(0, 10000);
    }

    // 🧹 5. تنظيف URL من query parameters الطويلة
    try {
      const urlObj = new URL(errorReport.url);
      urlObj.searchParams.delete('__lovable_token');
      urlObj.searchParams.delete('token');
      urlObj.searchParams.delete('access_token');
      errorReport.url = urlObj.toString().substring(0, 1000);
    } catch {
      errorReport.url = errorReport.url.substring(0, 1000);
    }

    // تسجيل الخطأ في قاعدة البيانات
    const { data: errorLog, error: insertError } = await supabase
      .from('system_error_logs')
      .insert({
        error_type: errorReport.error_type,
        error_message: errorReport.error_message,
        error_stack: errorReport.error_stack,
        severity: errorReport.severity,
        url: errorReport.url,
        user_agent: errorReport.user_agent,
        user_id: userId,
        additional_data: errorReport.additional_data,
        status: 'new',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert error log:', insertError);
      throw insertError;
    }

    console.log('✅ Error logged:', errorLog.id);

    // معالجة متوازية للمهام
    await Promise.all([
      applyAlertRules(supabase, errorLog, errorReport),
      analyzeRecurringErrors(supabase, errorReport, errorLog.id),
      attemptAutoFix(supabase, errorLog, errorReport),
      recordPerformanceMetric(supabase, errorReport),
    ]);

    return jsonResponse({
      success: true,
      error_id: errorLog.id,
      message: 'Error logged and processed successfully',
    });
  } catch (error) {
    console.error('Error in log-error function:', error);
    return errorResponse('حدث خطأ أثناء معالجة الطلب', 500);
  }
});

/**
 * تطبيق قواعد الإشعارات وإرسال الإشعارات المناسبة
 */
async function applyAlertRules(supabase: any, errorLog: any, errorReport: ErrorReport) {
  try {
    const { data: rules, error: rulesError } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rulesError || !rules || rules.length === 0) {
      console.log('No active alert rules found');
      return;
    }

    for (const rule of rules) {
      if (shouldApplyRule(rule, errorReport)) {
        console.log(`✅ Applying rule: ${rule.rule_name}`);
        
        const { data: alert } = await supabase
          .from('system_alerts')
          .insert({
            alert_type: errorReport.error_type,
            severity: errorReport.severity,
            title: `تنبيه: ${rule.rule_name}`,
            description: errorReport.error_message,
            occurrence_count: 1,
            related_error_type: errorReport.error_type,
            status: 'active',
          })
          .select()
          .single();

        if (!alert) continue;

        const notifyRoles = Array.isArray(rule.notify_roles) ? rule.notify_roles : [];
        await sendRoleNotifications(supabase, notifyRoles, errorLog, alert);

        if (rule.auto_escalate) {
          setTimeout(() => {
            handleAutoEscalation(supabase, alert.id, errorLog.id, rule.escalation_delay_minutes);
          }, rule.escalation_delay_minutes * 60 * 1000);
        }
      }
    }
  } catch (error) {
    console.error('Failed to apply alert rules:', error);
  }
}

function shouldApplyRule(rule: any, errorReport: ErrorReport): boolean {
  if (rule.error_type_pattern) {
    const regex = new RegExp(rule.error_type_pattern);
    if (!regex.test(errorReport.error_type)) {
      return false;
    }
  }

  const severityLevels = ['low', 'medium', 'high', 'critical'];
  const minSeverityIndex = severityLevels.indexOf(rule.min_severity || 'low');
  const currentSeverityIndex = severityLevels.indexOf(errorReport.severity);
  
  if (currentSeverityIndex < minSeverityIndex) {
    return false;
  }

  return true;
}

async function sendRoleNotifications(supabase: any, roles: string[], errorLog: any, alert: any) {
  try {
    const validAppRoles = ['admin', 'nazer', 'accountant', 'disbursement_officer', 'archivist'];
    const validRoles = roles?.filter(r => r && r.trim() !== '' && validAppRoles.includes(r)) || [];
    
    if (validRoles.length === 0) {
      console.log('No valid roles provided for notifications');
      return;
    }
    
    console.log(`Sending notifications to roles: ${validRoles.join(', ')}`);

    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', validRoles);

    if (usersError || !users || users.length === 0) {
      console.log(`No users found for roles: ${roles.join(', ')}`);
      return;
    }

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .in('user_id', users.map((u: any) => u.user_id));

    const notifications = [];
    
    for (const user of users) {
      const userPref = preferences?.find((p: any) => p.user_id === user.user_id);
      const shouldNotify = userPref ? userPref[`notify_${errorLog.severity}`] : true;

      if (shouldNotify) {
        notifications.push({
          user_id: user.user_id,
          title: `خطأ ${getSeverityLabel(errorLog.severity)} في النظام`,
          message: `${errorLog.error_message.substring(0, 200)}...`,
          type: 'system_error',
          priority: errorLog.severity,
          action_url: `/system-errors?error_id=${errorLog.id}`,
          is_read: false,
        });
      }
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
      console.log(`✅ Sent ${notifications.length} notifications`);
    }
  } catch (error) {
    console.error('Failed to send role notifications:', error);
  }
}

async function handleAutoEscalation(supabase: any, alertId: string, errorLogId: string, delayMinutes: number) {
  try {
    const { data: alert } = await supabase
      .from('system_alerts')
      .select('status')
      .eq('id', alertId)
      .single();

    if (!alert || alert.status === 'resolved') {
      console.log('Alert already resolved, skipping escalation');
      return;
    }

    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.log('No admins found for escalation');
      return;
    }

    await supabase.from('alert_escalations').insert({
      alert_id: alertId,
      error_log_id: errorLogId,
      escalated_to_user_id: admins[0].user_id,
      escalation_level: 1,
      escalation_reason: `لم يتم حل التنبيه خلال ${delayMinutes} دقيقة`,
      status: 'pending',
    });

    await supabase.from('notifications').insert({
      user_id: admins[0].user_id,
      title: '🚨 تصعيد تنبيه حرج',
      message: `تم تصعيد تنبيه لم يتم حله خلال ${delayMinutes} دقيقة`,
      type: 'escalation',
      priority: 'critical',
      action_url: `/system-errors?alert_id=${alertId}`,
      is_read: false,
    });

    console.log('✅ Alert escalated successfully');
  } catch (error) {
    console.error('Failed to handle auto escalation:', error);
  }
}

async function analyzeRecurringErrors(supabase: any, errorReport: ErrorReport, errorLogId: string) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: similarErrors } = await supabase
      .from('system_error_logs')
      .select('id')
      .eq('error_type', errorReport.error_type)
      .eq('error_message', errorReport.error_message)
      .gte('created_at', oneHourAgo);

    if (similarErrors && similarErrors.length > 10) {
      console.warn(`🚨 ALERT: Error occurred ${similarErrors.length} times in the last hour!`);
      
      await supabase.from('system_alerts').insert({
        alert_type: 'recurring_error',
        severity: 'critical',
        title: 'خطأ متكرر حرج',
        description: `الخطأ "${errorReport.error_message}" تكرر ${similarErrors.length} مرة في الساعة الأخيرة`,
        occurrence_count: similarErrors.length,
        related_error_type: errorReport.error_type,
        status: 'active',
      });
    }
  } catch (error) {
    console.error('Failed to analyze recurring errors:', error);
  }
}

async function attemptAutoFix(supabase: any, errorLog: any, errorReport: ErrorReport) {
  try {
    let fixStrategy = 'retry';
    
    if (errorReport.error_type === 'network_error') {
      fixStrategy = 'retry';
    } else if (errorReport.error_type === 'database_connection') {
      fixStrategy = 'restart';
    } else if (errorReport.error_type === 'performance_issue') {
      fixStrategy = 'fallback';
    }

    await supabase.from('auto_fix_attempts').insert({
      error_log_id: errorLog.id,
      fix_strategy: fixStrategy,
      attempt_number: 1,
      max_attempts: 3,
      status: 'pending',
      result: 'Strategy determined based on error type',
    });

    console.log(`🔧 Auto-fix strategy determined: ${fixStrategy}`);
  } catch (error) {
    console.error('Failed to attempt auto-fix:', error);
  }
}

async function recordPerformanceMetric(supabase: any, errorReport: ErrorReport) {
  try {
    if (errorReport.error_type.includes('performance') || errorReport.error_type === 'layout_shift') {
      await supabase.from('performance_metrics').insert({
        metric_type: errorReport.error_type,
        metric_name: errorReport.error_message,
        value: errorReport.additional_data?.duration || errorReport.additional_data?.value || 0,
        unit: errorReport.error_type === 'layout_shift' ? 'score' : 'ms',
        url: errorReport.url,
        user_id: errorReport.user_id,
        metadata: errorReport.additional_data,
      });
    }
  } catch (error) {
    console.error('Failed to record performance metric:', error);
  }
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: 'منخفض الخطورة',
    medium: 'متوسط الخطورة',
    high: 'عالي الخطورة',
    critical: 'حرج',
  };
  return labels[severity] || severity;
}
