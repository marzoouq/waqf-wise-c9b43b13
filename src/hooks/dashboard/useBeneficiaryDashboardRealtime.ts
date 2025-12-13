/**
 * useBeneficiaryDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات بوابة المستفيد
 * يمنع تكرار الاشتراكات المتعددة
 * 
 * @version 2.9.2 - Phase 2 QUERY_KEYS unification
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { QUERY_KEYS } from "@/lib/query-keys";

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

// مفاتيح الاستعلامات التي يجب تحديثها - باستخدام QUERY_KEYS الموحدة
const INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  beneficiaries: [QUERY_KEYS.BENEFICIARIES, QUERY_KEYS.BENEFICIARY_STATS],
  payments: [QUERY_KEYS.PAYMENTS, QUERY_KEYS.BENEFICIARY_STATS],
  distributions: [QUERY_KEYS.DISTRIBUTIONS, QUERY_KEYS.HEIR_DISTRIBUTIONS],
  heir_distributions: [QUERY_KEYS.HEIR_DISTRIBUTIONS, QUERY_KEYS.DISTRIBUTIONS],
  beneficiary_requests: [QUERY_KEYS.REQUESTS],
  properties: [QUERY_KEYS.PROPERTIES, QUERY_KEYS.PROPERTY_STATS],
  contracts: [QUERY_KEYS.CONTRACTS, QUERY_KEYS.PROPERTY_STATS],
  rental_payments: [QUERY_KEYS.RENTAL_PAYMENTS],
  loans: [QUERY_KEYS.LOANS],
  fiscal_years: [QUERY_KEYS.FISCAL_YEAR_ACTIVE, QUERY_KEYS.FISCAL_YEARS],
  annual_disclosures: [QUERY_KEYS.ANNUAL_DISCLOSURES],
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
