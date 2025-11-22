import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorReport {
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  url: string;
  user_agent: string;
  user_id?: string;
  additional_data?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const errorReport: ErrorReport = await req.json();

    // إنشاء عميل Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
        user_id: errorReport.user_id,
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
      // 1. تطبيق قواعد الإشعارات
      applyAlertRules(supabase, errorLog, errorReport),
      
      // 2. تحليل الأخطاء المتكررة
      analyzeRecurringErrors(supabase, errorReport, errorLog.id),
      
      // 3. محاولة الإصلاح التلقائي
      attemptAutoFix(supabase, errorLog, errorReport),
      
      // 4. تسجيل مقياس الأداء
      recordPerformanceMetric(supabase, errorReport),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        error_id: errorLog.id,
        message: 'Error logged and processed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in log-error function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * تطبيق قواعد الإشعارات وإرسال الإشعارات المناسبة
 */
async function applyAlertRules(supabase: any, errorLog: any, errorReport: ErrorReport) {
  try {
    // جلب القواعد النشطة
    const { data: rules, error: rulesError } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (rulesError || !rules || rules.length === 0) {
      console.log('No active alert rules found');
      return;
    }

    // تطبيق كل قاعدة
    for (const rule of rules) {
      // فحص إذا كانت القاعدة تنطبق على هذا الخطأ
      if (shouldApplyRule(rule, errorReport)) {
        console.log(`✅ Applying rule: ${rule.rule_name}`);
        
        // إنشاء تنبيه
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

        // إرسال إشعارات للأدوار المحددة
        await sendRoleNotifications(supabase, rule.notify_roles, errorLog, alert);

        // التصعيد التلقائي إذا كان مفعلاً
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

/**
 * فحص إذا كانت القاعدة تنطبق على هذا الخطأ
 */
function shouldApplyRule(rule: any, errorReport: ErrorReport): boolean {
  // فحص نمط نوع الخطأ
  if (rule.error_type_pattern) {
    const regex = new RegExp(rule.error_type_pattern);
    if (!regex.test(errorReport.error_type)) {
      return false;
    }
  }

  // فحص مستوى الخطورة
  const severityLevels = ['low', 'medium', 'high', 'critical'];
  const minSeverityIndex = severityLevels.indexOf(rule.min_severity || 'low');
  const currentSeverityIndex = severityLevels.indexOf(errorReport.severity);
  
  if (currentSeverityIndex < minSeverityIndex) {
    return false;
  }

  return true;
}

/**
 * إرسال إشعارات للأدوار المحددة
 */
async function sendRoleNotifications(supabase: any, roles: string[], errorLog: any, alert: any) {
  try {
    // جلب المستخدمين حسب الأدوار (بدون فلتر is_active لأنه غير موجود في جدول user_roles)
    const { data: users, error: usersError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('role', roles);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log(`No users found for roles: ${roles.join(', ')}`);
      return;
    }

    // جلب تفضيلات الإشعارات
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .in('user_id', users.map((u: any) => u.user_id));

    // إنشاء إشعارات
    const notifications = [];
    
    for (const user of users) {
      const userPref = preferences?.find((p: any) => p.user_id === user.user_id);
      
      // فحص إذا كان المستخدم يريد الإشعار عن هذا المستوى
      const shouldNotify = userPref
        ? userPref[`notify_${errorLog.severity}`]
        : true; // افتراضي: إرسال الإشعار

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

/**
 * التصعيد التلقائي للتنبيهات
 */
async function handleAutoEscalation(supabase: any, alertId: string, errorLogId: string, delayMinutes: number) {
  try {
    // فحص إذا تم حل التنبيه
    const { data: alert } = await supabase
      .from('system_alerts')
      .select('status')
      .eq('id', alertId)
      .single();

    if (!alert || alert.status === 'resolved') {
      console.log('Alert already resolved, skipping escalation');
      return;
    }

    // جلب المدراء (admin) - بدون is_active
    const { data: admins } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!admins || admins.length === 0) {
      console.log('No admins found for escalation');
      return;
    }

    // إنشاء سجل تصعيد
    await supabase.from('alert_escalations').insert({
      alert_id: alertId,
      error_log_id: errorLogId,
      escalated_to_user_id: admins[0].user_id,
      escalation_level: 1,
      escalation_reason: `لم يتم حل التنبيه خلال ${delayMinutes} دقيقة`,
      status: 'pending',
    });

    // إرسال إشعار للمدير
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

/**
 * تحليل الأخطاء المتكررة
 */
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

/**
 * محاولة الإصلاح التلقائي
 */
async function attemptAutoFix(supabase: any, errorLog: any, errorReport: ErrorReport) {
  try {
    // تحديد استراتيجية الإصلاح حسب نوع الخطأ
    let fixStrategy = 'retry';
    
    if (errorReport.error_type === 'network_error') {
      fixStrategy = 'retry';
    } else if (errorReport.error_type === 'database_connection') {
      fixStrategy = 'restart';
    } else if (errorReport.error_type === 'performance_issue') {
      fixStrategy = 'fallback';
    }

    // تسجيل محاولة الإصلاح
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

/**
 * تسجيل مقياس الأداء
 */
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

/**
 * الحصول على تسمية مستوى الخطورة بالعربية
 */
function getSeverityLabel(severity: string): string {
  const labels: Record<string, string> = {
    low: 'منخفض',
    medium: 'متوسط',
    high: 'مرتفع',
    critical: 'حرج',
  };
  return labels[severity] || severity;
}
