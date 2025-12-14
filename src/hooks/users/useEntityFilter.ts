/**
 * useEntityFilter Hook
 * Hook موحد لمنطق الفلترة بين Users و RolesManagement
 * @version 2.9.14
 */

import { useState, useMemo, useCallback } from 'react';

interface UseEntityFilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  filterField?: keyof T;
  filterArrayField?: keyof T; // للفلترة في مصفوفات مثل roles_array
}

interface UseEntityFilterReturn<T> {
  filteredItems: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useEntityFilter<T extends Record<string, unknown>>({
  items,
  searchFields,
  filterField,
  filterArrayField,
}: UseEntityFilterOptions<T>): UseEntityFilterReturn<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // فلترة البحث
      const matchesSearch =
        !searchTerm ||
        searchFields.some((field) => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          return false;
        });

      // فلترة الدور/الحالة
      let matchesFilter = filter === 'all';
      
      if (!matchesFilter && filterField) {
        const fieldValue = item[filterField];
        matchesFilter = fieldValue === filter;
      }
      
      if (!matchesFilter && filterArrayField) {
        const arrayValue = item[filterArrayField];
        if (Array.isArray(arrayValue)) {
          matchesFilter = arrayValue.includes(filter);
        }
      }

      return matchesSearch && matchesFilter;
    });
  }, [items, searchTerm, filter, searchFields, filterField, filterArrayField]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setFilter('all');
  }, []);

  const hasActiveFilters = searchTerm !== '' || filter !== 'all';

  return {
    filteredItems,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    resetFilters,
    hasActiveFilters,
  };
}
