/**
 * Hook for creating automatic journal entries
 * نقل استدعاءات supabase.rpc من AddReceiptDialog و AddVoucherDialog
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { useToast } from "@/hooks/use-toast";
import { invalidateAccountingQueries } from "@/lib/query-invalidation";

interface AutoJournalEntryParams {
  triggerEvent: 'payment_receipt' | 'payment_voucher' | 'loan_approved';
  referenceId: string;
  amount: number;
  description: string;
  transactionDate: string;
}

export function useAutoJournalEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAutoJournalEntry = useMutation({
    mutationFn: async (params: AutoJournalEntryParams) => {
      return AccountingService.createAutoJournalEntry({
        trigger: params.triggerEvent,
        referenceId: params.referenceId,
        referenceType: params.triggerEvent,
        amount: params.amount,
        description: params.description,
      });
    },
    onSuccess: () => {
      invalidateAccountingQueries(queryClient);
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل إنشاء القيد المحاسبي",
        variant: "destructive",
      });
    },
  });

  return {
    createAutoJournalEntry,
    isLoading: createAutoJournalEntry.isPending,
  };
}
