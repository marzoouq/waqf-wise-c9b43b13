/**
 * Hook لإدارة عمليات البحث الأخيرة
 * Recent Searches Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['search_history']['Row']['filters'];

export interface RecentSearch {
  id: string;
  search_query: string;
  filters: Json;
  results_count: number;
  created_at: string;
}

export function useRecentSearches(searchType: string) {
  const queryClient = useQueryClient();

  const { data: recentSearches = [], isLoading } = useQuery({
    queryKey: ['recent-searches', searchType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('id, search_query, filters, results_count, created_at')
        .eq('user_id', user.id)
        .eq('search_type', searchType)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as RecentSearch[];
    },
  });

  const deleteSearch = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches', searchType] });
    },
  });

  const clearAllSearches = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user.id)
        .eq('search_type', searchType);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-searches', searchType] });
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
