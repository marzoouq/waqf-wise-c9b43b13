/**
 * useAdminDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة المشرف
 * يمنع تكرار الاشتراكات المتعددة
 * @version 2.9.2 - Phase 1 QUERY_KEYS unification
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";
import { QUERY_KEYS } from "@/lib/query-keys";

// الجداول التي يحتاج المشرف لمتابعتها
const ADMIN_WATCHED_TABLES = [
  "beneficiaries",
  "properties",
  "user_roles",
  "profiles",
  "audit_logs",
  "system_alerts",
  "login_attempts_log",
  "activities",
  "families",
  "funds",
  "beneficiary_requests",
  "system_error_logs",
  "system_health_checks",
  "fiscal_years",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها - باستخدام QUERY_KEYS الموحدة
const INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  beneficiaries: [QUERY_KEYS.ADMIN_KPIS, QUERY_KEYS.BENEFICIARIES],
  properties: [QUERY_KEYS.ADMIN_KPIS, QUERY_KEYS.PROPERTIES],
  user_roles: [QUERY_KEYS.ADMIN_KPIS, QUERY_KEYS.USER_STATS, QUERY_KEYS.USERS, QUERY_KEYS.ROLES_OVERVIEW],
  profiles: [QUERY_KEYS.USER_STATS, QUERY_KEYS.USERS_ACTIVITY_METRICS],
  audit_logs: [QUERY_KEYS.AUDIT_LOGS, QUERY_KEYS.SECURITY_ALERTS],
  system_alerts: [QUERY_KEYS.SECURITY_ALERTS, QUERY_KEYS.SYSTEM_HEALTH, QUERY_KEYS.SYSTEM_ALERTS],
  login_attempts_log: [QUERY_KEYS.USERS_ACTIVITY_METRICS, QUERY_KEYS.SECURITY_ALERTS],
  activities: [QUERY_KEYS.USERS_ACTIVITY_METRICS, QUERY_KEYS.ACTIVITIES],
  families: [QUERY_KEYS.ADMIN_KPIS],
  funds: [QUERY_KEYS.ADMIN_KPIS],
  beneficiary_requests: [QUERY_KEYS.ADMIN_KPIS, QUERY_KEYS.REQUESTS],
  system_error_logs: [QUERY_KEYS.SYSTEM_ERROR_LOGS, QUERY_KEYS.RECENT_ERRORS, QUERY_KEYS.SYSTEM_STATS],
  system_health_checks: [QUERY_KEYS.SYSTEM_HEALTH, QUERY_KEYS.SYSTEM_STATS],
  fiscal_years: [['fiscal-year', 'active'], ['fiscal-years', 'all']],
};

interface UseAdminDashboardRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (table: string, payload: unknown) => void;
}

/**
 * اشتراك موحد لجميع تحديثات لوحة المشرف
 */
export function useAdminDashboardRealtime(options: UseAdminDashboardRealtimeOptions = {}) {
  const { enabled = true, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("admin-dashboard-unified");

    // إضافة اشتراك لكل جدول
    ADMIN_WATCHED_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          productionLogger.debug(`Admin Dashboard: ${table} updated`, { payload });
          
          // تحديث الاستعلامات المرتبطة
          const queryKeys = INVALIDATION_MAP[table] || [];
          queryKeys.forEach((queryKey) => {
            queryClient.invalidateQueries({ queryKey: [...queryKey] });
          });

          // callback خارجي
          onUpdate?.(table, payload);
        }
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        productionLogger.debug("Admin Dashboard Realtime: Subscribed successfully");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, onUpdate]);
}

/**
 * تحديث جميع بيانات لوحة المشرف يدوياً
 */
export function useAdminDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // تحديث جميع الاستعلامات المرتبطة بلوحة المشرف - باستخدام QUERY_KEYS الموحدة
    const adminQueryKeys = [
      QUERY_KEYS.ADMIN_KPIS,
      QUERY_KEYS.USER_STATS,
      QUERY_KEYS.USERS_ACTIVITY_METRICS,
      QUERY_KEYS.SYSTEM_HEALTH,
      QUERY_KEYS.SECURITY_ALERTS,
      QUERY_KEYS.AUDIT_LOGS,
      QUERY_KEYS.SYSTEM_PERFORMANCE_METRICS,
      QUERY_KEYS.SYSTEM_ERROR_LOGS,
      QUERY_KEYS.SYSTEM_STATS,
      QUERY_KEYS.BACKUP_LOGS,
      QUERY_KEYS.AI_INSIGHTS,
      QUERY_KEYS.LOGIN_ATTEMPTS,
      QUERY_KEYS.FISCAL_YEARS,
      QUERY_KEYS.ROLES_OVERVIEW,
    ];
    
    adminQueryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey: [...queryKey] });
    });
    
    // Revenue Progress - invalidate separately as it uses a function-based key
    queryClient.invalidateQueries({ queryKey: ['revenue-progress'] });
  };

  return { refreshAll };
}
