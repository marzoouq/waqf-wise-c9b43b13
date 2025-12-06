/**
 * Hook for checking fiscal year publish status
 * يتحقق من حالة نشر السنة المالية للتحكم في ظهور البيانات للورثة
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FiscalYearPublishInfo {
  id: string;
  name: string;
  is_active: boolean;
  is_closed: boolean;
  is_published: boolean;
  published_at: string | null;
  start_date: string;
  end_date: string;
}

export function useFiscalYearPublishStatus() {
  // جلب السنة المالية النشطة
  const {
    data: activeFiscalYear,
    isLoading: activeLoading,
  } = useQuery({
    queryKey: ["active-fiscal-year-publish-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("id, name, is_active, is_closed, is_published, published_at, start_date, end_date")
        .eq("is_active", true)
        .single();

      if (error) return null;
      return data as FiscalYearPublishInfo;
    },
  });

  // جلب جميع السنوات المنشورة
  const {
    data: publishedYears = [],
    isLoading: publishedLoading,
  } = useQuery({
    queryKey: ["published-fiscal-years"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_years")
        .select("id, name, is_active, is_closed, is_published, published_at, start_date, end_date")
        .eq("is_published", true)
        .order("start_date", { ascending: false });

      if (error) return [];
      return data as FiscalYearPublishInfo[];
    },
  });

  // التحقق مما إذا كان يجب إظهار البيانات للورثة
  const isCurrentYearPublished = activeFiscalYear?.is_published || false;
  
  // الحصول على معرفات السنوات المنشورة
  const publishedFiscalYearIds = publishedYears.map(fy => fy.id);

  return {
    activeFiscalYear,
    publishedYears,
    isCurrentYearPublished,
    publishedFiscalYearIds,
    isLoading: activeLoading || publishedLoading,
  };
}
