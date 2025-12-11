/**
 * useBeneficiaryDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات بوابة المستفيد
 * يمنع تكرار الاشتراكات المتعددة
 * 
 * @version 2.8.91
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

// الجداول التي يحتاج المستفيد لمتابعتها
const BENEFICIARY_WATCHED_TABLES = [
  "beneficiaries",
  "payments",
  "distributions",
  "heir_distributions",
  "beneficiary_requests",
  "properties",
  "contracts",
  "rental_payments",
  "loans",
  "fiscal_years",
  "annual_disclosures",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها
const INVALIDATION_MAP: Record<string, string[][]> = {
  beneficiaries: [["beneficiary-portal-data"], ["beneficiary-statistics"]],
  payments: [["beneficiary-portal-data"], ["beneficiary-statistics"], ["beneficiary-payments"]],
  distributions: [["distributions"], ["beneficiary-distributions"], ["waqf-distributions-summary"]],
  heir_distributions: [["heir-distributions"], ["beneficiary-distributions"], ["waqf-distributions-summary"]],
  beneficiary_requests: [["beneficiary-requests"], ["pending-requests"]],
  properties: [["properties"], ["property-stats"]],
  contracts: [["contracts"], ["property-stats"]],
  rental_payments: [["rental-payments"], ["revenue-progress"]],
  loans: [["loans"], ["beneficiary-loans"]],
  fiscal_years: [["fiscal-year", "active"], ["fiscal-years"]],
  annual_disclosures: [["annual-disclosures"], ["disclosures"]],
};

interface UseBeneficiaryDashboardRealtimeOptions {
  enabled?: boolean;
  beneficiaryId?: string;
  onUpdate?: (table: string, payload: unknown) => void;
}

/**
 * اشتراك موحد لجميع تحديثات بوابة المستفيد
 */
export function useBeneficiaryDashboardRealtime(options: UseBeneficiaryDashboardRealtimeOptions = {}) {
  const { enabled = true, beneficiaryId, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("beneficiary-dashboard-unified");

    // إضافة اشتراك لكل جدول
    BENEFICIARY_WATCHED_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          productionLogger.debug(`Beneficiary Dashboard: ${table} updated`, { payload });
          
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
        productionLogger.debug("Beneficiary Dashboard Realtime: Subscribed successfully");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, beneficiaryId, queryClient, onUpdate]);
}

/**
 * تحديث جميع بيانات بوابة المستفيد يدوياً
 */
export function useBeneficiaryDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // تحديث جميع الاستعلامات المرتبطة
    Object.values(INVALIDATION_MAP).flat().forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshAll };
}
