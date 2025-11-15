import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  title: string;
  description: string;
  alert_type: string;
  severity: string;
  data: any;
  created_at: string;
  is_dismissed: boolean;
}

export function useAIInsights() {
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async (): Promise<AIInsight[]> => {
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    },
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (reportType: 'beneficiaries' | 'properties' | 'financial' | 'loans') => {
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: { reportType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      toast({
        title: 'تم التوليد',
        description: 'تم توليد الرؤى الذكية بنجاح',
      });
    },
    onError: (error) => {
      console.error('Error generating insights:', error);
      toast({
        title: 'خطأ',
        description: 'فشل توليد الرؤى الذكية',
        variant: 'destructive',
      });
    },
  });

  const dismissInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ is_dismissed: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
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
