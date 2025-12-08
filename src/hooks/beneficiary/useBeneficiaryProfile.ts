/**
 * useBeneficiaryProfile Hook
 * Hook محسّن لجلب بيانات المستفيد باستخدام React Query
 */

import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { Beneficiary } from "@/types/beneficiary";

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  description: string;
}

interface BeneficiaryProfileData {
  beneficiary: Beneficiary | null;
  payments: Payment[];
}

export const useBeneficiaryProfile = (userId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["beneficiary-profile", userId],
    queryFn: async (): Promise<BeneficiaryProfileData> => {
      if (!userId) {
        return { beneficiary: null, payments: [] };
      }

      const result = await BeneficiaryService.getProfile(userId);
      return {
        beneficiary: result.beneficiary as Beneficiary,
        payments: result.payments as Payment[],
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    beneficiary: data?.beneficiary || null,
    payments: data?.payments || [],
    loading: isLoading,
    error,
  };
};
