/**
 * Distribution Tabs Data Hooks - خطافات بيانات تبويبات التوزيعات
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { DistributionService } from "@/services";
import type { 
  DistributionApproval, 
  ApprovalHistoryItem, 
  VoucherRecord, 
  VoucherStats 
} from "@/services/distribution.service";

// ==================== Distribution Timeline Hook ====================
export function useDistributionTimeline(distributionId: string | undefined) {
  const approvalsQuery = useQuery({
    queryKey: ['distribution-timeline-approvals', distributionId],
    queryFn: async (): Promise<DistributionApproval[]> => {
      if (!distributionId) return [];
      return DistributionService.getDistributionApprovals(distributionId);
    },
    enabled: !!distributionId,
  });

  const historyQuery = useQuery({
    queryKey: ['distribution-timeline-history', distributionId],
    queryFn: async (): Promise<ApprovalHistoryItem[]> => {
      if (!distributionId) return [];
      return DistributionService.getDistributionHistory(distributionId);
    },
    enabled: !!distributionId,
  });

  return {
    approvals: approvalsQuery.data,
    history: historyQuery.data,
    isLoading: approvalsQuery.isLoading || historyQuery.isLoading,
  };
}

// ==================== Distribution Vouchers Hook ====================
export function useDistributionVouchers(distributionId: string) {
  const vouchersQuery = useQuery({
    queryKey: ["distribution-vouchers-tab", distributionId],
    queryFn: async (): Promise<VoucherRecord[]> => {
      return DistributionService.getDistributionVouchersWithDetails(distributionId);
    },
  });

  const statsQuery = useQuery({
    queryKey: ["distribution-vouchers-stats-tab", distributionId],
    queryFn: async (): Promise<VoucherStats> => {
      return DistributionService.getDistributionVoucherStats(distributionId);
    },
  });

  return {
    vouchers: vouchersQuery.data,
    stats: statsQuery.data,
    isLoading: vouchersQuery.isLoading,
    refetch: vouchersQuery.refetch,
  };
}

// ==================== Payment Vouchers List Hook ====================
export function usePaymentVouchersList() {
  return useQuery({
    queryKey: ["payment-vouchers-list"],
    queryFn: () => DistributionService.getPaymentVouchersList(),
  });
}

// ==================== Family Members Dialog Hook ====================
export function useFamilyMembersDialog(familyName: string, enabled: boolean) {
  return useQuery({
    queryKey: ["family-members-dialog", familyName],
    queryFn: () => DistributionService.getFamilyMembers(familyName),
    enabled,
  });
}

export type { DistributionApproval, ApprovalHistoryItem, VoucherRecord, VoucherStats };
