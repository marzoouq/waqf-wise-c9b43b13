/**
 * Hook for checking fiscal year publish status
 * يتحقق من حالة نشر السنة المالية للتحكم في ظهور البيانات للورثة
 * 
 * @deprecated استخدم useFiscalYearPublishInfo من @/hooks/fiscal-years بدلاً من هذا
 */

import { useActiveFiscalYear, useFiscalYearsList } from "@/hooks/fiscal-years";

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
  const { activeFiscalYear, isLoading: activeLoading } = useActiveFiscalYear();
  const { fiscalYears, isLoading: listLoading } = useFiscalYearsList();

  // جلب جميع السنوات المنشورة
  const publishedYears = fiscalYears.filter(fy => fy.is_published);

  // التحقق مما إذا كان يجب إظهار البيانات للورثة
  const isCurrentYearPublished = activeFiscalYear?.is_published || false;
  
  // الحصول على معرفات السنوات المنشورة
  const publishedFiscalYearIds = publishedYears.map(fy => fy.id);

  return {
    activeFiscalYear: activeFiscalYear as FiscalYearPublishInfo | null,
    publishedYears: publishedYears as FiscalYearPublishInfo[],
    isCurrentYearPublished,
    publishedFiscalYearIds,
    isLoading: activeLoading || listLoading,
  };
}
