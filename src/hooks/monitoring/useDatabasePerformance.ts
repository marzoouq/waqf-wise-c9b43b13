/**
 * Hook لمراقبة أداء قاعدة البيانات
 * Database Performance Monitoring Hook
 */

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { dbPerformanceService, type DBPerformanceStats, type PerformanceAlert } from "@/services/monitoring/db-performance.service";

const REFRESH_INTERVAL = 60000; // 60 ثانية (كان 30)
const QUERY_KEY = 'db-performance-monitoring';
const STALE_TIME = 30000; // 30 ثانية
const GC_TIME = 120000; // دقيقتين

export function useDatabasePerformance() {
  const { 
    data: stats, 
    isLoading, 
    error, 
    refetch,
    dataUpdatedAt,
    isFetching,
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => dbPerformanceService.getPerformanceStats(),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: STALE_TIME, // البيانات صالحة لـ 30 ثانية
    gcTime: GC_TIME, // حفظ في الذاكرة لدقيقتين
    refetchOnWindowFocus: false, // ✅ تقليل الطلبات الزائدة
    refetchOnMount: 'always', // ✅ جلب عند التحميل الأول فقط
  });

  const alerts = useMemo<PerformanceAlert[]>(() => {
    if (!stats) return [];
    return dbPerformanceService.analyzeAlerts(stats);
  }, [stats]);

  const topSequentialScans = useMemo(() => {
    if (!stats?.sequentialScans) return [];
    return [...stats.sequentialScans]
      .filter(t => t.seq_scan > 0)
      .sort((a, b) => b.seq_scan - a.seq_scan)
      .slice(0, 10);
  }, [stats]);

  const connectionsSummary = useMemo(() => {
    if (!stats?.connections) return { active: 0, idle: 0, total: 0 };
    const active = stats.connections.find(c => c.state === 'active')?.count || 0;
    const idle = stats.connections.find(c => c.state === 'idle')?.count || 0;
    return { active, idle, total: active + idle };
  }, [stats]);

  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  return {
    stats,
    isLoading,
    isFetching, // ✅ مفيد للـ UI
    error,
    refetch,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    alerts,
    criticalAlerts,
    warningAlerts,
    topSequentialScans,
    connectionsSummary,
    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
  };
}

export function useSequentialScansOnly() {
  return useQuery({
    queryKey: [QUERY_KEY, 'seq-scans'],
    queryFn: () => dbPerformanceService.getSequentialScansStats(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useCacheHitRatio() {
  return useQuery({
    queryKey: [QUERY_KEY, 'cache-hit'],
    queryFn: () => dbPerformanceService.getCacheHitRatio(),
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
