/**
 * Nazer Beneficiaries Quick List Hook
 * @version 2.8.39
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NazerBeneficiary {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  status: string;
  category: string;
  total_received: number | null;
  account_balance: number | null;
  national_id: string;
}

export function useNazerBeneficiariesQuick() {
  return useQuery({
    queryKey: ["nazer-beneficiaries-quick"],
    queryFn: async (): Promise<NazerBeneficiary[]> => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, phone, email, status, category, total_received, account_balance, national_id")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []) as NazerBeneficiary[];
    },
    staleTime: 2 * 60 * 1000,
  });
}
