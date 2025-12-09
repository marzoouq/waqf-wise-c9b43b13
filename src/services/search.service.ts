/**
 * SearchService - خدمة البحث المتقدم
 * تتعامل مع عمليات البحث وسجل البحث
 */

import { supabase } from '@/integrations/supabase/client';

interface SearchFilters {
  [key: string]: string | number | boolean | null | undefined | { gte: string; lte: string } | string[];
}

interface SearchHistoryItem {
  id: string;
  search_query: string;
  search_type: string;
  filters: SearchFilters | null;
  results_count: number;
  created_at: string;
}

export const SearchService = {
  /**
   * جلب سجل البحث
   */
  async getSearchHistory(searchType: string, limit = 10): Promise<SearchHistoryItem[]> {
    const { data, error } = await supabase
      .from('search_history')
      .select('id, search_query, search_type, filters, results_count, created_at')
      .eq('search_type', searchType)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as SearchHistoryItem[];
  },

  /**
   * البحث في المستفيدين
   */
  async searchBeneficiaries(query: string) {
    if (!query || query.length < 2) return [];
    
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('id, full_name, national_id, phone, category')
      .or(`full_name.ilike.%${query}%,national_id.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * البحث في العقارات
   */
  async searchProperties(query: string) {
    if (!query || query.length < 2) return [];
    
    const { data, error } = await supabase
      .from('properties')
      .select('id, name, location, status')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * البحث في القروض
   */
  async searchLoans(query: string) {
    if (!query || query.length < 2) return [];
    
    const { data, error } = await supabase
      .from('loans')
      .select('id, loan_number, loan_amount, beneficiaries(full_name)')
      .or(`loan_number.ilike.%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * البحث في المستندات
   */
  async searchDocuments(query: string) {
    if (!query || query.length < 2) return [];
    
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, category, file_type')
      .ilike('name', `%${query}%`)
      .limit(5);
    
    if (error) throw error;
    return data || [];
  },

  /**
   * حفظ عملية بحث
   */
  async saveSearchHistory(
    searchType: string,
    query: string,
    filters: SearchFilters,
    resultsCount: number
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('search_history')
      .insert({
        user_id: user?.id,
        search_query: query,
        search_type: searchType,
        filters,
        results_count: resultsCount,
      });
    
    if (error) throw error;
  },

  /**
   * تنفيذ البحث المتقدم
   */
  async advancedSearch(
    tableName: string,
    columns: string,
    query: string,
    filters: SearchFilters
  ): Promise<unknown[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dbQuery: any = supabase.from(tableName as any).select(columns);

    // تطبيق البحث النصي
    if (query) {
      const searchColumns = ['full_name', 'national_id', 'phone', 'email', 'notes'];
      const orConditions = searchColumns.map(col => `${col}.ilike.%${query}%`).join(',');
      dbQuery = dbQuery.or(orConditions);
    }

    // تطبيق الفلاتر
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          dbQuery = dbQuery.in(key, value);
        } else if (typeof value === 'object' && value && 'gte' in value && 'lte' in value) {
          dbQuery = dbQuery.gte(key, value.gte as string).lte(key, value.lte as string);
        } else {
          dbQuery = dbQuery.eq(key, value as string);
        }
      }
    });

    const { data, error } = await dbQuery;
    if (error) throw error;
    return data || [];
  },
};
