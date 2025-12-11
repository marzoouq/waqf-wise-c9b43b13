/**
 * useAccountantDashboardRealtime Hook
 * التحديثات المباشرة الموحدة للوحة المحاسب
 * يجمع كل اشتراكات Realtime في channel واحد
 * 
 * @version 2.8.78
 */

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

// الجداول التي يراقبها المحاسب
const ACCOUNTANT_WATCHED_TABLES = [
  'journal_entries',
  'approvals',
  'accounts',
  'bank_accounts',
  'bank_transactions',
  'payments',
  'rental_payments',
  'fiscal_years',
  'fiscal_year_closings'
] as const;

// خريطة الإبطال - أي queryKey يجب إبطاله عند تغيير كل جدول
const INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  'journal_entries': [
    QUERY_KEYS.ACCOUNTANT_KPIS,
    ['journal-entries'] as const,
    ['recent_journal_entries'] as const,
    ['unified-dashboard-kpis'] as const
  ],
  'approvals': [
    QUERY_KEYS.ACCOUNTANT_KPIS,
    ['pending_approvals'] as const,
    ['unified-dashboard-kpis'] as const
  ],
  'accounts': [
    ['accounts'] as const,
    ['chart-of-accounts'] as const,
    ['trial-balance'] as const
  ],
  'bank_accounts': [
    ['bank-accounts'] as const,
    ['bank-balance'] as const
  ],
  'bank_transactions': [
    ['bank-transactions'] as const,
    ['bank-reconciliation'] as const
  ],
  'payments': [
    ['payments'] as const,
    ['unified-dashboard-kpis'] as const
  ],
  'rental_payments': [
    ['rental-payments'] as const,
    ['revenue-progress'] as const,
    ['unified-dashboard-kpis'] as const
  ],
  'fiscal_years': [
    ['fiscal-year'] as const,
    ['unified-dashboard-kpis'] as const
  ],
  'fiscal_year_closings': [
    ['fiscal-year-closings'] as const,
    ['waqf-corpus'] as const
  ]
};

interface UseAccountantDashboardRealtimeOptions {
  enabled?: boolean;
  onUpdate?: (table: string) => void;
}

/**
 * Hook للتحديثات المباشرة الموحدة للوحة المحاسب
 */
export function useAccountantDashboardRealtime(options: UseAccountantDashboardRealtimeOptions = {}) {
  const { enabled = true, onUpdate } = options;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    // إنشاء channel واحد موحد لكل جداول المحاسب
    const channel = supabase.channel('accountant-dashboard-realtime');

    // الاشتراك في كل الجداول
    ACCOUNTANT_WATCHED_TABLES.forEach(table => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          // إبطال الـ queries المرتبطة بهذا الجدول
          const keysToInvalidate = INVALIDATION_MAP[table] || [];
          keysToInvalidate.forEach(queryKey => {
            queryClient.invalidateQueries({ queryKey });
          });

          // استدعاء callback إن وجد
          onUpdate?.(table);
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient, onUpdate]);
}

/**
 * Hook لتحديث جميع بيانات لوحة المحاسب يدوياً
 */
export function useAccountantDashboardRefresh() {
  const queryClient = useQueryClient();

  const refreshAll = useCallback(() => {
    // إبطال جميع الـ queries المتعلقة بلوحة المحاسب
    Object.values(INVALIDATION_MAP).flat().forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  }, [queryClient]);

  return { refreshAll };
}
