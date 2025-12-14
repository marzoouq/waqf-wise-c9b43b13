/**
 * Hook for PerformanceDashboard data fetching
 * يجلب مقاييس الأداء والاستعلامات البطيئة
 */

import { useQuery } from "@tanstack/react-query";
import { MonitoringService, type PerformanceMetric, type SlowQueryLog } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { PerformanceMetric, SlowQueryLog };

export interface LatestMetrics {
  pageLoad: number;
  apiResponse: number;
  dbQuery: number;
  memoryUsage: number;
}

export function usePerformanceMetrics() {
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.PERFORMANCE_METRICS_DATA,
    queryFn: () => MonitoringService.getPerformanceMetricsData(),
  });

  const metrics = data?.metrics || [];
  const slowQueries = data?.slowQueries || [];

  const latestMetrics: LatestMetrics = {
    pageLoad: metrics.find(m => m.metric_name === 'page_load_time')?.value || 0,
    apiResponse: metrics.find(m => m.metric_name === 'api_response_time')?.value || 0,
    dbQuery: metrics.find(m => m.metric_name === 'database_query_time')?.value || 0,
    memoryUsage: metrics.find(m => m.metric_name === 'memory_usage')?.value || 0,
  };

  return {
    metrics,
    slowQueries,
    latestMetrics,
    isLoading,
  };
}
