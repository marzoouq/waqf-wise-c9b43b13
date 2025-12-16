import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface Budget {
  id: string;
  account_id: string;
  fiscal_year_id: string;
  period_type: string;
  period_number: number | null;
  budgeted_amount: number;
  actual_amount: number | null;
  variance_amount: number | null;
  created_at: string;
  updated_at: string;
  accounts?: {
    code: string;
    name_ar: string;
    account_type: string;
  };
}

export function useBudgets(fiscalYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: budgets = [], 
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEYS.BUDGETS_BY_YEAR(fiscalYearId),
    queryFn: () => AccountingService.getBudgetsWithAccounts(fiscalYearId),
  });

  const addBudget = useMutation({
    mutationFn: (budget: Omit<Budget, "id" | "created_at" | "updated_at" | "actual_amount" | "variance_amount" | "accounts">) => 
      AccountingService.createBudget(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة الميزانية بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'add_budget',
      toastTitle: 'خطأ في الإضافة',
    }),
  });

  const updateBudget = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Budget> & { id: string }) => 
      AccountingService.updateBudget(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث الميزانية بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'update_budget',
      toastTitle: 'خطأ في التحديث',
    }),
  });

  const deleteBudget = useMutation({
    mutationFn: (id: string) => AccountingService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الميزانية بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'delete_budget',
      toastTitle: 'خطأ في الحذف',
    }),
  });

  const calculateVariances = useMutation({
    mutationFn: (fiscalYearId: string) => AccountingService.calculateBudgetVariances(fiscalYearId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUDGETS });
      toast({
        title: "تم الحساب بنجاح",
        description: "تم حساب الانحرافات بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'calculate_variances',
      toastTitle: 'خطأ في الحساب',
    }),
  });

  return {
    budgets,
    isLoading,
    error,
    refetch,
    addBudget: addBudget.mutateAsync,
    updateBudget: updateBudget.mutateAsync,
    deleteBudget: deleteBudget.mutateAsync,
    calculateVariances: calculateVariances.mutateAsync,
  };
}
