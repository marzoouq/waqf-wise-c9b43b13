import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import type { GovernanceVote, VoteType } from "@/types/governance";

export function useGovernanceVoting(decisionId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: votes = [], isLoading, error: votesError } = useQuery({
    queryKey: ["governance-votes", decisionId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("governance_votes")
          .select("*")
          .eq("decision_id", decisionId)
          .order("voted_at", { ascending: false });
        
        if (error) {
          productionLogger.error('Error fetching votes:', error);
          throw error;
        }
        return (data || []) as GovernanceVote[];
      } catch (error) {
        productionLogger.error('Error in votes query:', error);
        return [];
      }
    },
    enabled: !!decisionId,
    retry: 2,
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("غير مصرح");
        
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (profileError && profileError.code !== 'PGRST116') {
          productionLogger.error('Error fetching profile:', profileError);
        }
        
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
        
        if (error) {
          productionLogger.error('Error casting vote:', error);
          throw error;
        }
        return data;
      } catch (error) {
        productionLogger.error('Error in cast vote mutation:', error);
        throw error;
      }
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
    onError: (error: Error) => {
      productionLogger.error('Cast vote mutation error:', error);
      toast({
        title: "خطأ في التصويت",
        description: error.message || "حدث خطأ أثناء تسجيل صوتك، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  return {
    votes,
    userVote,
    isLoading,
    votesError,
    hasVoted: !!userVote,
    castVote: castVote.mutateAsync,
  };
}
