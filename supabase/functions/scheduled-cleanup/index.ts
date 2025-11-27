/**
 * Edge Function للتنظيف المجدول
 * يمكن استدعاؤها من Cron Job أو يدوياً
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  success: boolean;
  total_deleted?: number;
  details?: {
    health_checks: number;
    error_logs: number;
    alerts: number;
    audit_logs: number;
    notifications: number;
  };
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // يمكن استدعاؤها بدون مصادقة للـ Cron Jobs
    // أو مع مصادقة للاستدعاء اليدوي
    const authHeader = req.headers.get('authorization');
    const isCronJob = req.headers.get('x-cron-job') === 'true';
    
    if (!isCronJob && !authHeader) {
      console.log('Unauthorized access attempt - not a cron job and no auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting scheduled cleanup...');

    // استدعاء دالة التنظيف المخزنة
    const { data, error } = await supabase.rpc('run_scheduled_cleanup');

    if (error) {
      console.error('Cleanup RPC error:', error);
      throw error;
    }

    const result = data as CleanupResult;
    
    console.log('Cleanup completed:', result);

    // تسجيل في audit_logs
    await supabase.from('audit_logs').insert({
      action_type: 'SCHEDULED_CLEANUP',
      table_name: 'multiple',
      description: `تنظيف مجدول: تم حذف ${result.total_deleted || 0} سجل`,
      severity: 'info',
    });

    return new Response(
      JSON.stringify({
        ...result,
        message: `تم التنظيف بنجاح: ${result.total_deleted || 0} سجل محذوف`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cleanup error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
