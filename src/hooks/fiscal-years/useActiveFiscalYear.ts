/**
 * useActiveFiscalYear Hook
 * موحد لجلب السنة المالية النشطة
 * يستخدم في جميع المكونات بدلاً من تكرار الاستعلام
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

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

// مفتاح الاستعلام الموحد للسنة المالية النشطة
export const ACTIVE_FISCAL_YEAR_QUERY_KEY = ["fiscal-year", "active"] as const;

// مفتاح الاستعلام لجميع السنوات المالية
export const FISCAL_YEARS_QUERY_KEY = ["fiscal-years", "all"] as const;

/**
 * جلب السنة المالية النشطة مع Realtime
 */
export function useActiveFiscalYear() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ACTIVE_FISCAL_YEAR_QUERY_KEY,
    queryFn: async (): Promise<ActiveFiscalYear | null> => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      return data as ActiveFiscalYear | null;
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const channel = supabase
      .channel("active-fiscal-year-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fiscal_years",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ACTIVE_FISCAL_YEAR_QUERY_KEY });
          queryClient.invalidateQueries({ queryKey: FISCAL_YEARS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    activeFiscalYear: query.data,
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
    queryFn: async (): Promise<ActiveFiscalYear[]> => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return (data || []) as ActiveFiscalYear[];
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });

  // حساب الإحصائيات
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
