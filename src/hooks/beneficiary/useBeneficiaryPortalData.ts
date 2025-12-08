/**
 * Hook for BeneficiaryPortal data fetching
 * يجلب بيانات المستفيد والإحصائيات
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { BeneficiaryService } from "@/services";

export interface BeneficiaryStatistics {
  total_received: number;
  pending_amount: number;
  total_requests: number;
  pending_requests: number;
}

export function useBeneficiaryPortalData() {
  const { user } = useAuth();

  // جلب بيانات المستفيد الحالي
  const {
    data: beneficiary,
    isLoading: beneficiaryLoading,
    error: beneficiaryError,
  } = useQuery({
    queryKey: ["current-beneficiary", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("غير مصرح");
      return BeneficiaryService.getByUserId(user.id);
    },
    enabled: !!user?.id,
  });

  // جلب الإحصائيات
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useQuery({
    queryKey: ["beneficiary-statistics", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return null;
      const result = await BeneficiaryService.getStatisticsRPC(beneficiary.id);
      return result as unknown as BeneficiaryStatistics | null;
    },
    enabled: !!beneficiary?.id,
  });
    },
    enabled: !!beneficiary?.id,
  });

  const stats: BeneficiaryStatistics = statistics || {
    total_received: 0,
    pending_amount: 0,
    total_requests: 0,
    pending_requests: 0,
  };

  return {
    beneficiary,
    statistics: stats,
    isLoading: beneficiaryLoading,
    isStatisticsLoading: statisticsLoading,
    error: beneficiaryError,
  };
}
