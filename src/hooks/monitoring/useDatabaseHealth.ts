/**
 * Hook لمراقبة صحة قاعدة البيانات الشاملة
 * Comprehensive Database Health Monitoring Hook
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { 
  dbHealthService, 
  type DatabaseHealthReport, 
  type HealthAlert 
} from "@/services/monitoring/db-health.service";

const QUERY_KEY = 'database-health';
const REFRESH_INTERVAL = 60000; // 1 minute

export function useDatabaseHealth() {
  const queryClient = useQueryClient();

  const { 
    data: report, 
    isLoading, 
    error, 
    refetch,
    dataUpdatedAt 
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: () => dbHealthService.getHealthReport(),
    refetchInterval: REFRESH_INTERVAL,
    staleTime: 30000,
    gcTime: 120000,
  });

  // Analyze alerts
  const alerts = useMemo<HealthAlert[]>(() => {
    if (!report) return [];
    return dbHealthService.analyzeAlerts(report);
  }, [report]);

  // Filter alerts by type
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');

  // Health score calculation (0-100)
  const healthScore = useMemo(() => {
    if (!report) return 100;
    
    let score = 100;
    
    // Deduct for duplicate indexes (max -20)
    score -= Math.min(report.duplicateIndexes.length * 2, 20);
    
    // Deduct for duplicate policies (max -10)
    score -= Math.min(report.duplicatePolicies.length * 2, 10);
    
    // Deduct for dead rows (max -20)
    if (report.summary.total_dead_rows > 10000) {
      score -= Math.min(Math.floor(report.summary.total_dead_rows / 10000) * 5, 20);
    }
    
    // Deduct for low cache hit (max -15)
    if (report.summary.cache_hit_ratio > 0 && report.summary.cache_hit_ratio < 95) {
      score -= Math.min(Math.floor((95 - report.summary.cache_hit_ratio) * 1.5), 15);
    }
    
    // Deduct for query errors (max -15)
    score -= Math.min(report.queryErrors.length * 3, 15);
    
    // Deduct for tables needing vacuum (max -10)
    const tablesNeedingVacuum = report.deadRowsInfo.filter(t => t.dead_pct > 50).length;
    score -= Math.min(tablesNeedingVacuum * 2, 10);
    
    return Math.max(score, 0);
  }, [report]);

  // Get health status
  const healthStatus = useMemo(() => {
    if (healthScore >= 90) return 'excellent';
    if (healthScore >= 75) return 'good';
    if (healthScore >= 50) return 'warning';
    return 'critical';
  }, [healthScore]);

  // Vacuum all mutation
  const vacuumAllMutation = useMutation({
    mutationFn: () => dbHealthService.runVacuumAll(),
    onSuccess: (success) => {
      if (success) {
        toast.success('تم تشغيل VACUUM ANALYZE بنجاح');
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      } else {
        toast.error('فشل في تشغيل VACUUM ANALYZE');
      }
    },
    onError: (error) => {
      toast.error(`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    },
  });

  // Vacuum single table mutation
  const vacuumTableMutation = useMutation({
    mutationFn: (tableName: string) => dbHealthService.runVacuumTable(tableName),
    onSuccess: (success, tableName) => {
      if (success) {
        toast.success(`تم تشغيل VACUUM على جدول ${tableName}`);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      } else {
        toast.error(`فشل في تشغيل VACUUM على ${tableName}`);
      }
    },
    onError: (error) => {
      toast.error(`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    },
  });

  return {
    report,
    isLoading,
    error,
    refetch,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    
    // Alerts
    alerts,
    criticalAlerts,
    warningAlerts,
    hasAlerts: alerts.length > 0,
    hasCriticalAlerts: criticalAlerts.length > 0,
    
    // Health metrics
    healthScore,
    healthStatus,
    
    // Actions
    runVacuumAll: vacuumAllMutation.mutate,
    isRunningVacuumAll: vacuumAllMutation.isPending,
    runVacuumTable: vacuumTableMutation.mutate,
    isRunningVacuumTable: vacuumTableMutation.isPending,
  };
}
