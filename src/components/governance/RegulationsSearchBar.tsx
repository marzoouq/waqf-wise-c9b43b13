/**
 * شريط البحث في اللائحة التنفيذية
 * Regulations Search Bar Component
 */

import { Search, X, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchResult } from '@/hooks/governance/useRegulationsSearch';

interface RegulationsSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClear: () => void;
  searchResults: SearchResult[];
  onResultClick: (result: SearchResult) => void;
  resultsCount: number;
}

export function RegulationsSearchBar({
  searchQuery,
  onSearchChange,
  onClear,
  searchResults,
  onResultClick,
  resultsCount,
}: RegulationsSearchBarProps) {
  const showResults = searchQuery.length >= 2 && searchResults.length > 0;

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ابحث في اللائحة التنفيذية..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pr-10 pl-20"
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {resultsCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {resultsCount} نتيجة
            </Badge>
          )}
        </div>
      </div>

      {/* نتائج البحث */}
      {showResults && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg border-primary/20">
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              <div className="divide-y">
                {searchResults.slice(0, 10).map((result, index) => (
                  <button
                    key={`${result.partId}-${index}`}
                    onClick={() => onResultClick(result)}
                    className="w-full text-right p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">
                          {result.partTitle}
                        </p>
                        {result.chapterTitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            ← {result.chapterTitle}
                          </p>
                        )}
                        <p className="text-sm font-medium text-foreground line-clamp-2 mt-1">
                          {result.matchedItem}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {searchResults.length > 10 && (
                  <div className="p-2 text-center text-xs text-muted-foreground bg-muted/30">
                    +{searchResults.length - 10} نتيجة أخرى
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* لا توجد نتائج */}
      {searchQuery.length >= 2 && searchResults.length === 0 && (
        <Card className="absolute z-50 w-full mt-1 shadow-lg">
          <CardContent className="p-4 text-center text-muted-foreground text-sm">
            لا توجد نتائج لـ "{searchQuery}"
          </CardContent>
        </Card>
      )}
    </div>
  );
}
