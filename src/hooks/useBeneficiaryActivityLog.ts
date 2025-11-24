import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

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
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["beneficiary-activity-log", beneficiaryId],
    queryFn: async () => {
      let query = supabase
        .from("beneficiary_activity_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (beneficiaryId) {
        query = query.eq("beneficiary_id", beneficiaryId);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      return data as BeneficiaryActivity[];
    },
    enabled: !!beneficiaryId,
  });

  return {
    activities,
    isLoading,
  };
}
