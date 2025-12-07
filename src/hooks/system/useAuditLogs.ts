import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AuditLog, AuditLogFilters } from "@/types/audit";

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("id, action_type, table_name, description, user_email, created_at, severity")
        .order("created_at", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.tableName) {
        query = query.eq("table_name", filters.tableName);
      }
      if (filters?.actionType) {
        query = query.eq("action_type", filters.actionType);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      const { data, error } = await query.limit(filters ? 100 : 10);

      if (error) throw error;
      return data as AuditLog[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: false, // Disable auto-refetch
  });
};
