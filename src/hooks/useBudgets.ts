import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";

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

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ["budgets", fiscalYearId],
    queryFn: async () => {
      let query = supabase
        .from("budgets")
        .select(`
          *,
          accounts:account_id (
            code,
            name_ar,
            account_type
          )
        `)
        .order("period_number", { ascending: true });

      if (fiscalYearId) {
        query = query.eq("fiscal_year_id", fiscalYearId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Budget[];
    },
  });

  const addBudget = useMutation({
    mutationFn: async (budget: Omit<Budget, "id" | "created_at" | "updated_at" | "actual_amount" | "variance_amount" | "accounts">) => {
      const { data, error } = await supabase
        .from("budgets")
        .insert([budget])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
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
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
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
    mutationFn: async (fiscalYearId: string) => {
      // حساب الانحرافات لكل ميزانية
      const { data: budgetsData, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("fiscal_year_id", fiscalYearId);

      if (budgetsError) throw budgetsError;

      for (const budget of budgetsData || []) {
        // حساب المبلغ الفعلي من القيود المحاسبية
        const { data: actualData, error: actualError } = await supabase
          .from("journal_entry_lines")
          .select("debit_amount, credit_amount")
          .eq("account_id", budget.account_id);

        if (actualError) throw actualError;

        const actualAmount = actualData?.reduce((sum, line) => 
          sum + (line.debit_amount - line.credit_amount), 0) || 0;

        const varianceAmount = budget.budgeted_amount - actualAmount;

        // تحديث الميزانية
        await supabase
          .from("budgets")
          .update({
            actual_amount: actualAmount,
            variance_amount: varianceAmount,
          })
          .eq("id", budget.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
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
    addBudget: addBudget.mutateAsync,
    updateBudget: updateBudget.mutateAsync,
    deleteBudget: deleteBudget.mutateAsync,
    calculateVariances: calculateVariances.mutateAsync,
  };
}
