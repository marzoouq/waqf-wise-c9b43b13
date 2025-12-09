/**
 * Hook for beneficiary profile statistics
 * نقل منطق البيانات من ProfileStats component
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

export interface BeneficiaryProfileStats {
  totalPayments: number;
  paymentsCount: number;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  attachmentsCount: number;
  familyMembersCount: number;
}

export function useBeneficiaryProfileStats(beneficiaryId: string) {
  return useQuery<BeneficiaryProfileStats>({
    queryKey: [...QUERY_KEYS.BENEFICIARY_STATS, beneficiaryId],
    queryFn: async () => {
      const statistics = await BeneficiaryService.getStatistics(beneficiaryId);
      return {
        totalPayments: statistics?.total_received || 0,
        paymentsCount: statistics?.total_payments || 0,
        totalRequests: statistics?.pending_requests || 0,
        approvedRequests: 0,
        pendingRequests: statistics?.pending_requests || 0,
        attachmentsCount: 0,
        familyMembersCount: 0,
      };
    },
    enabled: !!beneficiaryId,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
