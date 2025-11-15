import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { AccountRow, AccountWithBalance } from "@/types/supabase-helpers";

export function useAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("code", { ascending: true });

      if (error) throw error;
      return data as AccountRow[];
    },
  });

  const addAccount = useMutation({
    mutationFn: async (account: any) => {
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
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
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
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const calculateBalance = async (accountId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .rpc("calculate_account_balance" as any, { account_uuid: accountId });

      if (error) throw error;
      return (data as number) || 0;
    } catch (error) {
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
    calculateBalance,
  };
}