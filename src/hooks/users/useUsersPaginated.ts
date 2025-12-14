/**
 * useUsersPaginated Hook
 * Server-side Pagination للمستخدمين
 * @version 2.9.11
 */

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QUERY_KEYS } from "@/lib/query-keys";
import { AuthService } from "@/services/auth.service";
import type { UserProfile } from "@/types/auth";
import type { PaginationParams, PaginatedResult } from "@/lib/pagination.types";

interface UseUsersPaginatedOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export function useUsersPaginated(options: UseUsersPaginatedOptions = {}) {
  const { initialPage = 1, initialPageSize = 15 } = options;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const query = useQuery({
    queryKey: [...QUERY_KEYS.USERS, "paginated", page, pageSize],
    queryFn: async (): Promise<PaginatedResult<UserProfile>> => {
      // جلب جميع المستخدمين (لأن AuthService لا تدعم pagination حالياً)
      const allUsers = await AuthService.getUsers();
      
      // حساب pagination محلياً
      const totalItems = allUsers.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = allUsers.slice(startIndex, endIndex) as UserProfile[];

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
    setPage(1); // Reset to first page
  };

  return {
    ...query,
    users: query.data?.data || [],
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
