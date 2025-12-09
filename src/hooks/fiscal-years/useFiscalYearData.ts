/**
 * Fiscal Year Data Hooks
 * @version 2.8.43
 */

import { useQuery } from "@tanstack/react-query";
import { FiscalYearService } from "@/services";
import type { ClosingPreview, FiscalYearSummary } from "@/types/fiscal-year-closing";

export function useClosingPreview(fiscalYearId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["closing-preview", fiscalYearId],
    queryFn: async () => {
      return FiscalYearService.getClosingPreview(fiscalYearId) as Promise<ClosingPreview>;
    },
    enabled,
  });
}

export function useFiscalYearSummary(fiscalYearId: string, hasClosing: boolean) {
  return useQuery({
    queryKey: ["fiscal-year-summary", fiscalYearId],
    queryFn: async () => {
      return FiscalYearService.calculateSummary(fiscalYearId) as unknown as FiscalYearSummary;
    },
    enabled: !hasClosing,
  });
}
