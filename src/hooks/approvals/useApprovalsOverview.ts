/**
 * useApprovalsOverview Hook
 * Hook لإحصائيات نظرة عامة على الموافقات
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService, ApprovalsStats } from "@/services/approval.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export { type ApprovalsStats } from "@/services/approval.service";

export function useApprovalsOverview() {
  return useQuery<ApprovalsStats>({
    queryKey: QUERY_KEYS.APPROVALS,
    queryFn: () => ApprovalService.getOverviewStats(),
  });
}
