import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type DbGovernanceDecision = Database['public']['Tables']['governance_decisions']['Row'];
type DbGovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

export function useGovernanceDecisions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: ["governance-decisions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_decisions")
        .select("*")
        .order("decision_date", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createDecision = useMutation({
    mutationFn: async (decision: DbGovernanceDecisionInsert) => {
      const { data, error } = await supabase
        .from("governance_decisions")
        .insert([decision])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-decisions"] });
      toast({
        title: "تم إضافة القرار بنجاح",
        description: "تم إضافة القرار وفتح التصويت عليه",
      });
    },
  });

  const closeVoting = useMutation({
    mutationFn: async ({ decisionId, status }: { decisionId: string; status: 'معتمد' | 'مرفوض' }) => {
      const { error } = await supabase
        .from("governance_decisions")
        .update({
          voting_completed: true,
          decision_status: status,
        })
        .eq("id", decisionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-decisions"] });
      toast({
        title: "تم إغلاق التصويت",
        description: "تم احتساب النتائج وإغلاق التصويت",
      });
    },
  });

  return {
    decisions,
    isLoading,
    createDecision: createDecision.mutateAsync,
    closeVoting: closeVoting.mutateAsync,
  };
}
