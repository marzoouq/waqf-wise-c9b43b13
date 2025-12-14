/**
 * useFilteredData Hook
 * Hook موحد للتصفية والبحث في البيانات
 */

import { useMemo, useState, useCallback } from "react";

export interface FilterConfig<T> {
  /** الحقول التي يتم البحث فيها */
  searchFields: (keyof T)[];
  /** الفلتر الافتراضي */
  defaultFilter?: string;
  /** فلتر مخصص */
  customFilter?: (item: T, filterValue: string) => boolean;
}

export interface UseFilteredDataReturn<T> {
  /** البيانات المفلترة */
  filteredData: T[];
  /** مصطلح البحث */
  searchTerm: string;
  /** تعيين مصطلح البحث */
  setSearchTerm: (term: string) => void;
  /** قيمة الفلتر */
  filterValue: string;
  /** تعيين قيمة الفلتر */
  setFilterValue: (value: string) => void;
  /** مسح جميع الفلاتر */
  clearFilters: () => void;
  /** عدد النتائج */
  resultCount: number;
  /** هل هناك فلاتر نشطة */
  hasActiveFilters: boolean;
}

/**
 * Hook موحد للتصفية والبحث
 * @param data البيانات الأصلية
 * @param config إعدادات التصفية
 */
export function useFilteredData<T>(
  data: T[],
  config: FilterConfig<T>
): UseFilteredDataReturn<T> {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValue, setFilterValue] = useState(config.defaultFilter || "all");

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((item) => {
      // البحث النصي
      const matchesSearch = searchTerm === "" || config.searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === "number") {
          return value.toString().includes(searchTerm);
        }
        return false;
      });

      // الفلتر المخصص
      const matchesFilter = filterValue === "all" || 
        (config.customFilter ? config.customFilter(item, filterValue) : true);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, filterValue, config]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterValue(config.defaultFilter || "all");
  }, [config.defaultFilter]);

  const hasActiveFilters = searchTerm !== "" || filterValue !== (config.defaultFilter || "all");

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    clearFilters,
    resultCount: filteredData.length,
    hasActiveFilters,
  };
}

/**
 * Hook مبسط للبحث فقط (بدون فلتر)
 */
export function useSearchFilter<T>(
  data: T[],
  searchFields: (keyof T)[]
): {
  filteredData: T[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  resultCount: number;
} {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!data || searchTerm === "") return data || [];

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      })
    );
  }, [data, searchTerm, searchFields]);

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount: filteredData.length,
  };
}

/**
 * Hook للفلترة حسب الدور
 */
export function useRoleFilter<T extends { user_roles?: Array<{ role: string }> }>(
  data: T[]
): UseFilteredDataReturn<T> {
  return useFilteredData(data, {
    searchFields: ["full_name" as keyof T, "email" as keyof T],
    defaultFilter: "all",
    customFilter: (item, filterValue) => {
      if (filterValue === "all") return true;
      return item.user_roles?.some((r) => r.role === filterValue) ?? false;
    },
  });
}
