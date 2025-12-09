/**
 * useDistributionApprovals Hook
 * Hook لموافقات التوزيعات
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { DistributionForApproval } from "@/types/approvals";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useDistributionApprovals() {
  return useQuery<DistributionForApproval[]>({
    queryKey: QUERY_KEYS.DISTRIBUTIONS_WITH_APPROVALS,
    queryFn: () => ApprovalService.getDistributionApprovalsWithDetails(),
  });
}
