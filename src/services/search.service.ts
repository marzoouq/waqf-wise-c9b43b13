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

export interface RecentSearch {
  id: string;
  search_query: string;
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
   * @note Using PostgrestFilterBuilder type for dynamic queries
   */
  async advancedSearch(
    tableName: string,
    columns: string,
    query: string,
    filters: SearchFilters
  ): Promise<unknown[]> {
    // Build query string for REST API to avoid TypeScript depth issues
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token || '';
    
    let url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/${tableName}?select=${encodeURIComponent(columns)}`;
    
    // Apply text search
    if (query) {
      const searchColumns = ['full_name', 'national_id', 'phone', 'email', 'notes'];
      const orConditions = searchColumns.map(col => `${col}.ilike.%${query}%`).join(',');
      url += `&or=(${encodeURIComponent(orConditions)})`;
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          url += `&${key}=in.(${value.join(',')})`;
        } else if (typeof value === 'object' && value && 'gte' in value && 'lte' in value) {
          url += `&${key}=gte.${value.gte as string}&${key}=lte.${value.lte as string}`;
        } else {
          url += `&${key}=eq.${value as string}`;
        }
      }
    });

    const response = await fetch(url, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * جلب عمليات البحث الأخيرة
   */
  async getRecentSearches(searchType: string): Promise<RecentSearch[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('search_history')
      .select('id, search_query, filters, results_count, created_at')
      .eq('user_id', user.id)
      .eq('search_type', searchType)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []) as RecentSearch[];
  },

  /**
   * حذف عملية بحث
   */
  async deleteSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * مسح جميع عمليات البحث
   */
  async clearAllSearches(searchType: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('search_history')
      .delete()
      .eq('user_id', user.id)
      .eq('search_type', searchType);

    if (error) throw error;
  },
};
