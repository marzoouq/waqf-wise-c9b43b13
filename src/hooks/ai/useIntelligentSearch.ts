import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface SearchResult {
  id: string;
  type: 'document' | 'ocr_content' | 'beneficiary' | 'contract' | 'property';
  title: string;
  description: string;
  relevanceScore: number;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  searchType: string;
  totalResults: number;
  results: SearchResult[];
}

export type SearchType = 'all' | 'documents' | 'ocr' | 'beneficiaries' | 'contracts' | 'properties';

export function useIntelligentSearch() {
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('recent_searches');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const searchMutation = useMutation({
    mutationFn: async ({ 
      query, 
      searchType = 'all',
      limit = 20 
    }: { 
      query: string; 
      searchType?: SearchType;
      limit?: number;
    }): Promise<SearchResponse> => {
      const { data, error } = await supabase.functions.invoke('intelligent-search', {
        body: { query, searchType, limit }
      });

      if (error) throw error;
      return data as SearchResponse;
    },
    onSuccess: (data, variables) => {
      // حفظ البحث في السجل المحلي
      const newSearches = [
        variables.query,
        ...recentSearches.filter(s => s !== variables.query)
      ].slice(0, 10);
      
      setRecentSearches(newSearches);
      localStorage.setItem('recent_searches', JSON.stringify(newSearches));
    },
    onError: (error) => {
      logger.error(error, { context: 'intelligent_search', severity: 'medium' });
      toast({
        title: 'خطأ في البحث',
        description: 'فشل البحث الذكي، حاول مرة أخرى',
        variant: 'destructive',
      });
    },
  });

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return {
    search: searchMutation.mutate,
    searchAsync: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    results: searchMutation.data?.results || [],
    totalResults: searchMutation.data?.totalResults || 0,
    recentSearches,
    clearRecentSearches,
    reset: searchMutation.reset,
  };
}
