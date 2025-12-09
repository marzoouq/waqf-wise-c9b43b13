/**
 * Nazer Beneficiaries Quick List Hook
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";

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
      return BeneficiaryService.getQuickList(20) as Promise<NazerBeneficiary[]>;
    },
    staleTime: 2 * 60 * 1000,
  });
}
