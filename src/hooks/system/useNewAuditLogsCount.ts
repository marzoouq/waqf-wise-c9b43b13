/**
 * useNewAuditLogsCount Hook - عدد السجلات الجديدة للـ Badge
 * @version 1.0.0
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

/**
 * جلب عدد السجلات الجديدة منذ آخر 24 ساعة
 */
export const useNewAuditLogsCount = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'new-count'],
    queryFn: async (): Promise<number> => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { count, error } = await supabase
        .from("audit_logs")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", yesterday.toISOString());

      if (error) throw error;
      return count || 0;
    },
    staleTime: 60 * 1000, // 1 دقيقة
    refetchInterval: 2 * 60 * 1000, // كل دقيقتين
  });
};

/**
 * جلب عدد السجلات الحرجة الجديدة
 */
export const useCriticalAuditLogsCount = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'critical-count'],
    queryFn: async (): Promise<number> => {
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const { count, error } = await supabase
        .from("audit_logs")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", yesterday.toISOString())
        .in("severity", ['critical', 'error']);

      if (error) throw error;
      return count || 0;
    },
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
};
