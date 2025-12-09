import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIService } from '@/services/ai.service';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { QUERY_KEYS } from '@/lib/query-keys';

export function useAIInsights() {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: QUERY_KEYS.AI_INSIGHTS,
    queryFn: () => AIService.getInsights(),
  });

  const generateInsightsMutation = useMutation({
    mutationFn: (reportType: 'beneficiaries' | 'properties' | 'financial' | 'loans') => 
      AIService.generateInsights(reportType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_INSIGHTS });
      toast({
        title: 'تم التوليد',
        description: 'تم توليد الرؤى الذكية بنجاح',
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'generate_ai_insights', severity: 'medium' });
      toast({
        title: 'خطأ',
        description: 'فشل توليد الرؤى الذكية',
        variant: 'destructive',
      });
    },
  });

  const dismissInsightMutation = useMutation({
    mutationFn: (insightId: string) => AIService.dismissInsight(insightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AI_INSIGHTS });
    },
  });

  return {
    insights,
    isLoading,
    generateInsights: generateInsightsMutation.mutate,
    isGenerating: generateInsightsMutation.isPending,
    dismissInsight: dismissInsightMutation.mutate,
  };
}
