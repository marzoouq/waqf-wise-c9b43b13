/**
 * useArchivistDashboardRealtime Hook
 * قناة Realtime موحدة لجميع بيانات لوحة الأرشيفي
 * يمنع تكرار الاشتراكات المتعددة
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { productionLogger } from "@/lib/logger/production-logger";

// الجداول التي يحتاج الأرشيفي لمتابعتها
const ARCHIVIST_WATCHED_TABLES = [
  "documents",
  "document_categories",
  "archive_folders",
  "beneficiary_attachments",
  "contracts",
  "properties",
] as const;

// مفاتيح الاستعلامات التي يجب تحديثها
const INVALIDATION_MAP: Record<string, string[][]> = {
  documents: [["archivist-dashboard"], ["documents"], ["archive-stats"]],
  document_categories: [["archivist-dashboard"], ["document-categories"]],
  archive_folders: [["archivist-dashboard"], ["folders"]],
  beneficiary_attachments: [["archivist-dashboard"], ["beneficiary-attachments"]],
  contracts: [["archivist-dashboard"], ["contracts"]],
  properties: [["archivist-dashboard"], ["properties"]],
};

interface UseArchivistDashboardRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (table: string, payload: unknown) => void;
}

/**
 * اشتراك موحد لجميع تحديثات لوحة الأرشيفي
 */
export function useArchivistDashboardRealtime(options: UseArchivistDashboardRealtimeOptions = {}) {
  const { enabled = true, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase.channel("archivist-dashboard-unified");

    // إضافة اشتراك لكل جدول
    ARCHIVIST_WATCHED_TABLES.forEach((table) => {
      channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          productionLogger.debug(`Archivist Dashboard: ${table} updated`, { payload });
          
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
        productionLogger.debug("Archivist Dashboard Realtime: Subscribed successfully");
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, onUpdate]);
}

/**
 * تحديث جميع بيانات لوحة الأرشيفي يدوياً
 */
export function useArchivistDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    // تحديث جميع الاستعلامات المرتبطة
    Object.values(INVALIDATION_MAP).flat().forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };

  return { refreshAll };
}
