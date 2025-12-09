/**
 * Financial Cards Data Hooks - خطافات بيانات البطاقات المالية
 * @version 2.8.42
 */

import { useQuery } from "@tanstack/react-query";
import { DashboardService, type FiscalYearCorpus as ServiceFiscalYearCorpus } from "@/services";

// Re-export type for backward compatibility
export type FiscalYearCorpus = ServiceFiscalYearCorpus;

// ==================== Bank Balance Hook ====================
export function useBankBalance() {
  return useQuery({
    queryKey: ["bank-balance-realtime"],
    queryFn: () => DashboardService.getBankBalance(),
  });
}

// ==================== Waqf Corpus Hook ====================
export function useWaqfCorpus() {
  return useQuery({
    queryKey: ["waqf-corpus-realtime"],
    queryFn: () => DashboardService.getWaqfCorpus(),
  });
}
