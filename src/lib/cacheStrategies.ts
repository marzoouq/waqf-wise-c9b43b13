/**
 * استراتيجيات التخزين المؤقت (Cache Strategies)
 * لتحسين أداء React Query
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * استراتيجية Cache-First
 * استخدم البيانات المخزنة أولاً، ثم جلب البيانات الجديدة في الخلفية
 */
export const cacheFirstStrategy = {
  staleTime: 5 * 60 * 1000, // 5 دقائق
  gcTime: 10 * 60 * 1000, // 10 دقائق
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

/**
 * استراتيجية Network-First
 * اجلب البيانات الجديدة أولاً، واستخدم الكاش عند الفشل
 */
export const networkFirstStrategy = {
  staleTime: 0,
  gcTime: 5 * 60 * 1000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

/**
 * استراتيجية Stale-While-Revalidate
 * أظهر البيانات المخزنة فوراً، وحدّثها في الخلفية
 */
export const staleWhileRevalidateStrategy = {
  staleTime: 2 * 60 * 1000, // دقيقتان
  gcTime: 10 * 60 * 1000,
  refetchOnMount: 'always' as const,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
};

/**
 * استراتيجية Cache-Only
 * استخدم البيانات المخزنة فقط، لا تجلب بيانات جديدة
 */
export const cacheOnlyStrategy = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

/**
 * استراتيجية للبيانات الثابتة (Static Data)
 * البيانات التي نادراً ما تتغير
 */
export const staticDataStrategy = {
  staleTime: 60 * 60 * 1000, // ساعة
  gcTime: 24 * 60 * 60 * 1000, // 24 ساعة
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
};

/**
 * استراتيجية للبيانات الحية (Realtime Data)
 * البيانات التي تتغير باستمرار
 */
export const realtimeDataStrategy = {
  staleTime: 0,
  gcTime: 30 * 1000, // 30 ثانية
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  refetchInterval: 10 * 1000, // 10 ثوانٍ
};

/**
 * تحسين الكاش للقوائم الكبيرة
 * يحتفظ بالصفحات المحملة لمدة أطول
 */
export const paginatedListStrategy = {
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000, // 30 دقيقة
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  keepPreviousData: true,
};

/**
 * تنظيف الكاش بذكاء
 * يحذف البيانات القديمة غير المستخدمة
 */
export function setupSmartCacheCleanup(queryClient: QueryClient) {
  // تنظيف كل 10 دقائق
  setInterval(() => {
    const now = Date.now();
    const cacheTime = 15 * 60 * 1000; // 15 دقيقة

    queryClient.getQueryCache().getAll().forEach((query) => {
      const lastUpdated = query.state.dataUpdatedAt;
      const timeSinceUpdate = now - lastUpdated;

      // احذف الاستعلامات القديمة غير المستخدمة
      if (timeSinceUpdate > cacheTime && query.getObserversCount() === 0) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, 10 * 60 * 1000);
}

/**
 * Prefetching للبيانات المتوقعة
 * يحمّل البيانات قبل أن يحتاجها المستخدم
 */
export async function prefetchNextPage<T>(
  queryClient: QueryClient,
  queryKey: any[],
  fetchFn: () => Promise<T>
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: fetchFn,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Optimistic Updates Helper
 * يحدث الواجهة فوراً قبل استلام الرد من السيرفر
 */
export function createOptimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: any[],
  updater: (old: T | undefined) => T
) {
  return {
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);
      
      queryClient.setQueryData<T>(queryKey, (old) => updater(old));
      
      return { previousData };
    },
    onError: (_err: any, _variables: any, context: any) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
