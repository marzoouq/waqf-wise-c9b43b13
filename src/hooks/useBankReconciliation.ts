import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface BankStatement {
  id: string;
  bank_account_id: string;
  statement_date: string;
  opening_balance: number;
  closing_balance: number;
  total_debits: number;
  total_credits: number;
  is_reconciled: boolean;
  reconciled_by?: string;
  reconciled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  bank_statement_id: string;
  transaction_date: string;
  description: string;
  reference_number?: string;
  amount: number;
  transaction_type: string;
  is_matched: boolean;
  matched_journal_entry_id?: string;
  created_at: string;
}

export function useBankReconciliation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ["bank_statements"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("bank_statements")
          .select(`
            *,
            bank_accounts!inner (
              bank_name,
              account_number,
              accounts (code, name_ar)
            )
          `)
          .order("statement_date", { ascending: false });

        if (error) throw error;
        return data as BankStatementRow[];
      } catch (error) {
        logger.error(error, { context: 'fetch_bank_statements', severity: 'low' });
        return [];
      }
    },
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["bank_transactions"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("bank_transactions")
          .select("*")
          .order("transaction_date", { ascending: false });

        if (error) throw error;
        return data as BankTransactionRow[];
      } catch (error) {
        logger.error(error, { context: 'fetch_bank_transactions', severity: 'low' });
        return [];
      }
    },
  });

  const createStatement = useMutation({
    mutationFn: async (statement: any) => {
      const { data, error } = await supabase
        .from("bank_statements")
        .insert([statement])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_statements"] });
      toast({
        title: "تم الإنشاء",
        description: "تم إنشاء كشف الحساب بنجاح",
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

  const addTransaction = useMutation({
    mutationFn: async (transaction: any) => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_transactions"] });
      toast({
        title: "تم الإضافة",
        description: "تم إضافة الحركة بنجاح",
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

  const matchTransaction = useMutation({
    mutationFn: async ({
      transactionId,
      journalEntryId,
    }: {
      transactionId: string;
      journalEntryId: string;
    }) => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .update({
          is_matched: true,
          matched_journal_entry_id: journalEntryId,
        })
        .eq("id", transactionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_transactions"] });
      toast({
        title: "تمت المطابقة",
        description: "تمت مطابقة الحركة بنجاح",
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

  const reconcileStatement = useMutation({
    mutationFn: async (statementId: string) => {
      const { data, error } = await supabase
        .from("bank_statements")
        .update({
          status: 'reconciled',
          reconciled_at: new Date().toISOString(),
        })
        .eq("id", statementId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_statements"] });
      toast({
        title: "تمت التسوية",
        description: "تمت تسوية كشف الحساب بنجاح",
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

  return {
    statements,
    transactions,
    isLoading,
    createStatement: createStatement.mutateAsync,
    addTransaction: addTransaction.mutateAsync,
    matchTransaction: matchTransaction.mutateAsync,
    reconcileStatement: reconcileStatement.mutateAsync,
  };
}