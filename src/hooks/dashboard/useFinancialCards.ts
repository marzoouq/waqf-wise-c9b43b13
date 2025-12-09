/**
 * Financial Cards Data Hooks - خطافات بيانات البطاقات المالية
 * @version 2.8.45
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { DashboardService, RealtimeService, type FiscalYearCorpus as ServiceFiscalYearCorpus } from "@/services";
import { productionLogger } from "@/lib/logger/production-logger";

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
          queryClient.invalidateQueries({ queryKey: ["bank-balance-realtime"] });
          setTimeout(() => setIsLive(false), 3000);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["bank-balance-realtime"],
    queryFn: () => DashboardService.getBankBalance(),
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
        queryClient.invalidateQueries({ queryKey: ["waqf-corpus-realtime"] });
        setTimeout(() => setIsLive(false), 3000);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const query = useQuery({
    queryKey: ["waqf-corpus-realtime"],
    queryFn: () => DashboardService.getWaqfCorpus(),
  });

  return {
    ...query,
    lastUpdated,
    isLive,
  };
}
