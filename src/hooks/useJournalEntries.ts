import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createAutoJournalEntry as createAutoJournalEntryWrapper } from "@/lib/supabase-wrappers";
import { createAutoJournalEntry } from "@/lib/supabase-wrappers";
import { createMutationErrorHandler } from "@/lib/errorHandling";
import type { JournalEntryInsert, JournalLineInsert } from "@/types/accounting";

export interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  fiscal_year_id: string;
  description: string;
  reference_type?: string;
  reference_id?: string;
  status: string;
  posted_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  line_number: number;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  created_at: string;
}

export function useJournalEntries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('journal-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_entries'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
          queryClient.invalidateQueries({ queryKey: ["accounts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select(`
          *,
          journal_entry_lines (
            *,
            accounts (code, name_ar)
          )
        `)
        .order("entry_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createEntry = useMutation({
    mutationFn: async ({
      entry,
      lines,
    }: {
      entry: JournalEntryInsert;
      lines: JournalLineInsert[];
    }) => {
      // Validate balanced entry
      const totalDebit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit_amount, 0);

      if (totalDebit !== totalCredit) {
        throw new Error("القيد غير متوازن: مجموع المدين يجب أن يساوي مجموع الدائن");
      }

      // Create entry
      const { data: entryData, error: entryError } = await supabase
        .from("journal_entries")
        .insert([entry])
        .select()
        .single();

      if (entryError) throw entryError;

      // Create lines
      const linesWithEntryId = lines.map((line) => ({
        ...line,
        journal_entry_id: entryData.id,
      }));

      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(linesWithEntryId);

      if (linesError) throw linesError;

      return entryData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      
      // إضافة نشاط
      addActivity({
        action: `تم إنشاء قيد محاسبي: ${data.entry_number}`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'journal_entry_activity', severity: 'low' });
      });
      
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء القيد بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'create_journal_entry',
    }),
  });

  const postEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await supabase
        .from("journal_entries")
        .update({ status: "posted", posted_at: new Date().toISOString() })
        .eq("id", entryId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "تم الترحيل",
        description: "تم ترحيل القيد بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'post_journal_entry',
      toastTitle: 'خطأ في الترحيل',
    }),
  });

  const createAutoEntry = async (
    triggerEvent: string,
    referenceId: string,
    amount: number,
    description: string,
    entryDate?: string
  ) => {
    try {
      const result = await createAutoJournalEntryWrapper({
        triggerEvent,
        referenceId,
        amount,
        description,
        transactionDate: entryDate,
      });

      if (result.error) throw result.error;
      
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      return result.data?.id;
    } catch (error) {
      logger.error(error, { context: 'create_auto_entry', severity: 'high' });
      throw error;
    }
  };

  return {
    entries,
    isLoading,
    createEntry: createEntry.mutateAsync,
    postEntry: postEntry.mutateAsync,
    createAutoEntry,
  };
}