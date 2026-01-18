/**
 * useAuditLogsEnhanced Hook - سجلات التدقيق المحسّنة
 * @version 1.0.0
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export interface EnhancedAuditLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action_type: string;
  table_name: string | null;
  record_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  description: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  session_id: string | null;
  request_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditLogsStats {
  totalLogs: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  criticalCount: number;
  warningCount: number;
  uniqueUsers: number;
  affectedTables: string[];
}

export interface EnhancedAuditFilters {
  userId?: string;
  userEmail?: string;
  tableName?: string;
  actionType?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * جلب سجلات التدقيق المحسّنة مع جميع التفاصيل
 */
export const useAuditLogsEnhanced = (filters?: EnhancedAuditFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'enhanced', filters],
    queryFn: async (): Promise<EnhancedAuditLog[]> => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.userEmail) {
        query = query.ilike("user_email", `%${filters.userEmail}%`);
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
      if (filters?.search) {
        query = query.or(`description.ilike.%${filters.search}%,table_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;
      return (data || []) as EnhancedAuditLog[];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
};

/**
 * جلب إحصائيات سجلات التدقيق
 */
export const useAuditLogsStats = (dateRange?: { start: string; end: string }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'stats', dateRange],
    queryFn: async (): Promise<AuditLogsStats> => {
      let query = supabase
        .from("audit_logs")
        .select("action_type, severity, table_name, user_email");

      if (dateRange?.start) {
        query = query.gte("created_at", dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte("created_at", dateRange.end);
      }

      // ADR-004: Max limit is 500 without pagination
      const { data, error, count } = await query.limit(500);

      if (error) throw error;

      const logs = data || [];
      const uniqueUsers = new Set(logs.map(l => l.user_email).filter(Boolean));
      const affectedTables = [...new Set(logs.map(l => l.table_name).filter(Boolean))] as string[];

      return {
        totalLogs: logs.length,
        insertCount: logs.filter(l => l.action_type === 'INSERT').length,
        updateCount: logs.filter(l => l.action_type === 'UPDATE').length,
        deleteCount: logs.filter(l => l.action_type === 'DELETE').length,
        criticalCount: logs.filter(l => l.severity === 'critical').length,
        warningCount: logs.filter(l => l.severity === 'warning').length,
        uniqueUsers: uniqueUsers.size,
        affectedTables,
      };
    },
    staleTime: 60 * 1000,
  });
};

/**
 * جلب سجل واحد مع التفاصيل الكاملة
 */
export const useAuditLogDetails = (logId: string | null) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'details', logId],
    queryFn: async (): Promise<EnhancedAuditLog | null> => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (error) throw error;
      return data as EnhancedAuditLog;
    },
    enabled: !!logId,
  });
};

/**
 * جلب الجداول المتاحة للفلترة
 */
export const useAuditLogTables = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'tables'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("table_name")
        .not("table_name", "is", null)
        .limit(1000);

      if (error) throw error;

      const tables = [...new Set(data?.map(d => d.table_name).filter(Boolean))] as string[];
      return tables.sort();
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * جلب المستخدمين المتاحين للفلترة
 */
export const useAuditLogUsers = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, 'users'],
    queryFn: async (): Promise<Array<{ email: string; count: number }>> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("user_email")
        .not("user_email", "is", null)
        .limit(200);

      if (error) throw error;

      const userCounts = new Map<string, number>();
      data?.forEach(d => {
        if (d.user_email) {
          userCounts.set(d.user_email, (userCounts.get(d.user_email) || 0) + 1);
        }
      });

      return Array.from(userCounts.entries())
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60 * 1000,
  });
};
