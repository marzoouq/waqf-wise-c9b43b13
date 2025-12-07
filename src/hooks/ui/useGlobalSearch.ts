import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SearchHistoryData {
  query: string;
  resultsCount: number;
}

export function useGlobalSearch() {
  const { user } = useAuth();

  const saveSearchHistory = useMutation({
    mutationFn: async (data: SearchHistoryData) => {
      if (!user) return;
      
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: user.id,
          search_query: data.query,
          search_type: 'global',
          results_count: data.resultsCount,
        });
      
      if (error) throw error;
    },
  });

  return { saveSearchHistory };
}
