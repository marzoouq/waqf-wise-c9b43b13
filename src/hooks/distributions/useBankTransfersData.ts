/**
 * Hook for BankTransfers data fetching
 * يجلب التوزيعات المعتمدة للتصدير البنكي
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ApprovedDistribution {
  id: string;
  distribution_date: string;
  total_amount: number;
  status: string;
  distribution_details: {
    beneficiary_id: string;
    allocated_amount: number;
    beneficiaries: {
      full_name: string;
      bank_account_number: string | null;
      iban: string | null;
    };
  }[];
}

export function useBankTransfersData() {
  const {
    data: distributions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["approved-distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select(`
          id,
          distribution_date,
          total_amount,
          status,
          distribution_details!inner(
            beneficiary_id,
            allocated_amount,
            beneficiaries!inner(
              full_name,
              bank_account_number,
              iban
            )
          )
        `)
        .eq("status", "معتمد")
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return data as ApprovedDistribution[];
    },
  });

  return {
    distributions,
    isLoading,
    error,
  };
}
