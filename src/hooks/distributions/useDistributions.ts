import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DistributionService, RealtimeService, EdgeFunctionService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errors";
import { QUERY_KEYS } from "@/lib/query-keys";
import type { Distribution } from "@/types/distributions";

export type { Distribution };

export function useDistributions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('distributions', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.DISTRIBUTIONS,
    queryFn: () => DistributionService.getAll(),
    staleTime: 3 * 60 * 1000,
  });

  const addDistribution = useMutation({
    mutationFn: async (distribution: Omit<Distribution, "id" | "created_at" | "updated_at">) => {
      return DistributionService.create(distribution);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FUNDS });
      
      addActivity({
        action: `تم إنشاء توزيع جديد لشهر ${data.month} بمبلغ ${data.total_amount} ريال`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'add_distribution_activity', severity: 'low' });
      });
      
      toast({
        title: "تم إنشاء التوزيع بنجاح",
        description: "تم إنشاء التوزيع وإنشاء القيد المحاسبي",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_distribution',
      toastTitle: 'خطأ في الإنشاء',
    }),
  });

  const updateDistribution = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Distribution> }) => {
      return DistributionService.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث التوزيع بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_distribution',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const deleteDistribution = useMutation({
    mutationFn: async (id: string) => {
      return DistributionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف التوزيع بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_distribution',
      toastTitle: 'خطأ في الحذف',
    }),
  });

  const generateDistribution = async (periodStart: string, periodEnd: string, waqfCorpusPercentage: number = 0) => {
    try {
      const result = await EdgeFunctionService.invoke<{
        summary: {
          distributable_amount: number;
          beneficiaries_count: number;
        };
      }>("generate-distribution-summary", {
        period_start: periodStart,
        period_end: periodEnd,
        distribution_type: 'شهري',
        waqf_corpus_percentage: waqfCorpusPercentage,
      });
      
      if (!result.success) throw new Error(result.error);
      
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DISTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HEIR_DISTRIBUTIONS });
      
      const summary = result.data?.summary || { distributable_amount: 0, beneficiaries_count: 0 };
      toast({
        title: "تم إنشاء التوزيع بنجاح",
        description: `تم توزيع ${summary.distributable_amount || 0} ريال على ${summary.beneficiaries_count || 0} مستفيد`,
      });

      return result.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إنشاء التوزيع";
      toast({
        title: "خطأ في إنشاء التوزيع",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    distributions,
    isLoading,
    addDistribution: addDistribution.mutate,
    addDistributionAsync: addDistribution.mutateAsync,
    updateDistribution: updateDistribution.mutate,
    updateDistributionAsync: updateDistribution.mutateAsync,
    deleteDistribution: deleteDistribution.mutate,
    deleteDistributionAsync: deleteDistribution.mutateAsync,
    generateDistribution,
  };
}
