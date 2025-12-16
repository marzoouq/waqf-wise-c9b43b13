/**
 * useViewJournalEntry Hook
 * Hook لعرض وترحيل القيد المحاسبي
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { useToast } from "@/hooks/ui/use-toast";
import { QUERY_KEYS } from "@/lib/query-keys";

interface JournalEntryLine {
  id: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  account: {
    code: string;
    name_ar: string;
  };
}

export function useViewJournalEntry(entryId: string, enabled: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lines } = useQuery({
    queryKey: QUERY_KEYS.JOURNAL_ENTRY_LINES(entryId),
    queryFn: async () => {
      const data = await AccountingService.getJournalEntryLinesWithAccount(entryId);
      return data as JournalEntryLine[];
    },
    enabled,
  });

  const postEntryMutation = useMutation({
    mutationFn: async () => {
      await AccountingService.postJournalEntryById(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast({
        title: "تم الترحيل بنجاح",
        description: "تم ترحيل القيد المحاسبي بنجاح",
      });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء ترحيل القيد",
        variant: "destructive",
      });
    },
  });

  const totalDebit = lines?.reduce((sum, line) => sum + Number(line.debit_amount), 0) || 0;
  const totalCredit = lines?.reduce((sum, line) => sum + Number(line.credit_amount), 0) || 0;

  const postEntry = () => postEntryMutation.mutate();

  return {
    lines,
    totalDebit,
    totalCredit,
    postEntry,
    isPosting: postEntryMutation.isPending,
  };
}
