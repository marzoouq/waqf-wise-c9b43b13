/**
 * usePropertiesPaginated Hook
 * Server-side Pagination للعقارات
 * @version 2.9.11
 */

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QUERY_KEYS } from "@/lib/query-keys";
import { PropertyService, type PropertyFilters } from "@/services/property.service";
import type { PaginatedResult } from "@/lib/pagination.types";
import type { Database } from "@/integrations/supabase/types";

type PropertyRow = Database['public']['Tables']['properties']['Row'];

interface UsePropertiesPaginatedOptions {
  initialPage?: number;
  initialPageSize?: number;
  filters?: PropertyFilters;
}

export function usePropertiesPaginated(options: UsePropertiesPaginatedOptions = {}) {
  const { initialPage = 1, initialPageSize = 15, filters } = options;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const query = useQuery({
    queryKey: [...QUERY_KEYS.PROPERTIES, "paginated", page, pageSize, filters],
    queryFn: async (): Promise<PaginatedResult<PropertyRow>> => {
      const allProperties = await PropertyService.getAll(filters);
      
      const totalItems = allProperties.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = allProperties.slice(startIndex, endIndex);

      return {
        data,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    },
    staleTime: 30 * 1000,
  });

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && (!query.data || newPage <= query.data.totalPages)) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (query.data?.hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  const previousPage = () => {
    if (query.data?.hasPreviousPage) {
      setPage((p) => p - 1);
    }
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    ...query,
    properties: query.data?.data || [],
    totalItems: query.data?.totalItems || 0,
    totalPages: query.data?.totalPages || 0,
    currentPage: page,
    pageSize,
    hasNextPage: query.data?.hasNextPage || false,
    hasPreviousPage: query.data?.hasPreviousPage || false,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
  };
}
