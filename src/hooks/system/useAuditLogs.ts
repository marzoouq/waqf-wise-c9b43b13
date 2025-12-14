/**
 * useAuditLogs Hook - سجلات التدقيق
 * يستخدم AuditService
 */
import { useQuery } from "@tanstack/react-query";
import { AuditService } from "@/services";
import type { AuditLogFilters } from "@/types/audit";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.AUDIT_LOGS, filters],
    queryFn: () => AuditService.getLogs(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: false,
  });
};
