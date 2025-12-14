/**
 * Hook لإدارة عمليات إقفال السنوات المالية
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { toast } from "sonner";
import type { FiscalYearClosing, FiscalYearSummary } from "@/types/fiscal-year-closing";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useFiscalYearClosings() {
  const queryClient = useQueryClient();

  // استرجاع جميع عمليات الإقفال
  const { data: closings, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.FISCAL_YEAR_CLOSINGS,
    queryFn: async () => {
      const data = await AccountingService.getFiscalYearClosings();
      return (data || []) as unknown as FiscalYearClosing[];
    },
  });

  // استرجاع عملية إقفال محددة
  const getClosingByFiscalYear = async (fiscalYearId: string) => {
    const data = await AccountingService.getClosingByFiscalYear(fiscalYearId);
    return data as unknown as FiscalYearClosing | null;
  };

  // حساب ملخص السنة المالية
  const calculateSummary = async (fiscalYearId: string): Promise<FiscalYearSummary> => {
    const data = await AccountingService.calculateFiscalYearSummary(fiscalYearId);
    return data as unknown as FiscalYearSummary;
  };

  // إنشاء عملية إقفال جديدة
  const createClosing = useMutation({
    mutationFn: async (closing: Parameters<typeof AccountingService.createFiscalYearClosing>[0]) => {
      return await AccountingService.createFiscalYearClosing(closing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEAR_CLOSINGS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEARS });
      toast.success("تم إنشاء عملية الإقفال بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل إنشاء عملية الإقفال: " + error.message);
    },
  });

  // تحديث عملية إقفال
  const updateClosing = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Parameters<typeof AccountingService.updateFiscalYearClosing>[1] }) => {
      return await AccountingService.updateFiscalYearClosing(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEAR_CLOSINGS });
      toast.success("تم تحديث عملية الإقفال بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل تحديث عملية الإقفال: " + error.message);
    },
  });

  return {
    closings,
    isLoading,
    error,
    refetch,
    getClosingByFiscalYear,
    calculateSummary,
    createClosing,
    updateClosing,
  };
}
