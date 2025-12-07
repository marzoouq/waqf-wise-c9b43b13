/**
 * useCashierDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة أمين الصندوق
 * يمنع تكرار الاشتراكات المتعددة
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

// الجداول التي يحتاج أمين الصندوق لمتابعتها
const CASHIER_WATCHED_TABLES = [
  "bank_accounts",
  "journal_entries",
  "payment_vouchers",
  "rental_payments",
  "accounts",
  "approvals",
  "distributions",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها
const INVALIDATION_MAP: Record<string, string[][]> = {
  bank_accounts: [["cashier-stats"], ["bank-accounts"], ["bank-balance-realtime"]],
  journal_entries: [["cashier-stats"], ["journal-entries"]],
  payment_vouchers: [["cashier-stats"], ["payment-vouchers"]],
  rental_payments: [["cashier-stats"], ["rental-payments"]],
  accounts: [["cashier-stats"], ["accounts"]],
  approvals: [["cashier-stats"], ["pending-approvals"]],
  distributions: [["cashier-stats"], ["distributions"]],
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
