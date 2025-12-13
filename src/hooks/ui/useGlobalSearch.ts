/**
 * Global Search Hook - استخدام SearchService
 * @refactored 2.9.2 - نقل منطق Supabase إلى SearchService
 */

import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { SearchService, type SearchHistoryData } from '@/services/search.service';

export type { SearchHistoryData };

export function useGlobalSearch() {
  const { user } = useAuth();

  const saveSearchHistory = useMutation({
    mutationFn: async (data: SearchHistoryData) => {
      if (!user) return;
      await SearchService.saveGlobalSearchHistory(user.id, data);
    },
  });

  return { saveSearchHistory };
}
