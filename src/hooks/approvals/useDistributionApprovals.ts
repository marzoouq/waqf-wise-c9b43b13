/**
 * useDistributionApprovals Hook
 * Hook لموافقات التوزيعات
 */
import { useQuery } from "@tanstack/react-query";
import { ApprovalService } from "@/services/approval.service";
import { DistributionForApproval } from "@/types/approvals";

export function useDistributionApprovals() {
  return useQuery<DistributionForApproval[]>({
    queryKey: ["distributions_with_approvals"],
    queryFn: () => ApprovalService.getDistributionApprovalsWithDetails(),
  });
}
