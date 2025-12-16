import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIntelligentSearch, SearchType, SearchResult } from '@/hooks/ai/useIntelligentSearch';
import { 
  Search, 
  FileText, 
  User, 
  Building, 
  FileSignature, 
  Clock,
  X,
  Sparkles
} from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

const searchTypeOptions: { value: SearchType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'الكل', icon: <Search className="h-4 w-4" /> },
  { value: 'documents', label: 'المستندات', icon: <FileText className="h-4 w-4" /> },
  { value: 'ocr', label: 'محتوى OCR', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'beneficiaries', label: 'المستفيدين', icon: <User className="h-4 w-4" /> },
  { value: 'contracts', label: 'العقود', icon: <FileSignature className="h-4 w-4" /> },
  { value: 'properties', label: 'العقارات', icon: <Building className="h-4 w-4" /> },
];

const typeIcons: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4 text-blue-500" />,
  ocr_content: <Sparkles className="h-4 w-4 text-purple-500" />,
  beneficiary: <User className="h-4 w-4 text-green-500" />,
  contract: <FileSignature className="h-4 w-4 text-orange-500" />,
  property: <Building className="h-4 w-4 text-cyan-500" />,
};

const typeLabels: Record<string, string> = {
  document: 'مستند',
  ocr_content: 'محتوى',
  beneficiary: 'مستفيد',
  contract: 'عقد',
  property: 'عقار',
};

interface IntelligentSearchBarProps {
  onResultClick?: (result: SearchResult) => void;
}

export function IntelligentSearchBar({ onResultClick }: IntelligentSearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [isOpen, setIsOpen] = useState(false);
  
  const { 
    search, 
    isSearching, 
    results, 
    totalResults,
    recentSearches,
    clearRecentSearches,
    reset 
  } = useIntelligentSearch();

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      search({ query, searchType });
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    onResultClick?.(result);
  };

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    search({ query: term, searchType });
    setIsOpen(true);
  };

  const clearSearch = () => {
    setQuery('');
    reset();
    setIsOpen(false);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex gap-2">
        <Select value={searchType} onValueChange={(v) => setSearchType(v as SearchType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {searchTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="flex-1 relative">
              <Input
                placeholder="ابحث في كل شيء..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsOpen(true)}
                className="pr-10"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            {isSearching ? (
              <div className="p-4">
                <LoadingState message="جاري البحث..." />
              </div>
            ) : results.length > 0 ? (
              <Command>
                <CommandList className="max-h-[400px]">
                  <CommandGroup heading={`${totalResults} نتيجة`}>
                    {results.map((result) => (
                      <CommandItem
                        key={`${result.type}-${result.id}`}
                        onSelect={() => handleResultClick(result)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className="mt-1">
                            {typeIcons[result.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">{result.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {typeLabels[result.type]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                          </div>
                          <Badge 
                            variant={result.relevanceScore > 0.7 ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {(result.relevanceScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            ) : recentSearches.length > 0 && !query ? (
              <Command>
                <CommandList>
                  <CommandGroup heading="عمليات البحث الأخيرة">
                    {recentSearches.map((term, index) => (
                      <CommandItem
                        key={`recent-${index}-${term}`}
                        onSelect={() => handleRecentSearch(term)}
                        className="cursor-pointer"
                      >
                        <Clock className="h-4 w-4 ml-2 text-muted-foreground" />
                        {term}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="w-full text-muted-foreground"
                  >
                    مسح سجل البحث
                  </Button>
                </div>
              </Command>
            ) : query.length > 0 && query.length < 2 ? (
              <div className="p-4 text-center text-muted-foreground">
                أدخل حرفين على الأقل للبحث
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                لم يتم العثور على نتائج
              </div>
            )}
          </PopoverContent>
        </Popover>
        
        <Button onClick={handleSearch} disabled={isSearching || query.length < 2}>
          <Search className="h-4 w-4 ml-2" />
          بحث
        </Button>
      </div>
    </div>
  );
}
