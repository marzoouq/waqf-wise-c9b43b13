import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import type { Database } from "@/integrations/supabase/types";

type DbGovernanceDecision = Database['public']['Tables']['governance_decisions']['Row'];
type DbGovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

export function useGovernanceDecisions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decisions = [], isLoading, error } = useQuery({
    queryKey: ["governance-decisions"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("governance_decisions")
          .select("*")
          .order("decision_date", { ascending: false });
        
        if (error) {
          console.error('Error fetching governance decisions:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Error in governance decisions query:', error);
        throw error;
      }
    },
    retry: 2,
  });

  const createDecision = useMutation({
    mutationFn: async (decision: DbGovernanceDecisionInsert) => {
      try {
        const { data, error } = await supabase
          .from("governance_decisions")
          .insert([decision])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating decision:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in create decision mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-decisions"] });
      toast({
        title: "تم إضافة القرار بنجاح",
        description: "تم إضافة القرار وفتح التصويت عليه",
      });
    },
    onError: (error) => {
      console.error('Create decision mutation error:', error);
      toast({
        title: "خطأ في إضافة القرار",
        description: "حدث خطأ أثناء إضافة القرار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const closeVoting = useMutation({
    mutationFn: async ({ decisionId, status }: { decisionId: string; status: 'معتمد' | 'مرفوض' }) => {
      try {
        const { error } = await supabase
          .from("governance_decisions")
          .update({
            voting_completed: true,
            decision_status: status,
          })
          .eq("id", decisionId);
        
        if (error) {
          console.error('Error closing voting:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in close voting mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-decisions"] });
      toast({
        title: "تم إغلاق التصويت",
        description: "تم احتساب النتائج وإغلاق التصويت",
      });
    },
    onError: (error) => {
      console.error('Close voting mutation error:', error);
      toast({
        title: "خطأ في إغلاق التصويت",
        description: "حدث خطأ أثناء إغلاق التصويت، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  return {
    decisions,
    isLoading,
    error,
    createDecision: createDecision.mutateAsync,
    closeVoting: closeVoting.mutateAsync,
  };
}
