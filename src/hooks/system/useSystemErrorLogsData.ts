/**
 * Hook for SystemErrorLogs data fetching and mutations
 * يجلب ويحدث سجلات الأخطاء والتنبيهات
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { MonitoringService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";
import type { Database } from "@/integrations/supabase/types";

type SystemErrorRow = Database['public']['Tables']['system_error_logs']['Row'];

export interface ErrorStats {
  total: number;
  new: number;
  investigating: number;
  resolved: number;
  critical: number;
}

export function useSystemErrorLogsData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedError, setSelectedError] = useState<SystemErrorRow | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // جلب سجلات الأخطاء
  const {
    data: errorLogs,
    isLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.SYSTEM_ERROR_LOGS,
    queryFn: () => MonitoringService.getErrorLogs(100),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  // جلب التنبيهات النشطة
  const { data: activeAlerts } = useQuery({
    queryKey: QUERY_KEYS.SYSTEM_ALERTS,
    queryFn: () => MonitoringService.getActiveAlerts(),
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });

  // حذف جميع الأخطاء المحلولة
  const deleteResolvedMutation = useMutation({
    mutationFn: () => MonitoringService.deleteResolvedErrors(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ERROR_LOGS });
      toast({
        title: "تم الحذف",
        description: "تم حذف جميع الأخطاء المحلولة بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في حذف الأخطاء المحلولة",
        variant: "destructive",
      });
    },
  });

  // تحديث حالة الخطأ
  const updateErrorMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      MonitoringService.updateError(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ERROR_LOGS });
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الخطأ بنجاح",
      });
      setSelectedError(null);
      setResolutionNotes("");
    },
  });

  // إحصائيات
  const stats: ErrorStats = {
    total: errorLogs?.length || 0,
    new: errorLogs?.filter((e) => e.status === "new").length || 0,
    investigating: errorLogs?.filter((e) => e.status === "investigating").length || 0,
    resolved: errorLogs?.filter((e) => e.status === "resolved").length || 0,
    critical: errorLogs?.filter((e) => e.severity === "critical").length || 0,
  };

  return {
    errorLogs,
    activeAlerts,
    stats,
    isLoading,
    selectedError,
    setSelectedError,
    resolutionNotes,
    setResolutionNotes,
    deleteResolved: deleteResolvedMutation.mutate,
    isDeleting: deleteResolvedMutation.isPending,
    updateError: updateErrorMutation.mutate,
    isUpdating: updateErrorMutation.isPending,
  };
}
