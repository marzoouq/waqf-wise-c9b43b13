/**
 * Hook for adding journal entries
 */
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "@/lib/date";
import { UseFormReturn } from "react-hook-form";

export interface EntryLine {
  account_id: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

interface JournalEntryFormData {
  entry_number: string;
  entry_date: Date;
  description: string;
  fiscal_year_id: string;
}

export function useAddJournalEntry(form: UseFormReturn<JournalEntryFormData>, open: boolean, onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const [lines, setLines] = useState<EntryLine[]>([
    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
    { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
  ]);

  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_active", true)
        .eq("is_header", false)
        .order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: fiscalYears } = useQuery({
    queryKey: ["fiscal_years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Auto-generate entry number
  useEffect(() => {
    const generateEntryNumber = async () => {
      if (open && !form.getValues("entry_number")) {
        const year = new Date().getFullYear();
        const { data: lastEntry } = await supabase
          .from("journal_entries")
          .select("entry_number")
          .like("entry_number", `JV-${year}-%`)
          .order("entry_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        let nextNumber = 1;
        if (lastEntry && lastEntry.entry_number) {
          const match = lastEntry.entry_number.match(/JV-\d+-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }

        const entryNumber = `JV-${year}-${nextNumber.toString().padStart(3, '0')}`;
        form.setValue("entry_number", entryNumber);
      }
    };

    generateEntryNumber();
  }, [open, form]);

  // Set default fiscal year
  useEffect(() => {
    if (fiscalYears && fiscalYears.length > 0 && !form.getValues("fiscal_year_id")) {
      const activeFiscalYear = fiscalYears.find(fy => fy.is_active && !fy.is_closed);
      if (activeFiscalYear) {
        form.setValue('fiscal_year_id', activeFiscalYear.id);
      }
    }
  }, [fiscalYears, form]);

  const mutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      const totalDebit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
      const totalCredit = lines.reduce((sum, line) => sum + line.credit_amount, 0);

      if (totalDebit !== totalCredit) {
        throw new Error("مجموع المدين يجب أن يساوي مجموع الدائن");
      }

      if (lines.some((line) => !line.account_id)) {
        throw new Error("يجب اختيار حساب لكل سطر");
      }

      const { data: entry, error: entryError } = await supabase
        .from("journal_entries")
        .insert([
          {
            entry_number: data.entry_number,
            entry_date: format(data.entry_date, 'yyyy-MM-dd'),
            description: data.description,
            fiscal_year_id: data.fiscal_year_id,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      const entryLines = lines.map((line, index) => ({
        journal_entry_id: entry.id,
        account_id: line.account_id,
        description: line.description,
        debit_amount: line.debit_amount,
        credit_amount: line.credit_amount,
        line_number: index + 1,
      }));

      const { error: linesError } = await supabase
        .from("journal_entry_lines")
        .insert(entryLines);

      if (linesError) throw linesError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast.success("تم إضافة القيد بنجاح");
      form.reset();
      setLines([
        { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
        { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
      ]);
      onSuccess?.();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ";
      toast.error("حدث خطأ: " + errorMessage);
    },
  });

  const addLine = useCallback(() => {
    setLines([
      ...lines,
      { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
    ]);
  }, [lines]);

  const removeLine = useCallback((index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  }, [lines]);

  const updateLine = useCallback((index: number, field: keyof EntryLine, value: string | number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  }, [lines]);

  const resetLines = useCallback(() => {
    setLines([
      { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
      { account_id: "", description: "", debit_amount: 0, credit_amount: 0 },
    ]);
  }, []);

  const totalDebit = lines.reduce((sum, line) => sum + line.debit_amount, 0);
  const totalCredit = lines.reduce((sum, line) => sum + line.credit_amount, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  return {
    accounts,
    fiscalYears,
    lines,
    totalDebit,
    totalCredit,
    isBalanced,
    addLine,
    removeLine,
    updateLine,
    resetLines,
    mutate: mutation.mutate,
    isPending: mutation.isPending,
  };
}
