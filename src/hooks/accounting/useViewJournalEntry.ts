/**
 * useViewJournalEntry Hook
 * Hook لعرض وترحيل القيد المحاسبي
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
    queryKey: ["journal_entry_lines", entryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entry_lines")
        .select(`
          *,
          account:accounts(code, name_ar)
        `)
        .eq("journal_entry_id", entryId)
        .order("line_number");
      if (error) throw error;
      return data as JournalEntryLine[];
    },
    enabled,
  });

  const postEntryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ status: "posted", posted_at: new Date().toISOString() })
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
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
