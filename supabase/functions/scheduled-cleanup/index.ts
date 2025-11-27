/**
 * Edge Function للتنظيف المجدول
 * يمكن استدعاؤها من Cron Job أو يدوياً
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';
import { 
  corsHeaders, 
  handleCors, 
  jsonResponse, 
  errorResponse, 
  unauthorizedResponse 
} from '../_shared/cors.ts';

interface CleanupDetails {
  health_checks: number;
  error_logs: number;
  alerts: number;
  audit_logs: number;
  notifications: number;
}

interface CleanupResult {
  success: boolean;
  total_deleted: number;
  details: CleanupDetails;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // يمكن استدعاؤها بدون مصادقة للـ Cron Jobs
    // أو مع مصادقة للاستدعاء اليدوي
    const authHeader = req.headers.get('authorization');
    const isCronJob = req.headers.get('x-cron-job') === 'true';
    
    if (!isCronJob && !authHeader) {
      console.log('Unauthorized access attempt - not a cron job and no auth header');
      return unauthorizedResponse('Unauthorized');
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
    
    console.log('Cleanup completed:', JSON.stringify(result));

    // تسجيل في audit_logs (الدالة تسجل تلقائياً، لكن نضيف ملخص إضافي)
    if (result.total_deleted > 0) {
      await supabase.from('audit_logs').insert({
        action_type: 'SCHEDULED_CLEANUP',
        table_name: 'multiple',
        description: `تنظيف مجدول: حذف ${result.total_deleted} سجل (health_checks: ${result.details?.health_checks || 0}, error_logs: ${result.details?.error_logs || 0}, alerts: ${result.details?.alerts || 0})`,
        severity: 'info',
      });
    }

    return jsonResponse({
      success: true,
      total_deleted: result.total_deleted,
      details: result.details,
      message: `تم التنظيف بنجاح: ${result.total_deleted} سجل محذوف`,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
