import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse,
  rateLimitResponse 
} from '../_shared/cors.ts';

// Interfaces for type safety
interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  severity: string;
  created_at: string;
  status?: string;
}

interface AlertRule {
  rule_name: string;
  error_type_pattern?: string;
  min_severity?: string;
  notify_roles?: string[];
  auto_escalate?: boolean;
  escalation_delay_minutes?: number;
}

interface SystemAlert {
  id: string;
  alert_type: string;
  severity: string;
  status?: string;
}

interface User {
  user_id: string;
  role?: string;
}

interface NotificationPreference {
  user_id: string;
  notify_low?: boolean;
  notify_medium?: boolean;
  notify_high?: boolean;
  notify_critical?: boolean;
}

// Schema للتحقق من صحة المدخلات - مع قيم افتراضية
const errorReportSchema = z.object({
  error_type: z.string().min(1).max(100).default('unknown_error'),
  error_message: z.string().min(1).max(2000).default('No message provided'),
  error_stack: z.string().max(10000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  url: z.string().max(2000).default('unknown'),
  user_agent: z.string().max(500).default('unknown'),
  user_id: z.string().uuid().optional(),
  additional_data: z.record(z.unknown()).optional()
});

type ErrorReport = z.infer<typeof errorReportSchema>;

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // ✅ قراءة body مرة واحدة فقط في البداية
    const bodyText = await req.text();
    let rawData: Record<string, unknown> = {};
    
    if (bodyText && bodyText.trim() !== '') {
      try {
        rawData = JSON.parse(bodyText);
        
        // ✅ Health Check Support - قبل أي عمليات أخرى
        if (rawData.ping || rawData.healthCheck) {
          console.log('[log-error] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'log-error',
            timestamp: new Date().toISOString()
          });
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        return jsonResponse({
          success: true,
          message: 'Invalid JSON received - ignored',
          stored: false,
        });
      }
    } else {
      console.warn('⚠️ Empty request body received');
      return jsonResponse({
        success: true,
        message: 'Empty body received - ignored',
        stored: false,
      });
    }

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

    console.log('📥 Received data keys:', Object.keys(rawData));
    
    // ✅ 3. فحص محسّن: تحقق من error_type أيضاً (ليس فقط level)
    const nonErrorTypes = ['info', 'debug', 'warning'];
    
    // فحص level (للتوافق القديم)
    if (rawData.level && nonErrorTypes.includes(String(rawData.level))) {
      console.log(`ℹ️ Non-error log (level: ${rawData.level}) - skipping storage`);
      return jsonResponse({
        success: true,
        message: `${rawData.level} log acknowledged`,
        stored: false,
      });
    }
    
    // ✅ فحص error_type (التنسيق الجديد من production-logger)
    if (rawData.error_type && nonErrorTypes.includes(String(rawData.error_type))) {
      console.log(`ℹ️ Non-error log (type: ${rawData.error_type}) - skipping storage`);
      return jsonResponse({
        success: true,
        message: `${rawData.error_type} log acknowledged`,
        stored: false,
      });
    }

    // ✅ 4. تجاهل البيانات الفارغة أو غير المكتملة
    // إذا كانت البيانات تحتوي على error/context فقط بدون error_type/error_message - تجاهل
    const hasErrorContext = 'error' in rawData && 'context' in rawData;
    const hasMissingFields = !rawData.error_type && !rawData.error_message;
    
    if (hasErrorContext && hasMissingFields) {
      console.log('⚠️ Ignoring malformed error data (error/context format without proper fields)');
      return jsonResponse({
        success: true,
        message: 'Malformed data ignored - missing error_type/error_message',
        stored: false,
      });
    }
    
    // استخراج البيانات من error object إذا وجد
    const errorObj = rawData.error as Record<string, unknown> | undefined;
    const contextObj = rawData.context as Record<string, unknown> | undefined;
    
    // إضافة قيم افتراضية للحقول الناقصة
    const normalizedData = {
      error_type: rawData.error_type || (errorObj?.name ? String(errorObj.name) : 'unknown_error'),
      error_message: rawData.error_message || rawData.message || (errorObj?.message ? String(errorObj.message) : null),
      error_stack: rawData.error_stack || (errorObj?.stack ? String(errorObj.stack) : undefined),
      severity: rawData.severity || 'medium',
      url: rawData.url || (contextObj?.url ? String(contextObj.url) : 'unknown'),
      user_agent: rawData.user_agent || 'unknown',
      user_id: rawData.user_id,
      additional_data: rawData.additional_data || rawData.data || contextObj,
    };
    
    // ✅ تجاهل الأخطاء بدون رسالة حقيقية
    if (!normalizedData.error_message || normalizedData.error_message === 'No message provided') {
      console.log('⚠️ Ignoring error without meaningful message');
      return jsonResponse({
        success: true,
        message: 'Error without message ignored',
        stored: false,
      });
    }
    
    // ✅ 5. محاولة تحليل كخطأ باستخدام safeParse
    const parseResult = errorReportSchema.safeParse(normalizedData);
    
    if (!parseResult.success) {
      console.warn('⚠️ Data does not match error schema after normalization:', 
        parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '));
      return jsonResponse({
        success: true,
        message: 'Data received but not stored (invalid error format)',
        stored: false,
      });
    }
    
    let errorReport = parseResult.data;

    // 🚦 6. Rate Limiting الذكي - منع الحلقات اللانهائية
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

    // 🧹 7. تنظيف رسائل الخطأ من HTML tags
    errorReport.error_message = errorReport.error_message
      .replace(/<[^>]*>/g, '')
      .substring(0, 2000);

    if (errorReport.error_stack) {
      errorReport.error_stack = errorReport.error_stack.substring(0, 10000);
    }

    // 🧹 8. تنظيف URL من query parameters الطويلة
    try {
      const urlObj = new URL(errorReport.url);
      urlObj.searchParams.delete('__lovable_token');
      urlObj.searchParams.delete('token');
      urlObj.searchParams.delete('access_token');
      errorReport.url = urlObj.toString().substring(0, 1000);
    } catch {
      errorReport.url = errorReport.url.substring(0, 1000);
    }

    // ✅ 9. تسجيل الخطأ في قاعدة البيانات
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

    // Cast to typed ErrorLog
    const typedErrorLog = errorLog as ErrorLog;

    // معالجة متوازية للمهام
    await Promise.all([
      applyAlertRules(supabase, typedErrorLog, errorReport),
      analyzeRecurringErrors(supabase, errorReport, typedErrorLog.id),
      attemptAutoFix(supabase, typedErrorLog, errorReport),
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
async function applyAlertRules(supabase: SupabaseClient, errorLog: ErrorLog, errorReport: ErrorReport) {
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
      const typedRule = rule as AlertRule;
      if (shouldApplyRule(typedRule, errorReport)) {
        console.log(`✅ Applying rule: ${typedRule.rule_name}`);
        
        const { data: alert } = await supabase
          .from('system_alerts')
          .insert({
            alert_type: errorReport.error_type,
            severity: errorReport.severity,
            title: `تنبيه: ${typedRule.rule_name}`,
            description: errorReport.error_message,
            occurrence_count: 1,
            related_error_type: errorReport.error_type,
            status: 'active',
          })
          .select()
          .single();

        if (!alert) continue;

        const typedAlert = alert as SystemAlert;
        const notifyRoles = Array.isArray(typedRule.notify_roles) ? typedRule.notify_roles : [];
        await sendRoleNotifications(supabase, notifyRoles, errorLog, typedAlert);

        if (typedRule.auto_escalate && typedRule.escalation_delay_minutes) {
          setTimeout(() => {
            handleAutoEscalation(supabase, typedAlert.id, errorLog.id, typedRule.escalation_delay_minutes!);
          }, typedRule.escalation_delay_minutes * 60 * 1000);
        }
      }
    }
  } catch (error) {
    console.error('Failed to apply alert rules:', error);
  }
}

function shouldApplyRule(rule: AlertRule, errorReport: ErrorReport): boolean {
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

async function sendRoleNotifications(supabase: SupabaseClient, roles: string[], errorLog: ErrorLog, alert: SystemAlert) {
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

    const typedUsers = users as User[];

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .in('user_id', typedUsers.map((u: User) => u.user_id));

    const typedPreferences = (preferences || []) as NotificationPreference[];
    const notifications = [];
    
    for (const user of typedUsers) {
      const userPref = typedPreferences.find((p: NotificationPreference) => p.user_id === user.user_id);
      const severityKey = `notify_${errorLog.severity}` as keyof NotificationPreference;
      const shouldNotify = userPref ? userPref[severityKey] !== false : true;

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

async function handleAutoEscalation(supabase: SupabaseClient, alertId: string, errorLogId: string, delayMinutes: number) {
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

async function analyzeRecurringErrors(supabase: SupabaseClient, errorReport: ErrorReport, errorLogId: string) {
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

async function attemptAutoFix(supabase: SupabaseClient, errorLog: ErrorLog, errorReport: ErrorReport) {
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
      fix_type: fixStrategy,
      status: 'pending',
      details: { error_type: errorReport.error_type },
    });

    console.log(`✅ Auto-fix attempt logged: ${fixStrategy}`);
  } catch (error) {
    console.error('Failed to attempt auto-fix:', error);
  }
}

async function recordPerformanceMetric(supabase: SupabaseClient, errorReport: ErrorReport) {
  try {
    // فقط للأخطاء المتعلقة بالأداء
    if (!errorReport.error_type.includes('performance')) return;

    await supabase.from('performance_metrics').insert({
      metric_type: 'error_rate',
      metric_name: errorReport.error_type,
      value: 1,
      url: errorReport.url,
      additional_data: errorReport.additional_data,
    });

    console.log('✅ Performance metric recorded');
  } catch (error) {
    console.error('Failed to record performance metric:', error);
  }
}

function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'عالي',
    critical: 'حرج',
  };
  return labels[severity] || severity;
}
