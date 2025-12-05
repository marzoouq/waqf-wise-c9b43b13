/**
 * Hook for SystemErrorLogs data fetching and mutations
 * يجلب ويحدث سجلات الأخطاء والتنبيهات
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

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
    queryKey: ["system-error-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // جلب التنبيهات النشطة
  const { data: activeAlerts } = useQuery({
    queryKey: ["system-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("system_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // حذف جميع الأخطاء المحلولة
  const deleteResolvedMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("system_error_logs")
        .delete()
        .eq("status", "resolved");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-error-logs"] });
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
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase
        .from("system_error_logs")
        .update({
          status,
          resolved_at: status === "resolved" ? new Date().toISOString() : null,
          resolution_notes: notes,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-error-logs"] });
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
