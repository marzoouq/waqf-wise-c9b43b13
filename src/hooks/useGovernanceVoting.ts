import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import type { GovernanceVote, VoteType } from "@/types/governance";

export function useGovernanceVoting(decisionId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: votes = [], isLoading } = useQuery({
    queryKey: ["governance-votes", decisionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("governance_votes")
        .select("*")
        .eq("decision_id", decisionId)
        .order("voted_at", { ascending: false });
      
      if (error) throw error;
      return data as GovernanceVote[];
    },
    enabled: !!decisionId,
  });

  const { data: userVote } = useQuery({
    queryKey: ["user-vote", decisionId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("governance_votes")
        .select("*")
        .eq("decision_id", decisionId)
        .eq("voter_id", user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as GovernanceVote | null;
    },
    enabled: !!decisionId,
  });

  const castVote = useMutation({
    mutationFn: async ({ vote, reason }: { vote: VoteType; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      
      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("id, full_name, category")
        .eq("user_id", user.id)
        .maybeSingle();
      
      const voterType = beneficiary 
        ? 'beneficiary' 
        : 'board_member';
      
      const { data, error } = await supabase
        .from("governance_votes")
        .insert([{
          decision_id: decisionId,
          voter_id: user.id,
          voter_name: profile?.full_name || 'مستخدم',
          voter_type: voterType,
          beneficiary_id: beneficiary?.id,
          vote,
          vote_reason: reason,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["governance-votes", decisionId] });
      queryClient.invalidateQueries({ queryKey: ["user-vote", decisionId] });
      queryClient.invalidateQueries({ queryKey: ["governance-decisions"] });
      toast({
        title: "تم تسجيل صوتك بنجاح",
        description: "شكراً لمشاركتك في التصويت",
      });
    },
  });

  return {
    votes,
    userVote,
    isLoading,
    hasVoted: !!userVote,
    castVote: castVote.mutateAsync,
  };
}
