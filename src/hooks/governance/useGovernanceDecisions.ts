import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Database } from "@/integrations/supabase/types";
import { GovernanceService } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";

type DbGovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

export function useGovernanceDecisions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: decisions = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS,
    queryFn: () => GovernanceService.getDecisions(),
    retry: 2,
  });

  const createDecision = useMutation({
    mutationFn: (decision: DbGovernanceDecisionInsert) => 
      GovernanceService.createDecision(decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS });
      toast({
        title: "تم إضافة القرار بنجاح",
        description: "تم إضافة القرار وفتح التصويت عليه",
      });
    },
    onError: (error) => {
      productionLogger.error('Create decision mutation error:', error);
      toast({
        title: "خطأ في إضافة القرار",
        description: "حدث خطأ أثناء إضافة القرار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const closeVoting = useMutation({
    mutationFn: ({ decisionId, status }: { decisionId: string; status: 'معتمد' | 'مرفوض' }) => 
      GovernanceService.closeVoting(decisionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS });
      toast({
        title: "تم إغلاق التصويت",
        description: "تم احتساب النتائج وإغلاق التصويت",
      });
    },
    onError: (error) => {
      productionLogger.error('Close voting mutation error:', error);
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
