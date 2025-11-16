import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export interface Distribution {
  id: string;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
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
        .select("*")
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      
      // إضافة نشاط
      try {
        await addActivity({
          action: `تم إنشاء توزيع جديد لشهر ${data.month} بمبلغ ${data.total_amount} ريال`,
          user_name: user?.email || 'النظام',
        });
      } catch (error) {
        logger.error(error, { context: 'add_distribution_activity', severity: 'low' });
      }
      
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

      // إنشاء قيد محاسبي عند اعتماد التوزيع
      if (updates.status === "معتمد" && !data.journal_entry_id) {
        try {
          const entryId = await createAutoEntry(
            "distribution_approved",
            data.id,
            data.total_amount,
            `توزيع معتمد - ${data.month} - عدد المستفيدين: ${data.beneficiaries_count}`,
            data.distribution_date
          );

          if (entryId) {
            await supabase
              .from("distributions")
              .update({ journal_entry_id: entryId })
              .eq("id", id);
          }
        } catch (journalError) {
          logger.error(journalError, { context: 'distribution_journal_entry', severity: 'medium' });
        }
      }

      return data;
    },
    onSuccess: async (data) => {
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

  const simulateDistribution = async (totalAmount: number, beneficiariesCount: number) => {
    // محاكاة توزيع بسيط: تقسيم المبلغ بالتساوي
    const perBeneficiary = totalAmount / beneficiariesCount;
    return {
      totalAmount,
      beneficiariesCount,
      perBeneficiary,
      distribution: Array.from({ length: Math.min(beneficiariesCount, 10) }, (_, i) => ({
        beneficiaryNumber: i + 1,
        amount: perBeneficiary,
      })),
    };
  };

  return {
    distributions,
    isLoading,
    addDistribution: addDistribution.mutateAsync,
    updateDistribution: updateDistribution.mutateAsync,
    simulateDistribution,
  };
}
