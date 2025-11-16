import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Search, Users, Building2, FileText, DollarSign, Calendar, Archive, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  SearchResult,
  BeneficiarySearchResult,
  PropertySearchResult,
  LoanSearchResult,
  DocumentSearchResult
} from '@/types/search';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // البحث في المستفيدين
  const { data: beneficiaries = [] } = useQuery({
    queryKey: ['global-search-beneficiaries', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, national_id, phone, category')
        .or(`full_name.ilike.%${searchQuery}%,national_id.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // البحث في العقارات
  const { data: properties = [] } = useQuery({
    queryKey: ['global-search-properties', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, location, status')
        .or(`name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // البحث في القروض
  const { data: loans = [] } = useQuery({
    queryKey: ['global-search-loans', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('loans')
        .select('id, loan_number, loan_amount, beneficiaries(full_name)')
        .or(`loan_number.ilike.%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // البحث في المستندات
  const { data: documents = [] } = useQuery({
    queryKey: ['global-search-documents', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      
      const { data, error } = await supabase
        .from('documents')
        .select('id, name, category, file_type')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // دمج النتائج
  const searchResults = useMemo((): SearchResult[] => {
    const results: SearchResult[] = [];

    // إضافة المستفيدين
    beneficiaries.forEach((b: BeneficiarySearchResult) => {
      results.push({
        id: b.id,
        type: 'beneficiary',
        title: b.full_name,
        subtitle: `${b.category} - ${b.national_id}`,
        url: `/beneficiaries`,
        icon: Users,
      });
    });

    // إضافة العقارات
    properties.forEach((p: PropertySearchResult) => {
      results.push({
        id: p.id,
        type: 'property',
        title: p.name,
        subtitle: p.location,
        url: `/properties`,
        icon: Building2,
      });
    });

    // إضافة القروض
    loans.forEach((l: LoanSearchResult) => {
      results.push({
        id: l.id,
        type: 'loan',
        title: l.loan_number,
        subtitle: `${l.loan_amount?.toLocaleString('ar-SA')} ر.س - ${l.beneficiaries?.full_name || 'غير معروف'}`,
        url: `/loans`,
        icon: DollarSign,
      });
    });

    // إضافة المستندات
    documents.forEach((d: DocumentSearchResult) => {
      results.push({
        id: d.id,
        type: 'document',
        title: d.name,
        subtitle: `${d.category} - ${d.file_type}`,
        url: `/archive`,
        icon: FileText,
      });
    });

    return results;
  }, [beneficiaries, properties, loans, documents]);

  // حفظ في سجل البحث
  const saveSearchHistory = async (query: string, resultsCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('search_history').insert({
        user_id: user.id,
        search_query: query,
        search_type: 'global',
        results_count: resultsCount,
      });
    } catch (error) {
      // Silent fail - search history is not critical
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    onOpenChange(false);
    setSearchQuery('');
    
    // حفظ في السجل
    saveSearchHistory(searchQuery, searchResults.length);
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
      beneficiary: 'bg-blue-500/10 text-blue-500',
      property: 'bg-green-500/10 text-green-500',
      loan: 'bg-purple-500/10 text-purple-500',
      contract: 'bg-orange-500/10 text-orange-500',
      document: 'bg-gray-500/10 text-gray-500',
      distribution: 'bg-indigo-500/10 text-indigo-500',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500';
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
