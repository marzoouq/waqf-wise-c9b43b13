/**
 * useLivePerformance Hook
 * هوك لجلب إحصائيات الأداء الحية
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceMonitoringService, LivePerformanceStats } from "@/services/monitoring/performance-monitoring.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useLivePerformance() {
  const queryClient = useQueryClient();

  // جلب البيانات عبر Service
  const query = useQuery({
    queryKey: QUERY_KEYS.LIVE_PERFORMANCE,
    queryFn: () => PerformanceMonitoringService.getLiveStats(),
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // اشتراك Realtime للتحديثات الفورية (مقبول معمارياً في hooks)
  useEffect(() => {
    const channel = supabase
      .channel("live-performance")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "audit_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIVE_PERFORMANCE });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_error_logs" },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.LIVE_PERFORMANCE });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export type { LivePerformanceStats };
