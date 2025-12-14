import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { PaymentService } from "@/services/payment.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface BankAccount {
  id: string;
  account_id: string;
  bank_name: string;
  account_number: string;
  iban?: string;
  swift_code?: string;
  currency: string;
  current_balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useBankAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bankAccounts = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.BANK_ACCOUNTS,
    queryFn: () => PaymentService.getBankAccounts(),
  });

  const addBankAccount = useMutation({
    mutationFn: (bankAccount: Omit<BankAccount, "id" | "created_at" | "updated_at">) =>
      PaymentService.createBankAccount(bankAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الحساب البنكي بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_bank_account',
      toastTitle: 'خطأ في الإضافة',
    }),
  });

  const updateBankAccount = useMutation({
    mutationFn: ({ id, ...updates }: Partial<BankAccount> & { id: string }) =>
      PaymentService.updateBankAccount(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الحساب البنكي بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_bank_account',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const deleteBankAccount = useMutation({
    mutationFn: (id: string) => PaymentService.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_ACCOUNTS });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الحساب البنكي بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_bank_account',
      toastTitle: 'خطأ في الحذف',
    }),
  });

  return {
    bankAccounts,
    isLoading,
    addBankAccount: addBankAccount.mutateAsync,
    updateBankAccount: updateBankAccount.mutateAsync,
    deleteBankAccount: deleteBankAccount.mutateAsync,
  };
}
