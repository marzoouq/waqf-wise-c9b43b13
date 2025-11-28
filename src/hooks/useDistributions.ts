import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";
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
    const channel = supabase
      .channel('distributions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'distributions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["distributions"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["distributions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("distributions")
        .select("id, month, total_amount, beneficiaries_count, status, distribution_date, distribution_type, period_start, period_end, total_revenues, total_expenses, net_revenues, nazer_share, waqif_charity, waqf_corpus, distributable_amount, notes, journal_entry_id, created_at, updated_at")
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return data as Distribution[];
    },
    staleTime: 3 * 60 * 1000, // Data stays fresh for 3 minutes
  });

  const addDistribution = useMutation({
    mutationFn: async (distribution: Omit<Distribution, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("distributions")
        .insert([distribution])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      // إضافة نشاط
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
      const { data, error } = await supabase
        .from("distributions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // القيد المحاسبي سيتم إنشاؤه تلقائياً عبر Trigger
      // عند تغيير الحالة إلى "معتمد"

      return data;
    },
    onSuccess: (data) => {
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
      // التحقق من حالة التوزيع قبل الحذف
      const { data: distribution, error: fetchError } = await supabase
        .from("distributions")
        .select("status, month")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // منع حذف التوزيعات المعتمدة
      if (distribution.status === "معتمد") {
        throw new Error("لا يمكن حذف توزيع معتمد");
      }

      const { error } = await supabase
        .from("distributions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return distribution;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      addActivity({
        action: `تم حذف التوزيع لشهر ${data.month}`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'delete_distribution_activity', severity: 'low' });
      });
      
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
      const { data, error } = await supabase.functions.invoke("generate-distribution-summary", {
        body: {
          period_start: periodStart,
          period_end: periodEnd,
          distribution_type: 'شهري',
          waqf_corpus_percentage: waqfCorpusPercentage,
        },
      });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["distribution-details"] });
      
      toast({
        title: "تم إنشاء التوزيع بنجاح",
        description: `تم توزيع ${data.summary.distributable_amount} ريال على ${data.summary.beneficiaries_count} مستفيد`,
      });

      return data;
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
