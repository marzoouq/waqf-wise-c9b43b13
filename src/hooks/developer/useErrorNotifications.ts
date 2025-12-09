/**
 * useErrorNotifications Hook - إشعارات الأخطاء
 * يستخدم RealtimeService و MonitoringService
 */
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SystemErrorLog } from "@/types/system-error";
import { RealtimeService, MonitoringService } from "@/services";

export function useErrorNotifications(enabled: boolean = true) {
  const shownErrorsRef = useRef<Set<string>>(new Set());
  
  const { data: errors } = useQuery({
    queryKey: ["system-errors"],
    queryFn: () => MonitoringService.getRecentErrors(20),
    refetchInterval: enabled ? 60000 : false,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });

  useEffect(() => {
    if (!enabled || !errors || errors.length === 0) return;

    const latestError = errors[0];
    const errorAge = Date.now() - new Date(latestError.created_at).getTime();
    
    if (shownErrorsRef.current.has(latestError.id)) return;
    
    if (errorAge < 30000 && latestError.status?.toLowerCase() !== "resolved") {
      shownErrorsRef.current.add(latestError.id);
      const severity = latestError.severity?.toLowerCase();
      
      if (severity === "critical") {
        toast.error(`خطأ حرج: ${latestError.error_type}`, {
          description: latestError.error_message,
          duration: 10000,
          action: { label: "عرض التفاصيل", onClick: () => window.location.href = "/developer-tools?tab=errors" }
        });
      } else if (severity === "error") {
        toast.warning(`خطأ: ${latestError.error_type}`, {
          description: latestError.error_message,
          duration: 5000,
        });
      }
    }
  }, [errors, enabled]);

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'system_error_logs',
      () => {
        // Just refetch on any change - notification shown via useQuery
      }
    );

    return () => { subscription.unsubscribe(); };
  }, []);

  return { errors };
}
