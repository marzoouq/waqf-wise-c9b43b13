import { useEffect, useState, useCallback } from 'react';
import { autoPerformanceMonitor, PerformanceStats } from '@/services/monitoring/auto-performance-monitor.service';

/**
 * Hook لمراقبة الأداء التلقائي
 */
export function useAutoPerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats>({
    avg: 0,
    max: 0,
    min: 0,
    count: 0,
    slowCount: 0,
    threshold: 200
  });

  const refreshStats = useCallback(() => {
    setStats(autoPerformanceMonitor.getStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStats, 10000);
    refreshStats();

    return () => clearInterval(interval);
  }, [refreshStats]);

  const measureOperation = useCallback(
    async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
      const result = await autoPerformanceMonitor.measureOperation(name, operation);
      refreshStats();
      return result;
    },
    [refreshStats]
  );

  return {
    stats,
    measureOperation,
    refreshStats,
    clearMetrics: () => {
      autoPerformanceMonitor.clearMetrics();
      refreshStats();
    }
  };
}
