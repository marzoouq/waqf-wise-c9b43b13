/**
 * Fiscal Year Data Hooks
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { FiscalYearService } from "@/services";
import type { ClosingPreview, FiscalYearSummary } from "@/types/fiscal-year-closing";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useClosingPreview(fiscalYearId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.CLOSING_PREVIEW(fiscalYearId),
    queryFn: async () => {
      return FiscalYearService.getClosingPreview(fiscalYearId) as Promise<ClosingPreview>;
    },
    enabled,
  });
}

export function useFiscalYearSummary(fiscalYearId: string, hasClosing: boolean) {
  return useQuery({
    queryKey: QUERY_KEYS.FISCAL_YEAR_SUMMARY(fiscalYearId),
    queryFn: async () => {
      return FiscalYearService.calculateSummary(fiscalYearId) as unknown as FiscalYearSummary;
    },
    enabled: !hasClosing,
  });
}
