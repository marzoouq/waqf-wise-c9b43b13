/**
 * Hook for PerformanceDashboard data fetching
 * يجلب مقاييس الأداء والاستعلامات البطيئة
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PerformanceMetric, SlowQueryLog } from "@/types/performance";

export interface LatestMetrics {
  pageLoad: number;
  apiResponse: number;
  dbQuery: number;
  memoryUsage: number;
}

export function usePerformanceMetrics() {
  const {
    data: metrics = [],
    isLoading: metricsLoading,
  } = useQuery({
    queryKey: ["performance-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as PerformanceMetric[];
    },
  });

  const {
    data: slowQueries = [],
    isLoading: queriesLoading,
  } = useQuery({
    queryKey: ["slow-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slow_query_log")
        .select("*")
        .order("execution_time_ms", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SlowQueryLog[];
    },
  });

  const latestMetrics: LatestMetrics = {
    pageLoad: metrics.find(m => m.metric_name === 'page_load_time')?.metric_value || 0,
    apiResponse: metrics.find(m => m.metric_name === 'api_response_time')?.metric_value || 0,
    dbQuery: metrics.find(m => m.metric_name === 'database_query_time')?.metric_value || 0,
    memoryUsage: metrics.find(m => m.metric_name === 'memory_usage')?.metric_value || 0,
  };

  return {
    metrics,
    slowQueries,
    latestMetrics,
    isLoading: metricsLoading || queriesLoading,
  };
}
