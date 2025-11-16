import { useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface ProgressiveLoadingOptions {
  table: string;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, Json>;
}

/**
 * Hook محسّن للتحميل التدريجي (Progressive Loading)
 * يستخدم Infinite Query لتحميل البيانات على دفعات
 * 
 * @example
 * const { data, loadMore, hasMore, isLoading } = useProgressiveLoading({
 *   table: 'beneficiaries',
 *   pageSize: 20,
 *   orderBy: 'created_at',
 * });
 */
export const useProgressiveLoading = <T = any>({
  table,
  pageSize = 20,
  orderBy = 'created_at',
  orderDirection = 'desc',
  filters = {},
}: ProgressiveLoadingOptions) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: [table, 'progressive', filters, orderBy, orderDirection],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * pageSize;
      const to = from + pageSize - 1;

      // استعلام مبسط بدون أنواع معقدة
      // @ts-expect-error - Dynamic table name
      const { data: result, error: queryError, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order(orderBy, { ascending: orderDirection === 'asc' });

      if (queryError) throw queryError;

      return {
        data: (result || []) as T[],
        nextPage: (pageParam + 1) * pageSize < (count || 0) ? pageParam + 1 : undefined,
        count: count || 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // تجميع البيانات من جميع الصفحات
  const allData = data?.pages.flatMap((page) => page.data) ?? [];
  const totalCount = data?.pages[0]?.count ?? 0;

  return {
    data: allData,
    totalCount,
    loadMore,
    hasMore: hasNextPage,
    isLoading,
    isFetchingNextPage,
    error,
  };
};
