import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useGlobalSearchData, type SearchResult } from '@/hooks/search/useGlobalSearchData';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { saveSearchHistory } = useGlobalSearch();
  const { searchResults } = useGlobalSearchData(searchQuery);

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    setSearchQuery('');
    
    // حفظ في السجل
    saveSearchHistory.mutate({
      query: searchQuery,
      resultsCount: searchResults.length,
    });
  };

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      beneficiary: 'مستفيد',
      property: 'عقار',
      loan: 'قرض',
      contract: 'عقد',
      document: 'مستند',
      distribution: 'توزيع',
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      beneficiary: 'bg-info-light text-info',
      property: 'bg-success-light text-success',
      loan: 'bg-secondary text-secondary-foreground',
      contract: 'bg-warning-light text-warning',
      document: 'bg-muted text-muted-foreground',
      distribution: 'bg-accent/10 text-accent',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="ابحث في كل شيء... (Ctrl+K)"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {searchQuery.length < 2 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">اكتب حرفين على الأقل للبحث</p>
              <p className="text-xs mt-1">يمكنك البحث في المستفيدين، العقارات، القروض، المستندات</p>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد نتائج</p>
            </div>
          )}
        </CommandEmpty>

        {searchResults.length > 0 && (
          <>
            {/* تجميع النتائج حسب النوع */}
            {['beneficiary', 'property', 'loan', 'document'].map((type) => {
              const typeResults = searchResults.filter((r) => r.type === type);
              if (typeResults.length === 0) return null;

              return (
                <CommandGroup key={type} heading={getTypeLabel(type)}>
                  {typeResults.map((result) => {
                    const Icon = result.icon;
                    return (
                      <CommandItem
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{result.title}</p>
                            <Badge variant="outline" className={`text-xs ${getTypeBadgeColor(result.type)}`}>
                              {getTypeLabel(result.type)}
                            </Badge>
                          </div>
                          {result.subtitle && (
                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                          )}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
