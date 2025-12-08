/**
 * useAuditLogs Hook - سجلات التدقيق
 * يستخدم AuditService
 */
import { useQuery } from "@tanstack/react-query";
import { AuditService } from "@/services";
import type { AuditLogFilters } from "@/types/audit";

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: () => AuditService.getLogs(filters),
    staleTime: 2 * 60 * 1000,
    refetchInterval: false,
  });
};
