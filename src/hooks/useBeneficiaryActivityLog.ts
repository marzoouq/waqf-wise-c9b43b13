import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
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
  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["beneficiary-activity-log", beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) {
        return [];
      }

      // التحقق من وجود المستفيد أولاً
      const { data: beneficiary, error: checkError } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("id", beneficiaryId)
        .maybeSingle();

      if (checkError) {
        productionLogger.error('Error checking beneficiary:', checkError);
        throw new Error('فشل التحقق من المستفيد');
      }

      if (!beneficiary) {
        productionLogger.warn('Beneficiary not found:', { beneficiaryId });
        return [];
      }

      const { data, error: queryError } = await supabase
        .from("beneficiary_activity_log")
        .select("id, beneficiary_id, action_type, action_description, old_values, new_values, performed_by, performed_by_name, ip_address, user_agent, created_at")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (queryError) {
        productionLogger.error('Error fetching activity log:', queryError);
        throw queryError;
      }
      
      return data as BeneficiaryActivity[];
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
