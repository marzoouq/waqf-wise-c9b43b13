import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Json } from "@/integrations/supabase/types";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BeneficiaryActivity {
  id: string;
  beneficiary_id: string;
  action_type: string;
  action_description: string;
  old_values?: Json;
  new_values?: Json;
  performed_by?: string;
  performed_by_name?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export function useBeneficiaryActivityLog(beneficiaryId?: string) {
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_ACTIVITY_LOG(beneficiaryId),
    queryFn: async () => {
      if (!beneficiaryId) return [];
      return await BeneficiaryService.getActivity(beneficiaryId) as BeneficiaryActivity[];
    },
    enabled: !!beneficiaryId,
    retry: 1,
  });

  return {
    activities,
    isLoading,
    error,
  };
}
