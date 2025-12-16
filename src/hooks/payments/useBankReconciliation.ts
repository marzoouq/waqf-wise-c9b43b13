/**
 * useBankReconciliation Hook - التسوية البنكية
 * يستخدم BankReconciliationService
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { BankReconciliationService } from "@/services";
import { 
  BankStatementInsert, 
  BankTransactionInsert,
  BankTransactionMatch 
} from "@/types/banking";
import { getErrorMessage } from "@/types/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

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
    queryKey: QUERY_KEYS.BANK_STATEMENTS_DATA,
    queryFn: () => BankReconciliationService.getStatements(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: QUERY_KEYS.BANK_TRANSACTIONS_DATA,
    queryFn: () => BankReconciliationService.getTransactions(),
  });

  const createStatement = useMutation({
    mutationFn: (statement: BankStatementInsert) => 
      BankReconciliationService.createStatement(statement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_STATEMENTS_DATA });
      toast({ title: "تم الإنشاء", description: "تم إنشاء كشف الحساب بنجاح" });
    },
    onError: (error: unknown) => {
      toast({ title: "خطأ", description: getErrorMessage(error), variant: "destructive" });
    },
  });

  const addTransaction = useMutation({
    mutationFn: (transaction: BankTransactionInsert) => 
      BankReconciliationService.addTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_TRANSACTIONS_DATA });
      toast({ title: "تم الإضافة", description: "تم إضافة الحركة بنجاح" });
    },
    onError: (error: unknown) => {
      toast({ title: "خطأ", description: getErrorMessage(error), variant: "destructive" });
    },
  });

  const matchTransaction = useMutation({
    mutationFn: (match: BankTransactionMatch) => 
      BankReconciliationService.matchTransaction(match),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_TRANSACTIONS_DATA });
      toast({ title: "تمت المطابقة", description: "تمت مطابقة الحركة بنجاح" });
    },
    onError: (error: unknown) => {
      toast({ title: "خطأ", description: getErrorMessage(error), variant: "destructive" });
    },
  });

  const reconcileStatement = useMutation({
    mutationFn: (statementId: string) => 
      BankReconciliationService.reconcileStatement(statementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_STATEMENTS_DATA });
      toast({ title: "تمت التسوية", description: "تمت تسوية كشف الحساب بنجاح" });
    },
    onError: (error: unknown) => {
      toast({ title: "خطأ", description: getErrorMessage(error), variant: "destructive" });
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
