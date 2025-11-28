import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { AccountRow, AccountWithBalance } from "@/types/supabase-helpers";
import { AccountInsert, AccountUpdate } from "@/types/accounting";
import { getErrorMessage } from "@/types/errors";

export function useAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("id, code, name_ar, name_en, account_type, account_nature, parent_id, is_header, is_active, current_balance, description, created_at, updated_at")
        .order("code", { ascending: true });

      if (error) throw error;
      return data as AccountRow[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (account: AccountInsert) => {
      const { data, error } = await supabase
        .from("accounts")
        .insert([account])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الحساب بنجاح",
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      logger.error(error, { context: 'add_account', severity: 'medium' });
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: AccountUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "تم التحديث",
        description: "تم تحديث الحساب بنجاح",
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      logger.error(error, { context: 'update_account', severity: 'medium' });
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      // التحقق من عدم وجود معاملات
      const { count: transactionsCount } = await supabase
        .from("journal_entry_lines")
        .select("*", { count: 'exact', head: true })
        .eq("account_id", id);

      if (transactionsCount && transactionsCount > 0) {
        throw new Error("لا يمكن حذف حساب يحتوي على معاملات");
      }

      // التحقق من عدم كونه حساب رئيسي
      const { data: account } = await supabase
        .from("accounts")
        .select("is_header, code")
        .eq("id", id)
        .single();

      if (account?.is_header) {
        throw new Error("لا يمكن حذف حساب رئيسي");
      }

      // منع حذف الحسابات النظامية (الأكواد من 1000 إلى 5999)
      if (account?.code) {
        const codeNum = parseInt(account.code);
        if (codeNum >= 1000 && codeNum <= 5999) {
          throw new Error("لا يمكن حذف الحسابات النظامية");
        }
      }

      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "تم الحذف",
        description: "تم حذف الحساب بنجاح",
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      logger.error(error, { context: 'delete_account', severity: 'medium' });
      toast({
        title: "خطأ",
        description: message,
        variant: "destructive",
      });
    },
  });

  const calculateBalance = async (accountId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc("calculate_account_balance", { account_uuid: accountId });

      if (error) throw error;
      return (data as number) || 0;
    } catch (error: unknown) {
      logger.error(error, { context: 'calculate_account_balance', severity: 'medium' });
      return 0;
    }
  };

  // Build tree structure
  const buildAccountTree = (): AccountWithBalance[] => {
    const accountMap = new Map<string, AccountWithBalance>();
    const rootAccounts: AccountWithBalance[] = [];

    // Create map
    accounts.forEach((account) => {
      accountMap.set(account.id, { 
        ...account, 
        balance: account.current_balance || 0,
        children: [],
        allows_transactions: !account.is_header,
        is_system_account: false
      });
    });

    // Build tree
    accounts.forEach((account) => {
      const node = accountMap.get(account.id);
      if (account.parent_id) {
        const parent = accountMap.get(account.parent_id);
        if (parent && node) {
          parent.children!.push(node);
        }
      } else {
        if (node) rootAccounts.push(node);
      }
    });

    return rootAccounts;
  };

  return {
    accounts,
    accountTree: buildAccountTree(),
    isLoading,
    addAccount: addAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
    calculateBalance,
  };
}