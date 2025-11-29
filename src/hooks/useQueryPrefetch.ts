/**
 * Hook للتحميل المسبق للـ queries الشائعة
 * يُحسّن أداء التنقل بين الصفحات
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// أنواع البيانات التي يمكن تحميلها مسبقاً
type PrefetchableQuery = 
  | 'beneficiaries'
  | 'properties'
  | 'funds'
  | 'documents'
  | 'journal_entries'
  | 'payment_vouchers';

// إعدادات التحميل المسبق لكل نوع
const PREFETCH_CONFIG: Record<PrefetchableQuery, {
  table: string;
  select: string;
  limit: number;
}> = {
  beneficiaries: {
    table: 'beneficiaries',
    select: 'id, full_name, national_id, phone, status, category',
    limit: 50,
  },
  properties: {
    table: 'properties',
    select: 'id, name, type, location, status',
    limit: 30,
  },
  funds: {
    table: 'funds',
    select: 'id, name, type, current_balance',
    limit: 20,
  },
  documents: {
    table: 'documents',
    select: 'id, name, type, created_at',
    limit: 30,
  },
  journal_entries: {
    table: 'journal_entries',
    select: 'id, entry_number, description, total_debit, status, entry_date',
    limit: 20,
  },
  payment_vouchers: {
    table: 'payment_vouchers',
    select: 'id, voucher_number, amount, status, created_at',
    limit: 20,
  },
};

export function useQueryPrefetch() {
  const queryClient = useQueryClient();
  
  const prefetchQuery = useCallback(async (queryType: PrefetchableQuery) => {
    const config = PREFETCH_CONFIG[queryType];
    if (!config) return;
    
    // التحقق من عدم وجود البيانات في الكاش
    const existingData = queryClient.getQueryData([queryType]);
    if (existingData) return;
    
    try {
      await queryClient.prefetchQuery({
        queryKey: [queryType, 'prefetch'],
        queryFn: async () => {
          // استخدام any للتغلب على قيود TypeScript مع الجداول الديناميكية
          const { data, error } = await (supabase
            .from(config.table as 'beneficiaries')
            .select(config.select)
            .limit(config.limit)
            .order('created_at', { ascending: false }) as unknown as Promise<{ data: unknown[]; error: Error | null }>);
          
          if (error) throw error;
          return data;
        },
        staleTime: 5 * 60 * 1000, // 5 دقائق
      });
    } catch {
      // تجاهل الأخطاء - التحميل المسبق اختياري
    }
  }, [queryClient]);
  
  const prefetchMultiple = useCallback((queries: PrefetchableQuery[]) => {
    queries.forEach(q => prefetchQuery(q));
  }, [prefetchQuery]);
  
  return { prefetchQuery, prefetchMultiple };
}

/**
 * Hook للتحميل المسبق التلقائي بناءً على الصفحة الحالية
 */
export function useAutoPrefetch(currentPage: string) {
  const { prefetchMultiple } = useQueryPrefetch();
  
  useEffect(() => {
    // تحميل مسبق بناءً على الصفحة الحالية
    const prefetchMap: Record<string, PrefetchableQuery[]> = {
      '/dashboard': ['beneficiaries', 'properties', 'payment_vouchers'],
      '/nazer-dashboard': ['beneficiaries', 'funds', 'journal_entries'],
      '/accountant-dashboard': ['journal_entries', 'payment_vouchers', 'funds'],
      '/cashier-dashboard': ['payment_vouchers', 'beneficiaries'],
      '/archivist-dashboard': ['documents'],
      '/beneficiaries': ['properties', 'funds'],
      '/accounting': ['payment_vouchers', 'funds'],
    };
    
    const queriesToPrefetch = prefetchMap[currentPage];
    if (queriesToPrefetch) {
      // تأخير لعدم التأثير على التحميل الأولي
      const timeoutId = setTimeout(() => {
        prefetchMultiple(queriesToPrefetch);
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, prefetchMultiple]);
}

export default useQueryPrefetch;
