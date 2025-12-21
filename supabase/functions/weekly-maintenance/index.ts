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
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[weekly-maintenance] Health check received');
          return new Response(JSON.stringify({
            status: 'healthy',
            function: 'weekly-maintenance',
            timestamp: new Date().toISOString()
          }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch { /* not JSON, continue */ }
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceKey);

    console.log("[weekly-maintenance] بدء الصيانة الأسبوعية الشاملة");

    const cleanupResults = [];
    const performanceResults = [];
    const monitoringResults = [];

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

    // فحص صحة الأداء العام
    const { data: performanceHealth, error: healthCheckError } = await supabase
      .rpc('get_performance_health');
    
    monitoringResults.push({
      check: 'performance_health',
      status: healthCheckError ? 'error' : 'completed',
      result: performanceHealth,
      error: healthCheckError?.message
    });

    // عدد الفهارس غير المستخدمة
    const { data: unusedIndexes, error: unusedIndexesError } = await supabase
      .rpc('get_unused_indexes_count');
    
    monitoringResults.push({
      check: 'unused_indexes_count',
      status: unusedIndexesError ? 'error' : 'completed',
      count: unusedIndexes,
      error: unusedIndexesError?.message
    });

    // الجداول ذات Dead Rows العالية
    const { data: highDeadRows, error: deadRowsError } = await supabase
      .rpc('get_tables_with_high_dead_rows');
    
    monitoringResults.push({
      check: 'high_dead_rows_tables',
      status: deadRowsError ? 'error' : 'completed',
      tables: highDeadRows,
      error: deadRowsError?.message
    });

    // ===== المرحلة 6: إنشاء تنبيهات الأداء إذا لزم الأمر =====
    const healthStatus = performanceHealth?.status || 'unknown';
    
    if (healthStatus === 'warning' || healthStatus === 'critical') {
      await supabase.from('system_alerts').insert({
        alert_type: 'performance_warning',
        severity: healthStatus === 'critical' ? 'high' : 'medium',
        title: `تنبيه أداء: ${healthStatus === 'critical' ? 'حالة حرجة' : 'تحذير'}`,
        description: `الفهارس غير المستخدمة: ${performanceHealth?.unused_indexes || 0}, الجداول ذات Dead Rows العالية: ${performanceHealth?.tables_with_high_dead_rows || 0}, نسبة Cache: ${performanceHealth?.cache_hit_ratio || 0}%`,
        status: 'active',
        metadata: performanceHealth
      });
    }

    // إنشاء تنبيه إذا كان عدد الفهارس غير المستخدمة كبير
    if (unusedIndexes && unusedIndexes > 50) {
      await supabase.from('system_alerts').insert({
        alert_type: 'unused_indexes_high',
        severity: unusedIndexes > 100 ? 'high' : 'medium',
        title: `عدد كبير من الفهارس غير المستخدمة: ${unusedIndexes}`,
        description: `يوجد ${unusedIndexes} فهرس غير مستخدم. يُنصح بمراجعتها وحذف غير الضرورية منها.`,
        status: 'active'
      });
    }

    // ===== تسجيل نتيجة الصيانة النهائية =====
    await supabase.from('system_alerts').insert({
      alert_type: 'maintenance_completed',
      severity: 'info',
      title: 'اكتملت الصيانة الأسبوعية الشاملة',
      description: `تم تنظيف ${cleanupResults.filter(r => r.status === 'cleaned').length} جداول. تم تحليل ${performanceResults.filter(r => r.status === 'completed').length} جدول. حالة الأداء: ${healthStatus}`,
      status: 'resolved',
      metadata: {
        performance_health: performanceHealth,
        unused_indexes: unusedIndexes,
        high_dead_rows_tables: highDeadRows?.length || 0
      }
    });

    console.log("[weekly-maintenance] اكتملت الصيانة:", { 
      cleanupResults, 
      performanceResults, 
      monitoringResults 
    });

    return new Response(
      JSON.stringify({ 
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
          highDeadRowsTables: highDeadRows?.length || 0
        },
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
