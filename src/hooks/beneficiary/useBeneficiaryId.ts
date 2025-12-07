/**
 * useBeneficiaryId Hook
 * Hook موحد لجلب beneficiary_id للمستخدم الحالي
 * يمنع تكرار نفس الاستعلام في كل hook
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBeneficiaryId() {
  const { user } = useAuth();

  const { data: beneficiaryId, isLoading, error } = useQuery({
    queryKey: ["beneficiary-id", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data?.id || null;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - لا يتغير كثيراً
  });

  return {
    beneficiaryId,
    isLoading,
    error,
    hasId: !!beneficiaryId,
  };
}
