/**
 * Hook لإدارة عمليات البحث الأخيرة
 * Recent Searches Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchService, type RecentSearch } from '@/services/search.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export type { RecentSearch };

export function useRecentSearches(searchType: string) {
  const queryClient = useQueryClient();

  const { data: recentSearches = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.RECENT_SEARCHES(searchType),
    queryFn: () => SearchService.getRecentSearches(searchType),
  });

  const deleteSearch = useMutation({
    mutationFn: (id: string) => SearchService.deleteSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_SEARCHES(searchType) });
    },
  });

  const clearAllSearches = useMutation({
    mutationFn: () => SearchService.clearAllSearches(searchType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_SEARCHES(searchType) });
    },
  });

  return {
    recentSearches,
    isLoading,
    deleteSearch: deleteSearch.mutate,
    clearAllSearches: clearAllSearches.mutate,
    isDeleting: deleteSearch.isPending,
    isClearing: clearAllSearches.isPending,
  };
}
