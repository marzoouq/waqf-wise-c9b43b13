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
import { QUERY_KEYS } from "@/lib/query-keys";

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
  "maintenance_requests", // طلبات صيانة المستأجرين
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها - باستخدام QUERY_KEYS الموحدة
const INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  beneficiaries: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.BENEFICIARIES, QUERY_KEYS.NAZER_BENEFICIARIES_QUICK],
  properties: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.PROPERTIES],
  contracts: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.CONTRACTS, ['revenue-progress'] as const],
  loans: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.LOANS, QUERY_KEYS.PENDING_APPROVALS],
  journal_entries: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.JOURNAL_ENTRIES, QUERY_KEYS.PENDING_APPROVALS, QUERY_KEYS.UNIFIED_KPIS],
  journal_entry_lines: [QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.JOURNAL_ENTRIES, QUERY_KEYS.UNIFIED_KPIS],
  rental_payments: [['revenue-progress'] as const, QUERY_KEYS.RENTAL_PAYMENTS],
  fiscal_years: [ACTIVE_FISCAL_YEAR_QUERY_KEY, FISCAL_YEARS_QUERY_KEY],
  fiscal_year_closings: [['waqf-corpus-realtime'] as const],
  accounts: [['bank-balance-realtime'] as const, QUERY_KEYS.NAZER_KPIS, QUERY_KEYS.NAZER_SYSTEM_OVERVIEW],
  distributions: [QUERY_KEYS.DISTRIBUTIONS, QUERY_KEYS.PENDING_APPROVALS],
  heir_distributions: [QUERY_KEYS.HEIR_DISTRIBUTIONS],
  approvals: [QUERY_KEYS.PENDING_APPROVALS, QUERY_KEYS.SMART_ALERTS],
  maintenance_requests: [['tenant-maintenance-requests'] as const, QUERY_KEYS.SMART_ALERTS], // تحديث طلبات الصيانة
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
