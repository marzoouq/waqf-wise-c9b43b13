/**
 * Hook for DecisionDetails data fetching
 * يجلب تفاصيل قرار حوكمي محدد
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];

export function useGovernanceDecisionDetails(decisionId: string | undefined) {
  const {
    data: decision,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["governance-decision", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("id", decisionId!)
        .single();

      if (error) throw error;
      return data as GovernanceDecisionRow;
    },
    enabled: !!decisionId,
  });

  return {
    decision,
    isLoading,
    error,
  };
}
