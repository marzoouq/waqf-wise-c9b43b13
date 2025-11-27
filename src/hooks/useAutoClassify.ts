import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface ClassificationResult {
  success: boolean;
  documentId: string;
  classification: {
    category: string;
    categoryName: string;
    confidence: number;
    method: 'ai' | 'keywords';
  };
}

export function useAutoClassify() {
  const queryClient = useQueryClient();

  const classifyMutation = useMutation({
    mutationFn: async ({ 
      documentId, 
      useAI = false 
    }: { 
      documentId: string; 
      useAI?: boolean;
    }): Promise<ClassificationResult> => {
      const { data, error } = await supabase.functions.invoke('auto-classify-document', {
        body: { documentId, useAI }
      });

      if (error) throw error;
      return data as ClassificationResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'تم التصنيف',
        description: `تم تصنيف المستند كـ "${data.classification.categoryName}" بدقة ${(data.classification.confidence * 100).toFixed(0)}%`,
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'auto_classify', severity: 'medium' });
      toast({
        title: 'خطأ',
        description: 'فشل التصنيف التلقائي',
        variant: 'destructive',
      });
    },
  });

  const classifyBatchMutation = useMutation({
    mutationFn: async ({ 
      documentIds, 
      useAI = false 
    }: { 
      documentIds: string[]; 
      useAI?: boolean;
    }): Promise<ClassificationResult[]> => {
      const results: ClassificationResult[] = [];
      
      for (const documentId of documentIds) {
        try {
          const { data, error } = await supabase.functions.invoke('auto-classify-document', {
            body: { documentId, useAI }
          });
          
          if (!error && data) {
            results.push(data as ClassificationResult);
          }
        } catch (err) {
          logger.error(err, { context: 'batch_classify', severity: 'low' });
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: 'تم التصنيف',
        description: `تم تصنيف ${results.length} مستند بنجاح`,
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'batch_classify', severity: 'medium' });
      toast({
        title: 'خطأ',
        description: 'فشل التصنيف التلقائي للمستندات',
        variant: 'destructive',
      });
    },
  });

  return {
    classify: classifyMutation.mutate,
    classifyAsync: classifyMutation.mutateAsync,
    isClassifying: classifyMutation.isPending,
    
    classifyBatch: classifyBatchMutation.mutate,
    classifyBatchAsync: classifyBatchMutation.mutateAsync,
    isBatchClassifying: classifyBatchMutation.isPending,
  };
}
