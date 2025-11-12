import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "./useJournalEntries";
import { useEffect } from "react";

export interface Distribution {
  id: string;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export function useDistributions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();

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

      // إنشاء قيد محاسبي تلقائي للتوزيع
      if (data && data.status === "معتمد") {
        try {
          await createAutoEntry(
            "distribution",
            data.id,
            data.total_amount,
            `توزيع غلة - ${data.month}`,
            data.distribution_date
          );
        } catch (journalError) {
          console.error("Error creating journal entry:", journalError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distributions"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      toast({
        title: "تم إنشاء التوزيع بنجاح",
        description: "تم إنشاء التوزيع وإنشاء القيد المحاسبي",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإنشاء",
        description: error.message || "حدث خطأ أثناء إنشاء التوزيع",
        variant: "destructive",
      });
    },
  });

  return {
    distributions,
    isLoading,
    addDistribution: addDistribution.mutateAsync,
  };
}
