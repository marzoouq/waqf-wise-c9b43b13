import { Clock, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database } from '@/integrations/supabase/types';
import { useRecentSearches } from '@/hooks/search/useRecentSearches';

type Json = Database['public']['Tables']['search_history']['Row']['filters'];

interface RecentSearchesProps {
  searchType: string;
  onSelectSearch: (query: string, filters?: Json) => void;
}

export function RecentSearches({ searchType, onSelectSearch }: RecentSearchesProps) {
  const { 
    recentSearches, 
    deleteSearch, 
    clearAllSearches, 
    isDeleting, 
    isClearing 
  } = useRecentSearches(searchType);

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
          onClick={() => clearAllSearches()}
          disabled={isClearing}
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
                  className="flex-1 text-start"
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
                  onClick={() => deleteSearch(search.id)}
                  disabled={isDeleting}
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
