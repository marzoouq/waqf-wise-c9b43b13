/**
 * useActiveFiscalYear Hook
 * موحد لجلب السنة المالية النشطة
 * يستخدم FiscalYearService + RealtimeService
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { FiscalYearService, RealtimeService } from "@/services";

export interface ActiveFiscalYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_closed: boolean;
  is_published: boolean;
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

export const ACTIVE_FISCAL_YEAR_QUERY_KEY = ["fiscal-year", "active"] as const;
export const FISCAL_YEARS_QUERY_KEY = ["fiscal-years", "all"] as const;

/**
 * جلب السنة المالية النشطة مع Realtime
 */
export function useActiveFiscalYear() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ACTIVE_FISCAL_YEAR_QUERY_KEY,
    queryFn: () => FiscalYearService.getActive(),
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'fiscal_years',
      () => {
        queryClient.invalidateQueries({ queryKey: ACTIVE_FISCAL_YEAR_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: FISCAL_YEARS_QUERY_KEY });
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  return {
    activeFiscalYear: query.data as ActiveFiscalYear | null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ACTIVE_FISCAL_YEAR_QUERY_KEY }),
  };
}

/**
 * جلب جميع السنوات المالية
 */
export function useFiscalYearsList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: FISCAL_YEARS_QUERY_KEY,
    queryFn: () => FiscalYearService.getAll(),
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  const closedYearsCount = query.data?.filter(fy => fy.is_closed).length || 0;
  const publishedYearsCount = query.data?.filter(fy => fy.is_published).length || 0;
  const activeFiscalYear = query.data?.find(fy => fy.is_active) || null;

  return {
    fiscalYears: query.data || [],
    activeFiscalYear,
    closedYearsCount,
    publishedYearsCount,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: FISCAL_YEARS_QUERY_KEY }),
  };
}

/**
 * جلب حالة النشر للسنة المالية النشطة
 */
export function useFiscalYearPublishInfo() {
  const { activeFiscalYear, isLoading } = useActiveFiscalYear();

  const isCurrentYearPublished = activeFiscalYear?.is_published || false;
  const isCurrentYearClosed = activeFiscalYear?.is_closed || false;

  return {
    activeFiscalYear,
    isCurrentYearPublished,
    isCurrentYearClosed,
    publishedAt: activeFiscalYear?.published_at || null,
    isLoading,
  };
}
