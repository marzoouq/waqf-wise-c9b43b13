/**
 * useAdminDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة المشرف
 * يمنع تكرار الاشتراكات المتعددة
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

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
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها
const INVALIDATION_MAP: Record<string, string[][]> = {
  beneficiaries: [["admin-kpis"], ["beneficiaries"]],
  properties: [["admin-kpis"], ["properties"]],
  user_roles: [["admin-kpis"], ["user-stats"], ["users"]],
  profiles: [["user-stats"], ["users-activity-metrics"]],
  audit_logs: [["audit-logs"], ["security-alerts"]],
  system_alerts: [["security-alerts"], ["system-health"]],
  login_attempts_log: [["users-activity-metrics"], ["security-alerts"]],
  activities: [["users-activity-metrics"], ["activities"]],
  families: [["admin-kpis"]],
  funds: [["admin-kpis"]],
  beneficiary_requests: [["admin-kpis"], ["requests"]],
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
            queryClient.invalidateQueries({ queryKey });
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
    // تحديث جميع الاستعلامات المرتبطة بلوحة المشرف
    const adminQueryKeys = [
      ["admin-kpis"],
      ["user-stats"],
      ["users-activity-metrics"],
      ["system-health"],
      ["security-alerts"],
      ["audit-logs"],
      ["system-performance-metrics"],
    ];
    
    adminQueryKeys.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshAll };
}
