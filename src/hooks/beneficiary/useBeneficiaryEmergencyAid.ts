/**
 * useBeneficiaryEmergencyAid Hook
 * Hook لجلب طلبات الفزعات الطارئة للمستفيد الحالي
 */

import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { useBeneficiaryId } from "./useBeneficiaryId";
import { EmergencyAid } from "@/types/loans";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaryEmergencyAid() {
  const { beneficiaryId, isLoading: idLoading } = useBeneficiaryId();

  const { data: emergencyAids = [], isLoading: aidsLoading } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_EMERGENCY_AID(beneficiaryId),
    queryFn: async () => {
      if (!beneficiaryId) return [];
      return await BeneficiaryService.getEmergencyAid(beneficiaryId) as EmergencyAid[];
    },
    enabled: !!beneficiaryId,
  });

  // Calculate total aid amount
  const totalAidAmount = emergencyAids.reduce((sum, aid) => sum + (aid.amount || 0), 0);

  return {
    emergencyAids,
    totalAidAmount,
    isLoading: idLoading || aidsLoading,
    hasEmergencyAid: emergencyAids.length > 0,
  };
}
