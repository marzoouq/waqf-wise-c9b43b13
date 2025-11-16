import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  [key: string]: string | number | boolean | null | undefined | { gte: string; lte: string } | string[];
}

interface SearchHistoryItem {
  id: string;
  search_query: string;
  search_type: string;
  filters: SearchFilters | null;
  results_count: number;
  created_at: string;
}

/**
 * Hook للبحث المتقدم مع حفظ التاريخ
 */
export function useAdvancedSearch(searchType: string) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const queryClient = useQueryClient();

  // جلب سجل البحث
  const { data: history = [] } = useQuery({
    queryKey: ['search-history', searchType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('search_type', searchType)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as SearchHistoryItem[];
    },
  });

  // حفظ عملية بحث
  const saveSearch = useMutation({
    mutationFn: async ({ query, filters, resultsCount }: { 
      query: string; 
      filters: SearchFilters; 
      resultsCount: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user?.id,
          search_query: query,
          search_type: searchType,
          filters,
          results_count: resultsCount,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history', searchType] });
    },
  });

  /**
   * تنفيذ البحث المتقدم
   */
  const search = async (
    tableName: string,
    columns: string = '*',
    customFilters?: SearchFilters
  ): Promise<unknown[]> => {
    // @ts-expect-error - Dynamic table name
    let dbQuery = supabase.from(tableName).select(columns);

    const searchFilters = customFilters || filters;

    // تطبيق البحث النصي
    if (query) {
      // البحث في عدة أعمدة
      const searchColumns = ['full_name', 'national_id', 'phone', 'email', 'notes'];
      const orConditions = searchColumns.map(col => `${col}.ilike.%${query}%`).join(',');
      dbQuery = dbQuery.or(orConditions);
    }

    // تطبيق الفلاتر
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          // @ts-expect-error - Dynamic column filtering
          dbQuery = dbQuery.in(key, value);
        } else if (typeof value === 'object' && value && 'gte' in value && 'lte' in value) {
          dbQuery = dbQuery.gte(key, value.gte as string).lte(key, value.lte as string);
        } else {
          dbQuery = dbQuery.eq(key, value as string);
        }
      }
    });

    const { data, error } = await dbQuery;

    if (error) throw error;

    // حفظ في السجل
    await saveSearch.mutateAsync({
      query,
      filters: searchFilters,
      resultsCount: data?.length || 0,
    });

    return data || [];
  };

  /**
   * تطبيق بحث من التاريخ
   */
  const applyHistorySearch = (historyItem: SearchHistoryItem) => {
    setQuery(historyItem.search_query);
    setFilters(historyItem.filters || {});
  };

  /**
   * مسح البحث
   */
  const clearSearch = () => {
    setQuery('');
    setFilters({});
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    history,
    search,
    applyHistorySearch,
    clearSearch,
    isLoading: saveSearch.isPending,
  };
}
