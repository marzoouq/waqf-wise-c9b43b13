import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useActivities } from "@/hooks/ui/useActivities";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { createAutoJournalEntry as createAutoJournalEntryWrapper } from "@/lib/supabase-wrappers";
import { createMutationErrorHandler } from "@/lib/errors";
import type { JournalEntryInsert, JournalLineInsert } from "@/types/accounting";
import { AccountingService } from "@/services/accounting.service";
import { RealtimeService } from "@/services/realtime.service";
import { invalidateAccountingQueries } from "@/lib/query-invalidation";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    const subscription = RealtimeService.subscribeToTable('journal_entries', () => {
      invalidateAccountingQueries(queryClient);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: entries = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.JOURNAL_ENTRIES,
    queryFn: () => AccountingService.getJournalEntriesWithLines(),
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

      return AccountingService.createJournalEntry(entry, lines);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      
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
      return AccountingService.postJournalEntry(entryId, user?.email || 'النظام');
    },
    onSuccess: () => {
      invalidateAccountingQueries(queryClient);
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
      
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      return result.data?.id;
    } catch (error) {
      logger.error(error, { context: 'create_auto_entry', severity: 'high' });
      throw error;
    }
  };

  return {
    entries,
    isLoading,
    error,
    refetch,
    createEntry: createEntry.mutateAsync,
    postEntry: postEntry.mutateAsync,
    createAutoEntry,
  };
}
