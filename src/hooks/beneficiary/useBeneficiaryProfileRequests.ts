/**
 * Hook for beneficiary profile requests history
 * نقل منطق البيانات من ProfileRequestsHistory component
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_CONFIG } from "@/lib/query-keys";

export function useBeneficiaryProfileRequests(beneficiaryId: string) {
  return useQuery({
    queryKey: ['beneficiary-requests', beneficiaryId],
    queryFn: () => BeneficiaryService.getRequests(beneficiaryId),
    enabled: !!beneficiaryId,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
