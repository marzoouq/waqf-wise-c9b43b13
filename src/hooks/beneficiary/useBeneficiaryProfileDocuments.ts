/**
 * Hook for beneficiary profile documents
 * نقل منطق البيانات من ProfileDocumentsGallery component
 */
import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { QUERY_CONFIG } from "@/lib/query-keys";

export function useBeneficiaryProfileDocuments(beneficiaryId: string) {
  return useQuery({
    queryKey: ['beneficiary-documents', beneficiaryId],
    queryFn: () => BeneficiaryService.getDocuments(beneficiaryId),
    enabled: !!beneficiaryId,
    staleTime: QUERY_CONFIG.DEFAULT.staleTime,
  });
}
