/**
 * System Health Live Stats Hook
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemHealthStats {
  totalErrors: number;
  newErrors: number;
  criticalErrors: number;
  highErrors: number;
  resolvedErrors: number;
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  resolvedAlerts: number;
  resolutionRate: number;
  healthScore: number;
  fixSuccessRate: number;
  successfulFixes: number;
  failedFixes: number;
}

export function useSystemHealthLive() {
  return useQuery({
    queryKey: ["system-health-live"],
    queryFn: async (): Promise<SystemHealthStats> => {
      const now = new Date();
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [errorsResult, alertsResult] = await Promise.all([
        supabase
          .from("system_error_logs")
          .select("id, severity, status, created_at", { count: "exact" })
          .gte("created_at", last7d),
        supabase
          .from("system_alerts")
          .select("id, severity, status, created_at", { count: "exact" })
          .gte("created_at", last7d),
      ]);

      const errors = errorsResult.data || [];
      const alerts = alertsResult.data || [];

      const resolvedCount = errors.filter(e => e.status === "resolved" || e.status === "auto_resolved").length;
      const resolvedAlerts = alerts.filter(a => a.status === "resolved").length;
      const totalErrors = errorsResult.count || 0;
      
      const resolutionRate = totalErrors > 0 
        ? Math.round((resolvedCount / totalErrors) * 100) 
        : 100;
      
      const criticalErrors = errors.filter(e => e.severity === "critical" && e.status === "new").length;
      const highErrors = errors.filter(e => e.severity === "high" && e.status === "new").length;
      const activeAlerts = alerts.filter(a => a.status === "active").length;
      const criticalAlerts = alerts.filter(a => a.severity === "critical" && a.status === "active").length;
      const highAlerts = alerts.filter(a => a.severity === "high" && a.status === "active").length;
      
      // Calculate fix success rate based on resolved errors
      const totalResolvable = errors.filter(e => e.status !== "new").length;
      const successfulFixes = resolvedCount;
      const failedFixes = Math.max(0, totalResolvable - resolvedCount);
      const fixSuccessRate = totalResolvable > 0 ? Math.round((successfulFixes / totalResolvable) * 100) : 100;
      
      const healthScore = Math.max(0, 100 - (criticalErrors * 20) - (highErrors * 10) - (activeAlerts * 5));

      return {
        totalErrors,
        newErrors: errors.filter(e => e.status === "new").length,
        criticalErrors,
        highErrors,
        resolvedErrors: resolvedCount,
        totalAlerts: alertsResult.count || 0,
        activeAlerts,
        criticalAlerts,
        highAlerts,
        resolvedAlerts,
        resolutionRate,
        healthScore,
        fixSuccessRate,
        successfulFixes,
        failedFixes,
      };
    },
  });
}
