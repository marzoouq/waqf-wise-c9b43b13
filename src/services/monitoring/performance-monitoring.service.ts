/**
 * Performance Monitoring Service
 * خدمة مراقبة الأداء الحي
 */

import { supabase } from "@/integrations/supabase/client";

export interface LivePerformanceStats {
  requests: number;
  errors: number;
  activeUsers: number;
}

export const PerformanceMonitoringService = {
  /**
   * جلب إحصائيات الأداء الحية من آخر ساعة
   */
  async getLiveStats(): Promise<LivePerformanceStats> {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const [
      { count: requestsCount },
      { count: errorsCount },
      { count: usersCount },
    ] = await Promise.all([
      supabase
        .from("audit_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", hourAgo),
      supabase
        .from("system_error_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", hourAgo),
      supabase
        .from("beneficiary_sessions")
        .select("*", { count: "exact", head: true })
        .eq("is_online", true),
    ]);

    return {
      requests: requestsCount || 0,
      errors: errorsCount || 0,
      activeUsers: usersCount || 0,
    };
  },
};
