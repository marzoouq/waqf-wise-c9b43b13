/**
 * Hook لجلب بيانات البحث الشامل
 * Global Search Data Hook
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Building2, DollarSign, FileText, type LucideIcon } from 'lucide-react';

export interface SearchResult {
  id: string;
  type: 'beneficiary' | 'property' | 'loan' | 'document';
  title: string;
  subtitle: string;
  url: string;
  icon: LucideIcon;
}

export function useGlobalSearchData(searchQuery: string) {
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
    beneficiaries.forEach((b) => {
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
    properties.forEach((p) => {
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
    loans.forEach((l: { id: string; loan_number: string; loan_amount: number; beneficiaries: { full_name: string } | null }) => {
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
    documents.forEach((d) => {
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

  return {
    searchResults,
    beneficiaries,
    properties,
    loans,
    documents,
  };
}
