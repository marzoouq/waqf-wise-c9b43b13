/**
 * useCreateFiscalYear Hook
 * إنشاء سنة مالية جديدة
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiscalYearService } from "@/services/fiscal-year.service";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

interface FiscalYearFormData {
  name: string;
  start_date: string;
  end_date: string;
  is_historical: boolean;
  total_revenues: number;
  total_expenses: number;
  nazer_share: number;
  waqif_share: number;
  beneficiary_distributions: number;
  waqf_corpus: number;
  notes: string;
}

export function useCreateFiscalYear(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: FiscalYearFormData) => {
      if (data.is_historical) {
        return FiscalYearService.createWithClosing(
          {
            name: data.name,
            start_date: data.start_date,
            end_date: data.end_date,
            is_active: false,
            is_closed: true,
            is_published: true,
          },
          {
            closing_date: data.end_date,
            total_revenues: data.total_revenues,
            total_expenses: data.total_expenses,
            nazer_share: data.nazer_share,
            waqif_share: data.waqif_share,
            beneficiary_distributions: data.beneficiary_distributions,
            waqf_corpus: data.waqf_corpus,
            notes: data.notes,
          }
        );
      } else {
        return FiscalYearService.create({
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
          is_active: false,
          is_closed: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEARS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEAR_CLOSINGS });
      toast.success("تم إضافة السنة المالية بنجاح");
      onSuccess?.();
    },
    onError: (error) => {
      if (import.meta.env.DEV) {
        console.error("Error creating fiscal year:", error);
      }
      toast.error("فشل في إضافة السنة المالية");
    },
  });

  return {
    createFiscalYear: createMutation.mutate,
    isCreating: createMutation.isPending,
    error: createMutation.error,
  };
}
