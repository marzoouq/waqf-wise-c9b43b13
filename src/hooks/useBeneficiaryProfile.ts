import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

/**
 * Hook محسّن لجلب بيانات المستفيد باستخدام React Query
 * يستبدل useBeneficiaryData القديم
 */
export const useBeneficiaryProfile = (userId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["beneficiary-profile", userId],
    queryFn: async (): Promise<BeneficiaryProfileData> => {
      if (!userId) {
        return { beneficiary: null, payments: [] };
      }

      // جلب بيانات المستفيد
      const { data: beneficiaryData, error: beneficiaryError } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (beneficiaryError) throw beneficiaryError;
      if (!beneficiaryData) {
        throw new Error("لم يتم العثور على حساب مستفيد");
      }

      // جلب المدفوعات
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("id, payment_number, payment_date, amount, description")
        .eq("beneficiary_id", beneficiaryData.id)
        .order("payment_date", { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      return {
        beneficiary: beneficiaryData as Beneficiary,
        payments: (paymentsData || []) as Payment[],
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
  });

  return {
    beneficiary: data?.beneficiary || null,
    payments: data?.payments || [],
    loading: isLoading,
    error,
  };
};
