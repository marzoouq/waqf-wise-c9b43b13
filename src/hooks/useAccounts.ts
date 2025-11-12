import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Account {
  id: string;
  code: string;
  name_ar: string;
  name_en?: string;
  account_type: string;
  account_nature: string;
  account_level: number;
  parent_id?: string;
  is_header: boolean;
  is_active: boolean;
  is_system_account: boolean;
  allows_transactions: boolean;
  account_path?: string;
  opening_balance: number;
  current_balance: number;
  sort_order: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

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
      return data as Account[];
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
      console.error("Error calculating balance:", error);
      return 0;
    }
  };

  // Build tree structure
  const buildAccountTree = () => {
    const accountMap = new Map<string, Account & { children?: Account[] }>();
    const rootAccounts: (Account & { children?: Account[] })[] = [];

    // Create map
    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Build tree
    accounts.forEach((account) => {
      const node = accountMap.get(account.id);
      if (account.parent_id) {
        const parent = accountMap.get(account.parent_id);
        if (parent) {
          parent.children!.push(node!);
        }
      } else {
        rootAccounts.push(node!);
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