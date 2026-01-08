import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScheduledTestResult {
  functionName: string;
  status: 'success' | 'error' | 'timeout';
  duration: number;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      triggerType = 'manual',
      testCategories = ['edge-functions', 'database'],
      notifyOnFailure = true
    } = await req.json().catch(() => ({}));

    const startTime = Date.now();
    const results: ScheduledTestResult[] = [];
    
    // قائمة Edge Functions للاختبار
    const edgeFunctions = [
      'chatbot',
      'ai-system-audit',
      'db-health-check',
      'generate-smart-alerts',
    ];

    // اختبار Edge Functions
    if (testCategories.includes('edge-functions')) {
      for (const funcName of edgeFunctions) {
        const funcStart = Date.now();
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/${funcName}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ testMode: true, ping: true }),
          });
          
          const duration = Date.now() - funcStart;
          
          if (response.ok || response.status === 401 || response.status === 403) {
            results.push({
              functionName: funcName,
              status: 'success',
              duration,
              message: `HTTP ${response.status}`
            });
          } else {
            results.push({
              functionName: funcName,
              status: 'error',
              duration,
              message: `HTTP ${response.status}: ${response.statusText}`
            });
          }
        } catch (error: any) {
          results.push({
            functionName: funcName,
            status: error.message?.includes('timeout') ? 'timeout' : 'error',
            duration: Date.now() - funcStart,
            message: error.message
          });
        }
      }
    }

    // اختبار الجداول الأساسية
    const criticalTables = ['profiles', 'beneficiaries', 'properties', 'distributions'];
    
    if (testCategories.includes('database')) {
      for (const table of criticalTables) {
        const tableStart = Date.now();
        try {
          const { error } = await supabase.from(table).select('id').limit(1);
          results.push({
            functionName: `db:${table}`,
            status: error ? 'error' : 'success',
            duration: Date.now() - tableStart,
            message: error?.message
          });
        } catch (error: any) {
          results.push({
            functionName: `db:${table}`,
            status: 'error',
            duration: Date.now() - tableStart,
            message: error.message
          });
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status !== 'success').length;
    const passRate = results.length > 0 ? (passed / results.length) * 100 : 0;

    // حفظ النتيجة في قاعدة البيانات
    const { data: savedRun, error: saveError } = await supabase
      .from('test_runs')
      .insert({
        total_tests: results.length,
        passed_tests: passed,
        failed_tests: failed,
        pass_rate: Number(passRate.toFixed(2)),
        avg_duration: Math.round(results.reduce((s, r) => s + r.duration, 0) / results.length),
        categories_summary: {
          'edge-functions': {
            total: results.filter(r => !r.functionName.startsWith('db:')).length,
            passed: results.filter(r => !r.functionName.startsWith('db:') && r.status === 'success').length,
            failed: results.filter(r => !r.functionName.startsWith('db:') && r.status !== 'success').length
          },
          'database': {
            total: results.filter(r => r.functionName.startsWith('db:')).length,
            passed: results.filter(r => r.functionName.startsWith('db:') && r.status === 'success').length,
            failed: results.filter(r => r.functionName.startsWith('db:') && r.status !== 'success').length
          }
        },
        failed_tests_details: results
          .filter(r => r.status !== 'success')
          .map(r => ({
            testId: r.functionName,
            testName: r.functionName,
            category: r.functionName.startsWith('db:') ? 'database' : 'edge-functions',
            message: r.message || 'Unknown error'
          })),
        triggered_by: triggerType,
        run_duration_seconds: Math.round(totalDuration / 1000),
        notes: `Scheduled test run: ${edgeFunctions.length} edge functions, ${criticalTables.length} tables`
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving test run:', saveError);
    }

    // إرسال إشعار إذا كانت هناك إخفاقات
    if (notifyOnFailure && failed > 0) {
      // إضافة تنبيه للمسؤولين
      try {
        await supabase.from('admin_alerts').insert({
          alert_type: 'test_failure',
          severity: failed > 3 ? 'high' : 'medium',
          title: `فشل ${failed} اختبار في الفحص المجدول`,
          message: `نسبة النجاح: ${passRate.toFixed(1)}%`,
          is_read: false,
          metadata: {
            testRunId: savedRun?.id,
            passRate,
            failedTests: failed
          }
        });
      } catch (e) {
        console.error('Failed to create alert:', e);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: results.length,
          passed,
          failed,
          passRate: passRate.toFixed(1),
          duration: totalDuration
        },
        results,
        savedRunId: savedRun?.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Scheduled tests error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
