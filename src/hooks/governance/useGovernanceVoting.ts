import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GovernanceService, AuthService } from "@/services";
import { useToast } from "@/hooks/ui/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import type { GovernanceVote, VoteType } from "@/types/governance";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useGovernanceVoting(decisionId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: votes = [], isLoading, error: votesError } = useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_VOTES(decisionId),
    queryFn: async () => {
      try {
        return await GovernanceService.getVotes(decisionId);
      } catch (error) {
        productionLogger.error('Error in votes query:', error);
        return [];
      }
    },
    enabled: !!decisionId,
    retry: 2,
  });

  const { data: userVote } = useQuery({
    queryKey: QUERY_KEYS.USER_VOTE(decisionId),
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      if (!user) return null;
      return GovernanceService.getUserVote(decisionId, user.id);
    },
    enabled: !!decisionId,
  });

  const castVote = useMutation({
    mutationFn: async ({ vote, reason }: { vote: VoteType; reason?: string }) => {
      try {
        return await GovernanceService.castVote(decisionId, vote, reason);
      } catch (error) {
        productionLogger.error('Error in cast vote mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_VOTES(decisionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_VOTE(decisionId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS });
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
