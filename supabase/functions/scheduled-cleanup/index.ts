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
    // ✅ Health Check Support
    const bodyClone = await req.clone().text();
    if (bodyClone) {
      try {
        const parsed = JSON.parse(bodyClone);
        if (parsed.ping || parsed.healthCheck) {
          console.log('[scheduled-cleanup] Health check received');
          return jsonResponse({
            status: 'healthy',
            function: 'scheduled-cleanup',
            timestamp: new Date().toISOString()
          });
        }
      } catch { /* not JSON, continue */ }
    }
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

    // 1. استدعاء دالة التنظيف المخزنة
    const { data, error } = await supabase.rpc('run_scheduled_cleanup');

    if (error) {
      console.error('Cleanup RPC error:', error);
      throw error;
    }

    const result = data as CleanupResult;
    
    console.log('Cleanup completed:', JSON.stringify(result));

    // 2. أرشفة سجلات التدقيق القديمة (أكثر من 7 أيام)
    const { data: archivedData, error: archiveError } = await supabase
      .from('audit_logs')
      .select('*')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    let archivedCount = 0;
    if (!archiveError && archivedData && archivedData.length > 0) {
      // نقل إلى جدول الأرشيف
      const { error: insertError } = await supabase
        .from('audit_logs_archive')
        .insert(archivedData.map(log => ({ ...log, archived_at: new Date().toISOString() })));
      
      if (!insertError) {
        // حذف من الجدول الأصلي
        const ids = archivedData.map(log => log.id);
        await supabase.from('audit_logs').delete().in('id', ids);
        archivedCount = archivedData.length;
        console.log(`Archived ${archivedCount} audit logs`);
      }
    }

    // 3. تعليم الإشعارات القديمة كمقروءة (أكثر من 3 أيام)
    const { error: notifError } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('is_read', false)
      .lt('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());

    if (notifError) {
      console.error('Notification cleanup error:', notifError);
    }

    // تسجيل في audit_logs
    if (result.total_deleted > 0 || archivedCount > 0) {
      await supabase.from('audit_logs').insert({
        action_type: 'SCHEDULED_CLEANUP',
        table_name: 'multiple',
        description: `تنظيف مجدول: حذف ${result.total_deleted} سجل، أرشفة ${archivedCount} سجل تدقيق`,
        severity: 'info',
      });
    }

    return jsonResponse({
      success: true,
      total_deleted: result.total_deleted,
      archived_audit_logs: archivedCount,
      details: result.details,
      message: `تم التنظيف بنجاح: ${result.total_deleted} سجل محذوف، ${archivedCount} سجل مؤرشف`,
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
