/**
 * useContractsPaginated - Hook للعقود مع Server-side Pagination
 * @version 2.9.10
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Contract, ContractInsert } from "@/types/contracts";
import { ContractService } from "@/services/contract.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination.types";

interface UseContractsPaginatedOptions {
  initialPage?: number;
  initialPageSize?: number;
  status?: string;
  propertyId?: string;
}

export const useContractsPaginated = (options: UseContractsPaginatedOptions = {}) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(options.initialPage || DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(options.initialPageSize || DEFAULT_PAGE_SIZE);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.CONTRACTS, 'paginated', page, pageSize, options.status, options.propertyId],
    queryFn: () => ContractService.getPaginated(
      { page, pageSize },
      { status: options.status, propertyId: options.propertyId }
    ),
    staleTime: 3 * 60 * 1000,
  });

  const addContract = useMutation({
    mutationFn: (contract: ContractInsert & { unit_ids?: string[] }) => 
      ContractService.create(contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRACTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RENTAL_PAYMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROPERTIES });
      toast({
        title: "تم إضافة العقد بنجاح",
        description: "تم إنشاء العقد وجدول الدفعات",
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'add_contract', severity: 'medium' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة العقد",
        variant: "destructive",
      });
    },
  });

  const updateContract = useMutation({
    mutationFn: ({ id, ...contract }: Partial<Contract> & { id: string }) => 
      ContractService.update(id, contract),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRACTS });
      toast({
        title: "تم تحديث العقد",
        description: "تم تحديث العقد بنجاح",
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'update_contract', severity: 'medium' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث العقد",
        variant: "destructive",
      });
    },
  });

  const deleteContract = useMutation({
    mutationFn: (id: string) => ContractService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONTRACTS });
      toast({
        title: "تم حذف العقد",
        description: "تم حذف العقد بنجاح",
      });
    },
    onError: (error) => {
      logger.error(error, { context: 'delete_contract', severity: 'high' });
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العقد",
        variant: "destructive",
      });
    },
  });

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, data?.totalPages || 1)));
  };

  const changePageSize = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  return {
    contracts: data?.data || [],
    isLoading,
    error,
    refetch,
    addContract,
    updateContract,
    deleteContract,
    // Pagination
    pagination: {
      page,
      pageSize,
      totalCount: data?.totalCount || 0,
      totalPages: data?.totalPages || 0,
    },
    goToPage,
    nextPage: () => goToPage(page + 1),
    prevPage: () => goToPage(page - 1),
    changePageSize,
    canGoNext: page < (data?.totalPages || 0),
    canGoPrev: page > 1,
  };
};
