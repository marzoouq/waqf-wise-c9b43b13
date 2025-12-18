import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log("[weekly-maintenance] بدء الصيانة الأسبوعية");

    const cleanupResults = [];

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

    // تسجيل نتيجة الصيانة
    await supabase.from('system_alerts').insert({
      alert_type: 'maintenance_completed',
      severity: 'info',
      title: 'اكتملت الصيانة الأسبوعية',
      description: `تم تنظيف ${cleanupResults.filter(r => r.status === 'cleaned').length} جداول`,
      status: 'resolved'
    });

    console.log("[weekly-maintenance] اكتملت الصيانة:", cleanupResults);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'اكتملت الصيانة الأسبوعية',
        results: cleanupResults,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[weekly-maintenance] خطأ:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
