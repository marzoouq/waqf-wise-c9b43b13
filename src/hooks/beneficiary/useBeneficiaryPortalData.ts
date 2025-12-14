/**
 * Hook for BeneficiaryPortal data fetching
 * يجلب بيانات المستفيد والإحصائيات
 * يدعم وضع المعاينة للناظر
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams } from "react-router-dom";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BeneficiaryStatistics {
  total_received: number;
  pending_amount: number;
  total_requests: number;
  pending_requests: number;
}

export function useBeneficiaryPortalData() {
  const { user, hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  
  // التحقق من وضع المعاينة
  const isPreviewMode = searchParams.get("preview") === "true";
  const previewBeneficiaryId = searchParams.get("beneficiary_id");
  
  // هل المستخدم ناظر أو مسؤول في وضع المعاينة؟
  const isNazerPreview = isPreviewMode && previewBeneficiaryId && (hasRole("nazer") || hasRole("admin"));

  // جلب بيانات المستفيد الحالي
  const {
    data: beneficiary,
    isLoading: beneficiaryLoading,
    error: beneficiaryError,
    refetch,
  } = useQuery({
    queryKey: isNazerPreview 
      ? ['preview-beneficiary', previewBeneficiaryId] 
      : QUERY_KEYS.CURRENT_BENEFICIARY(user?.id),
    queryFn: async () => {
      // وضع المعاينة للناظر
      if (isNazerPreview && previewBeneficiaryId) {
        return BeneficiaryService.getById(previewBeneficiaryId);
      }
      // الوضع العادي للمستفيد
      if (!user?.id) throw new Error("غير مصرح");
      return BeneficiaryService.getByUserId(user.id);
    },
    enabled: isNazerPreview ? !!previewBeneficiaryId : !!user?.id,
  });

  // جلب الإحصائيات
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_STATISTICS(beneficiary?.id),
    queryFn: async () => {
      if (!beneficiary?.id) return null;
      const result = await BeneficiaryService.getStatisticsRPC(beneficiary.id);
      return result as unknown as BeneficiaryStatistics | null;
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
    isPreviewMode: isNazerPreview,
    refetch,
  };
}
