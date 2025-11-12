import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      entry: any;
      lines: any[];
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء القيد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
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
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAutoEntry = async (
    triggerEvent: string,
    referenceId: string,
    amount: number,
    description: string,
    entryDate?: string
  ) => {
    try {
      const { data, error } = await supabase.rpc("create_auto_journal_entry" as any, {
        p_trigger_event: triggerEvent,
        p_reference_id: referenceId,
        p_amount: amount,
        p_description: description,
        p_entry_date: entryDate || new Date().toISOString().split("T")[0],
      });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      return data;
    } catch (error) {
      console.error("Error creating auto entry:", error);
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