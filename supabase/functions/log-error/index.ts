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

    console.log('✅ Error logged successfully:', errorLog.id);

    // إرسال إشعار فوري للدعم الفني للأخطاء الحرجة
    if (errorReport.severity === 'critical' || errorReport.severity === 'high') {
      await sendSupportNotification(supabase, errorLog);
    }

    // تحليل الأخطاء المتكررة
    await analyzeRecurringErrors(supabase, errorReport);

    return new Response(
      JSON.stringify({
        success: true,
        error_id: errorLog.id,
        message: 'Error logged successfully',
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

async function sendSupportNotification(supabase: any, errorLog: any) {
  try {
    // جلب مستخدمي الدعم الفني
    const { data: supportUsers } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role_name', 'support')
      .eq('is_active', true);

    if (!supportUsers || supportUsers.length === 0) {
      console.log('No support users found');
      return;
    }

    // إنشاء إشعارات للدعم الفني
    const notifications = supportUsers.map((user: any) => ({
      user_id: user.user_id,
      title: `خطأ ${errorLog.severity === 'critical' ? 'حرج' : 'مهم'} في النظام`,
      message: `تم رصد خطأ: ${errorLog.error_message}`,
      type: 'system_error',
      priority: errorLog.severity,
      related_id: errorLog.id,
      is_read: false,
    }));

    await supabase.from('notifications').insert(notifications);

    console.log(`✅ Sent notifications to ${supportUsers.length} support users`);
  } catch (error) {
    console.error('Failed to send support notifications:', error);
  }
}

async function analyzeRecurringErrors(supabase: any, errorReport: ErrorReport) {
  try {
    // البحث عن أخطاء مشابهة في آخر ساعة
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: similarErrors, error } = await supabase
      .from('system_error_logs')
      .select('id')
      .eq('error_type', errorReport.error_type)
      .eq('error_message', errorReport.error_message)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Failed to analyze recurring errors:', error);
      return;
    }

    // إذا تكرر الخطأ أكثر من 5 مرات في ساعة، رفع الأولوية
    if (similarErrors && similarErrors.length > 5) {
      console.warn(`🚨 ALERT: Error "${errorReport.error_message}" occurred ${similarErrors.length} times in the last hour!`);
      
      // إنشاء تنبيه عاجل
      await supabase.from('system_alerts').insert({
        alert_type: 'recurring_error',
        severity: 'critical',
        title: 'خطأ متكرر في النظام',
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
