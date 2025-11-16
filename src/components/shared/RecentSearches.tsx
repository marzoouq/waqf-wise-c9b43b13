import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Clock, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['search_history']['Row']['filters'];

interface RecentSearchesProps {
  searchType: string;
  onSelectSearch: (query: string, filters?: Json) => void;
}

export function RecentSearches({ searchType, onSelectSearch }: RecentSearchesProps) {
  const queryClient = useQueryClient();

  const { data: recentSearches = [] } = useQuery({
    queryKey: ['recent-searches', searchType],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('search_type', searchType)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
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

  if (recentSearches.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          عمليات البحث الأخيرة
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => clearAllSearches.mutate()}
          className="h-8 text-xs"
        >
          مسح الكل
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <button
                  onClick={() => onSelectSearch(search.search_query, search.filters)}
                  className="flex-1 text-right"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{search.search_query}</span>
                    {search.results_count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {search.results_count} نتيجة
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(search.created_at).toLocaleDateString('ar-SA', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                  onClick={() => deleteSearch.mutate(search.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
