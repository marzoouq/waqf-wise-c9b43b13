import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DistributionService, RealtimeService, EdgeFunctionService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errors";

export interface Distribution {
  id: string;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  distribution_type?: string;
  period_start?: string;
  period_end?: string;
  total_revenues?: number;
  total_expenses?: number;
  net_revenues?: number;
  nazer_share?: number;
  waqif_charity?: number;
  waqf_corpus?: number;
  distributable_amount?: number;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
}

export function useDistributions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const { unsubscribe } = RealtimeService.subscribeToTable('distributions', () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["distributions"],
    queryFn: () => DistributionService.getAll(),
    staleTime: 3 * 60 * 1000,
  });

  const addDistribution = useMutation({
    mutationFn: async (distribution: Omit<Distribution, "id" | "created_at" | "updated_at">) => {
      return DistributionService.create(distribution as any);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
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
      return DistributionService.update(id, updates as any);
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
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
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
      const result = await EdgeFunctionService.invoke("generate-distribution-summary", {
        period_start: periodStart,
        period_end: periodEnd,
        distribution_type: 'شهري',
        waqf_corpus_percentage: waqfCorpusPercentage,
      });
      
      if (!result.success) throw new Error(result.error);
      
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["distribution-details"] });
      
      const summary = result.data?.summary || {};
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
