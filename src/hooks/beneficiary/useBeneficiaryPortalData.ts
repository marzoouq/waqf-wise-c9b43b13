/**
 * Hook for BeneficiaryPortal data fetching
 * يجلب بيانات المستفيد والإحصائيات
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BeneficiaryStatistics {
  total_received: number;
  pending_amount: number;
  total_requests: number;
  pending_requests: number;
}

export function useBeneficiaryPortalData() {
  // جلب بيانات المستفيد الحالي
  const {
    data: beneficiary,
    isLoading: beneficiaryLoading,
    error: beneficiaryError,
  } = useQuery({
    queryKey: ["current-beneficiary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // جلب الإحصائيات
  const {
    data: statistics,
    isLoading: statisticsLoading,
  } = useQuery({
    queryKey: ["beneficiary-statistics", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return null;
      
      const { data, error } = await supabase
        .rpc('get_beneficiary_statistics', { p_beneficiary_id: beneficiary.id });

      if (error) throw error;
      return data as unknown as BeneficiaryStatistics | null;
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
