import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action_type: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  created_at: string;
}

export const useAuditLogs = (filters?: {
  userId?: string;
  tableName?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  severity?: string;
}) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs" as any)
        .select("*")
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

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as unknown as AuditLog[];
    },
  });
};
