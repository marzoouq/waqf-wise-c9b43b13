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
        console.error('Error checking beneficiary:', checkError);
        throw new Error('فشل التحقق من المستفيد');
      }

      if (!beneficiary) {
        console.warn('Beneficiary not found:', beneficiaryId);
        return [];
      }

      const { data, error: queryError } = await supabase
        .from("beneficiary_activity_log")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (queryError) {
        console.error('Error fetching activity log:', queryError);
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
