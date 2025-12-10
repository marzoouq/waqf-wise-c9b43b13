/**
 * Hook لجلب بيانات شجرة عائلة المستفيد
 * @version 2.8.73 - Refactored to use FamilyService
 */

import { useQuery } from '@tanstack/react-query';
import { FamilyService } from '@/services/family.service';
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryFamilyTree(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_FAMILY(beneficiaryId),
    queryFn: () => FamilyService.getBeneficiaryFamilyTree(beneficiaryId),
    staleTime: 60 * 1000,
  });
}
