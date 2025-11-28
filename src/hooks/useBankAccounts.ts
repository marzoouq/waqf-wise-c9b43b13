import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { deleteFromTable } from "@/utils/supabaseHelpers";
import { createMutationErrorHandler } from "@/lib/errors";

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
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("id, account_id, bank_name, account_number, iban, swift_code, currency, current_balance, is_active, created_at, updated_at")
        .order("bank_name", { ascending: true });

      if (error) throw error;
      return (data || []) as BankAccount[];
    },
  });

  const addBankAccount = useMutation({
    mutationFn: async (bankAccount: Omit<BankAccount, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .insert([bankAccount])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
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
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
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
    mutationFn: async (id: string) => {
      const result = await deleteFromTable("bank_accounts", id);
      const error = result.error;

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank_accounts"] });
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
