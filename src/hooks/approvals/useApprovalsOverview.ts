/**
 * useApprovalsOverview Hook
 * Hook لإحصائيات نظرة عامة على الموافقات
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService, ApprovalsStats } from "@/services/approval.service";

export { type ApprovalsStats } from "@/services/approval.service";

export function useApprovalsOverview() {
  return useQuery<ApprovalsStats>({
    queryKey: ["approvals_overview"],
    queryFn: () => ApprovalService.getOverviewStats(),
  });
}
