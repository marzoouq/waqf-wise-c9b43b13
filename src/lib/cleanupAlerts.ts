/**
 * نظام تنظيف تلقائي للتنبيهات
 * يتم استدعاؤه دورياً لتنظيف التنبيهات القديمة والمكررة
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';

export interface CleanupStats {
  deletedAlerts: number;
  mergedDuplicates: number;
  trimmedActive: number;
  errors: string[];
}

/**
 * تنظيف شامل للتنبيهات
 */
export async function cleanupAlerts(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    deletedAlerts: 0,
    mergedDuplicates: 0,
    trimmedActive: 0,
    errors: [],
  };

  try {
    // 1. حذف التنبيهات المحلولة القديمة (أكثر من 24 ساعة)
    const { error: deleteError, count: deletedCount } = await supabase
      .from('system_alerts')
      .delete({ count: 'exact' })
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .in('status', ['resolved', 'acknowledged']);

    if (deleteError) {
      stats.errors.push(`Error deleting old alerts: ${deleteError.message}`);
    } else {
      stats.deletedAlerts = deletedCount || 0;
    }

    // 2. تحديث التنبيهات المتعلقة بـ useAuth
    const { error: updateError } = await supabase
      .from('system_alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: 'system_auto_fix',
      })
      .like('description', '%useAuth must be used%')
      .neq('status', 'resolved');

    if (updateError) {
      stats.errors.push(`Error updating useAuth alerts: ${updateError.message}`);
    }

    // 3. حذف الأخطاء المكررة القديمة من error_logs
    const { error: errorLogError } = await supabase
      .from('system_error_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq('status', 'resolved');

    if (errorLogError) {
      stats.errors.push(`Error deleting old error logs: ${errorLogError.message}`);
    }

    // 4. الحد من عدد التنبيهات النشطة إلى 100
    const { data: activeAlerts, error: activeError } = await supabase
      .from('system_alerts')
      .select('id')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (activeError) {
      stats.errors.push(`Error fetching active alerts: ${activeError.message}`);
    } else if (activeAlerts && activeAlerts.length > 100) {
      const idsToDelete = activeAlerts.slice(100).map((a) => a.id);
      const { error: trimError, count: trimCount } = await supabase
        .from('system_alerts')
        .delete({ count: 'exact' })
        .in('id', idsToDelete);

      if (trimError) {
        stats.errors.push(`Error trimming alerts: ${trimError.message}`);
      } else {
        stats.trimmedActive = trimCount || 0;
      }
    }

    return stats;
  } catch (error) {
    stats.errors.push(`Unexpected error: ${error}`);
    return stats;
  }
}

import type { LocalErrorLog } from '@/types/error-log';

/**
 * تنظيف localStorage من الأخطاء القديمة
 */
export function cleanupLocalStorageErrors(): number {
  try {
    const errorLogsKey = 'error_logs';
    const errorLogs = localStorage.getItem(errorLogsKey);
    
    if (!errorLogs) return 0;

    const logs: LocalErrorLog[] = JSON.parse(errorLogs);
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 ساعة
    
    const recentLogs = logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime > cutoffTime;
    });

    // الاحتفاظ بآخر 50 خطأ فقط
    const trimmedLogs = recentLogs.slice(-50);
    
    localStorage.setItem(errorLogsKey, JSON.stringify(trimmedLogs));
    
    return logs.length - trimmedLogs.length;
  } catch (error) {
    productionLogger.error('Error cleaning localStorage', error);
    return 0;
  }
}

/**
 * تشغيل تنظيف شامل
 */
export async function runFullCleanup(): Promise<CleanupStats & { localStorageDeleted: number }> {
  const alertStats = await cleanupAlerts();
  const localStorageDeleted = cleanupLocalStorageErrors();

  return {
    ...alertStats,
    localStorageDeleted,
  };
}
