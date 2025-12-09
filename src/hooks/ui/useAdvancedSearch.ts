import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchService } from '@/services/search.service';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    queryKey: QUERY_KEYS.SEARCH_HISTORY(searchType),
    queryFn: () => SearchService.getSearchHistory(searchType),
  });

  // حفظ عملية بحث
  const saveSearch = useMutation({
    mutationFn: async ({ query, filters, resultsCount }: { 
      query: string; 
      filters: SearchFilters; 
      resultsCount: number;
    }) => {
      await SearchService.saveSearchHistory(searchType, query, filters, resultsCount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SEARCH_HISTORY(searchType) });
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
    const searchFilters = customFilters || filters;
    
    const data = await SearchService.advancedSearch(tableName, columns, query, searchFilters);

    // حفظ في السجل
    await saveSearch.mutateAsync({
      query,
      filters: searchFilters,
      resultsCount: data.length,
    });

    return data;
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
