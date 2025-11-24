import { useState, useMemo, useCallback } from "react";

export type FilterOperator = "contains" | "equals" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte";

export interface FilterConfig<T> {
  field: keyof T;
  operator?: FilterOperator;
  caseSensitive?: boolean;
}

export interface SearchFilterResult<T> {
  // البيانات المفلترة
  filteredData: T[];
  
  // قيمة البحث
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // مسح البحث
  clearSearch: () => void;
  
  // معلومات النتائج
  totalResults: number;
  hasResults: boolean;
  isFiltering: boolean;
}

/**
 * Custom Hook للبحث والفلترة في البيانات
 * 
 * @template T - نوع البيانات
 * @param data - مصفوفة البيانات الكاملة
 * @param searchFields - الحقول التي سيتم البحث فيها
 * @returns كائن يحتوي على البيانات المفلترة ودوال التحكم
 */
export function useSearchFilter<T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[]
): SearchFilterResult<T> {
  const [searchQuery, setSearchQuery] = useState("");

  const isFiltering = searchQuery.trim().length > 0;

  // فلترة البيانات بناءً على البحث
  const filteredData = useMemo(() => {
    if (!isFiltering) {
      return data;
    }

    const query = searchQuery.toLowerCase().trim();

    return data.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field];
        
        if (value === null || value === undefined) {
          return false;
        }

        // التعامل مع أنواع مختلفة من القيم
        if (typeof value === "string") {
          return value.toLowerCase().includes(query);
        }

        if (typeof value === "number") {
          return value.toString().includes(query);
        }

        if (Array.isArray(value)) {
          return value.some((v) => 
            v && v.toString().toLowerCase().includes(query)
          );
        }

        // محاولة تحويل القيمة إلى نص والبحث فيها
        return value.toString().toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields, isFiltering]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    filteredData,
    searchQuery,
    setSearchQuery,
    clearSearch,
    totalResults: filteredData.length,
    hasResults: filteredData.length > 0,
    isFiltering,
  };
}
