/**
 * useCashierDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة أمين الصندوق
 * يمنع تكرار الاشتراكات المتعددة
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { QUERY_KEYS } from "@/lib/query-keys";

// الجداول التي يحتاج أمين الصندوق لمتابعتها
const CASHIER_WATCHED_TABLES = [
  "bank_accounts",
  "journal_entries",
  "journal_entry_lines",
  "payment_vouchers",
  "rental_payments",
  "accounts",
  "approvals",
  "distributions",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها - استخدام QUERY_KEYS
const INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  bank_accounts: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.BANK_ACCOUNTS, QUERY_KEYS.BANK_BALANCE_REALTIME],
  journal_entries: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.JOURNAL_ENTRIES, QUERY_KEYS.UNIFIED_KPIS],
  journal_entry_lines: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.JOURNAL_ENTRIES, QUERY_KEYS.UNIFIED_KPIS],
  payment_vouchers: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.PAYMENT_VOUCHERS],
  rental_payments: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.RENTAL_PAYMENTS],
  accounts: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.ACCOUNTS],
  approvals: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.PENDING_APPROVALS],
  distributions: [QUERY_KEYS.CASHIER_STATS, QUERY_KEYS.DISTRIBUTIONS],
};

interface UseCashierDashboardRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (table: string, payload: unknown) => void;
}

/**
 * اشتراك موحد لجميع تحديثات لوحة أمين الصندوق
 */
export function useCashierDashboardRealtime(options: UseCashierDashboardRealtimeOptions = {}) {
  const { enabled = true, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("cashier-dashboard-unified");

    // إضافة اشتراك لكل جدول
    CASHIER_WATCHED_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          productionLogger.debug(`Cashier Dashboard: ${table} updated`, { payload });
          
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
        productionLogger.debug("Cashier Dashboard Realtime: Subscribed successfully");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, onUpdate]);
}

/**
 * تحديث جميع بيانات لوحة أمين الصندوق يدوياً
 */
export function useCashierDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // تحديث جميع الاستعلامات المرتبطة
    Object.values(INVALIDATION_MAP).flat().forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshAll };
}
