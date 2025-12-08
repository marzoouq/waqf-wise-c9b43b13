/**
 * useSystemMonitoring Hook
 * إدارة بيانات مراقبة النظام والإحصائيات والتنبيهات
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MonitoringService, type SystemStats } from "@/services";

export type { SystemStats };

export interface FixAttempt {
  id: string;
  fix_strategy: string;
  attempt_number: number;
  max_attempts: number;
  status: string;
  result: string;
  created_at: string;
}

export function useSystemMonitoring() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب إحصائيات عامة
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["system-stats"],
    queryFn: () => MonitoringService.getSystemStats(),
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  // جلب الأخطاء الأخيرة
  const { data: recentErrors, refetch: refetchErrors } = useQuery({
    queryKey: ["recent-errors"],
    queryFn: () => MonitoringService.getRecentErrors(10),
    staleTime: 30 * 1000,
    refetchInterval: false,
  });

  // جلب التنبيهات النشطة
  const { data: activeAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["active-alerts"],
    queryFn: () => MonitoringService.getActiveAlerts(),
    staleTime: 30 * 1000,
    refetchInterval: false,
  });

  // جلب محاولات الإصلاح
  const { data: fixAttempts, refetch: refetchFixes } = useQuery({
    queryKey: ["fix-attempts"],
    queryFn: async (): Promise<FixAttempt[]> => {
      const errors = await MonitoringService.getRecentErrors(20);
      const resolved = errors.filter(e => e.status === "resolved" || e.status === "auto_resolved");
      return resolved.map((e) => ({
        id: e.id,
        fix_strategy: e.status === "auto_resolved" ? "auto" : "manual",
        attempt_number: 1,
        max_attempts: 1,
        status: "success",
        result: `تم حل ${e.error_type}`,
        created_at: e.resolved_at || e.created_at,
      }));
    },
    staleTime: 30 * 1000,
    refetchInterval: false,
  });

  // حل تنبيه
  const resolveAlertMutation = useMutation({
    mutationFn: (alertId: string) => MonitoringService.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["system-stats"] });
      toast({ title: "تم حل التنبيه بنجاح" });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تحديث جميع البيانات
  const refreshAllData = () => {
    refetchStats();
    refetchErrors();
    refetchAlerts();
    refetchFixes();
  };

  // حساب نسب الصحة
  const healthPercentage =
    stats && stats.totalHealthChecks > 0
      ? Math.round((stats.healthyChecks / stats.totalHealthChecks) * 100)
      : 0;

  const fixSuccessRate =
    stats && stats.totalFixAttempts > 0
      ? Math.round((stats.successfulFixes / stats.totalFixAttempts) * 100)
      : 0;

  return {
    // البيانات
    stats,
    recentErrors,
    activeAlerts,
    fixAttempts,
    
    // الحالة
    statsLoading,
    
    // النسب المحسوبة
    healthPercentage,
    fixSuccessRate,

    // العمليات
    resolveAlert: resolveAlertMutation.mutate,
    isResolvingAlert: resolveAlertMutation.isPending,
    refreshAllData,
  };
}
