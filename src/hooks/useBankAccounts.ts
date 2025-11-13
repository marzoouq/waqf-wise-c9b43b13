import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
        .from("bank_accounts" as any)
        .select("*")
        .order("bank_name", { ascending: true });

      if (error) throw error;
      return (data || []) as any as BankAccount[];
    },
  });

  const addBankAccount = useMutation({
    mutationFn: async (bankAccount: Omit<BankAccount, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("bank_accounts" as any)
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
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBankAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BankAccount> & { id: string }) => {
      const { data, error } = await supabase
        .from("bank_accounts" as any)
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
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive",
      });
    },
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
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    bankAccounts,
    isLoading,
    addBankAccount: addBankAccount.mutateAsync,
    updateBankAccount: updateBankAccount.mutateAsync,
    deleteBankAccount: deleteBankAccount.mutateAsync,
  };
}
