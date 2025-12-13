/**
 * Financial Cards Data Hooks - خطافات بيانات البطاقات المالية
 * @version 2.9.2
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DashboardService, RealtimeService, type FiscalYearCorpus as ServiceFiscalYearCorpus } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";
import { QUERY_KEYS, QUERY_CONFIG } from "@/lib/query-keys";

// Re-export type for backward compatibility
export type FiscalYearCorpus = ServiceFiscalYearCorpus;

// ==================== Bank Balance Hook ====================
export function useBankBalance() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Realtime subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      "accounts",
      (payload) => {
        const record = payload.new as { code?: string } | null;
        if (record?.code === "1.1.1") {
          productionLogger.info("Bank balance updated via realtime", { payload });
          setLastUpdated(new Date());
          setIsLive(true);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BANK_BALANCE_REALTIME });
          setTimeout(() => setIsLive(false), 3000);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: QUERY_KEYS.BANK_BALANCE_REALTIME,
    queryFn: () => DashboardService.getBankBalance(),
    ...QUERY_CONFIG.DEFAULT,
  });

  return {
    ...query,
    lastUpdated,
    isLive,
  };
}

// ==================== Waqf Corpus Hook ====================
export function useWaqfCorpus() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLive, setIsLive] = useState(false);

  // Realtime subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      "fiscal_year_closings",
      (payload) => {
        productionLogger.info("Waqf corpus updated via realtime", { payload });
        setLastUpdated(new Date());
        setIsLive(true);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAQF_CORPUS_REALTIME });
        setTimeout(() => setIsLive(false), 3000);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: QUERY_KEYS.WAQF_CORPUS_REALTIME,
    queryFn: () => DashboardService.getWaqfCorpus(),
    ...QUERY_CONFIG.DEFAULT,
  });

  return {
    ...query,
    lastUpdated,
    isLive,
  };
}
