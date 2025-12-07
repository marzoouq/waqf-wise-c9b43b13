/**
 * useSystemMonitoring Hook
 * إدارة بيانات مراقبة النظام والإحصائيات والتنبيهات
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SystemError, SystemAlert } from "@/types/monitoring";

export interface SystemStats {
  totalErrors: number;
  unresolvedErrors: number;
  criticalErrors: number;
  activeAlerts: number;
  healthyChecks: number;
  totalHealthChecks: number;
  successfulFixes: number;
  totalFixAttempts: number;
}

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
    queryFn: async (): Promise<SystemStats> => {
      const [errorsResult, alertsResult, healthResult] = await Promise.all([
        supabase
          .from("system_error_logs")
          .select("id, severity, status", { count: "exact" }),
        supabase
          .from("system_alerts")
          .select("id, severity, status", { count: "exact" }),
        supabase
          .from("system_health_checks")
          .select("id, status", { count: "exact" })
          .order("checked_at", { ascending: false })
          .limit(100),
      ]);

      const resolvedErrors =
        errorsResult.data?.filter(
          (e) => e.status === "resolved" || e.status === "auto_resolved"
        ).length || 0;

      return {
        totalErrors: errorsResult.count || 0,
        unresolvedErrors:
          errorsResult.data?.filter((e) => e.status === "new").length || 0,
        criticalErrors:
          errorsResult.data?.filter((e) => e.severity === "critical").length ||
          0,
        activeAlerts:
          alertsResult.data?.filter((a) => a.status === "active").length || 0,
        healthyChecks:
          healthResult.data?.filter((h) => h.status === "healthy").length || 0,
        totalHealthChecks: healthResult.count || 0,
        successfulFixes: resolvedErrors,
        totalFixAttempts: resolvedErrors > 0 ? resolvedErrors : 1,
      };
    },
    staleTime: 60 * 1000,
    refetchInterval: false,
  });

  // جلب الأخطاء الأخيرة
  const { data: recentErrors, refetch: refetchErrors } = useQuery({
    queryKey: ["recent-errors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as SystemError[];
    },
    staleTime: 30 * 1000,
    refetchInterval: false,
  });

  // جلب التنبيهات النشطة
  const { data: activeAlerts, refetch: refetchAlerts } = useQuery({
    queryKey: ["active-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SystemAlert[];
    },
    staleTime: 30 * 1000,
    refetchInterval: false,
  });

  // جلب محاولات الإصلاح
  const { data: fixAttempts, refetch: refetchFixes } = useQuery({
    queryKey: ["fix-attempts"],
    queryFn: async (): Promise<FixAttempt[]> => {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select(
          "id, error_type, error_message, severity, status, created_at, resolved_at"
        )
        .in("status", ["resolved", "auto_resolved"])
        .order("resolved_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((e) => ({
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
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("system_alerts")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", alertId);

      if (error) throw error;
    },
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
