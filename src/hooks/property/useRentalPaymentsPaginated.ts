/**
 * useRentalPaymentsPaginated Hook
 * Server-side Pagination لدفعات الإيجار
 * @version 2.9.11
 */

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { QUERY_KEYS } from "@/lib/query-keys";
import { RentalPaymentService, type RentalPayment, type RentalPaymentFilters } from "@/services/rental-payment.service";
import type { PaginatedResult } from "@/lib/pagination.types";

interface UseRentalPaymentsPaginatedOptions {
  initialPage?: number;
  initialPageSize?: number;
  filters?: RentalPaymentFilters;
}

export function useRentalPaymentsPaginated(options: UseRentalPaymentsPaginatedOptions = {}) {
  const { initialPage = 1, initialPageSize = 15, filters } = options;
  
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const query = useQuery({
    queryKey: [...QUERY_KEYS.RENTAL_PAYMENTS, "paginated", page, pageSize, filters],
    queryFn: async (): Promise<PaginatedResult<RentalPayment>> => {
      const allPayments = await RentalPaymentService.getAll(filters);
      
      const totalItems = allPayments.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const data = allPayments.slice(startIndex, endIndex);

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
    payments: query.data?.data || [],
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
