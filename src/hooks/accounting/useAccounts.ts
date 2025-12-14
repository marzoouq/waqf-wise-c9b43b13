import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { AccountRow, AccountWithBalance } from "@/types/supabase-helpers";
import { AccountInsert, AccountUpdate } from "@/types/accounting";
import { getErrorMessage } from "@/types/errors";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.ACCOUNTS,
    queryFn: () => AccountingService.getAccounts(),
  });

  const addAccount = useMutation({
    mutationFn: async (account: AccountInsert) => {
      return AccountingService.createAccount(account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
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
      return AccountingService.updateAccount(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
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
      return AccountingService.deleteAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
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
      const account = await AccountingService.getAccountWithBalance(accountId);
      return account?.current_balance || 0;
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
    error: error as Error | null,
    refetch,
    addAccount: addAccount.mutateAsync,
    updateAccount: updateAccount.mutateAsync,
    deleteAccount: deleteAccount.mutateAsync,
    calculateBalance,
  };
}