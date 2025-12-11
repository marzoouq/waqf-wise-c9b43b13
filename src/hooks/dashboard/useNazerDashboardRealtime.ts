/**
 * useNazerDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة الناظر
 * يمنع تكرار الاشتراكات المتعددة
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ACTIVE_FISCAL_YEAR_QUERY_KEY, FISCAL_YEARS_QUERY_KEY } from "@/hooks/fiscal-years";
import { productionLogger } from "@/lib/logger/production-logger";

// الجداول التي يحتاج الناظر لمتابعتها
const NAZER_WATCHED_TABLES = [
  "beneficiaries",
  "properties", 
  "contracts",
  "loans",
  "journal_entries",
  "journal_entry_lines",
  "rental_payments",
  "fiscal_years",
  "fiscal_year_closings",
  "accounts",
  "distributions",
  "heir_distributions",
  "approvals",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها
const INVALIDATION_MAP: Record<string, string[][]> = {
  beneficiaries: [["nazer-kpis"], ["beneficiaries"]],
  properties: [["nazer-kpis"], ["properties"]],
  contracts: [["nazer-kpis"], ["contracts"], ["revenue-progress"]],
  loans: [["nazer-kpis"], ["loans"], ["pending-approvals"]],
  journal_entries: [["nazer-kpis"], ["journal-entries"], ["pending-approvals"], ["unified-dashboard-kpis"]],
  journal_entry_lines: [["nazer-kpis"], ["journal-entries"], ["unified-dashboard-kpis"]],
  rental_payments: [["revenue-progress"], ["rental-payments"]],
  fiscal_years: [ACTIVE_FISCAL_YEAR_QUERY_KEY as unknown as string[], FISCAL_YEARS_QUERY_KEY as unknown as string[]],
  fiscal_year_closings: [["waqf-corpus-realtime"]],
  accounts: [["bank-balance-realtime"], ["nazer-kpis"]],
  distributions: [["distributions"], ["pending-approvals"]],
  heir_distributions: [["heir-distributions"]],
  approvals: [["pending-approvals"], ["smart-alerts"]],
};

interface UseNazerDashboardRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (table: string, payload: unknown) => void;
}

/**
 * اشتراك موحد لجميع تحديثات لوحة الناظر
 */
export function useNazerDashboardRealtime(options: UseNazerDashboardRealtimeOptions = {}) {
  const { enabled = true, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("nazer-dashboard-unified");

    // إضافة اشتراك لكل جدول
    NAZER_WATCHED_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          productionLogger.debug(`Nazer Dashboard: ${table} updated`, { payload });
          
          // تحديث الاستعلامات المرتبطة
          const queryKeys = INVALIDATION_MAP[table] || [];
          queryKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey });
          });

          // callback خارجي
          onUpdate?.(table, payload);
        }
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        productionLogger.debug("Nazer Dashboard Realtime: Subscribed successfully");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, onUpdate]);
}

/**
 * تحديث جميع بيانات لوحة الناظر يدوياً
 */
export function useNazerDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // تحديث جميع الاستعلامات المرتبطة
    Object.values(INVALIDATION_MAP).flat().forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshAll };
}
