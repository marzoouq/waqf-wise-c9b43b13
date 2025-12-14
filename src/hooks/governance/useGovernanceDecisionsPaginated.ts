/**
 * useGovernanceDecisionsPaginated - Hook لقرارات الحوكمة مع Server-side Pagination
 * @version 2.9.10
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import type { Database } from "@/integrations/supabase/types";
import { GovernanceService } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/pagination.types";

type DbGovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

interface UseGovernanceDecisionsPaginatedOptions {
  initialPage?: number;
  initialPageSize?: number;
  status?: string;
}

export function useGovernanceDecisionsPaginated(options: UseGovernanceDecisionsPaginatedOptions = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(options.initialPage || DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(options.initialPageSize || DEFAULT_PAGE_SIZE);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.GOVERNANCE_DECISIONS, 'paginated', page, pageSize, options.status],
    queryFn: () => GovernanceService.getDecisionsPaginated(
      { page, pageSize },
      { status: options.status }
    ),
    retry: 2,
  });

  const createDecision = useMutation({
    mutationFn: (decision: DbGovernanceDecisionInsert) => 
      GovernanceService.createDecision(decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS });
      toast({
        title: "تم إضافة القرار بنجاح",
        description: "تم إضافة القرار وفتح التصويت عليه",
      });
    },
    onError: (error) => {
      productionLogger.error('Create decision mutation error:', error);
      toast({
        title: "خطأ في إضافة القرار",
        description: "حدث خطأ أثناء إضافة القرار، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const closeVoting = useMutation({
    mutationFn: ({ decisionId, status }: { decisionId: string; status: 'معتمد' | 'مرفوض' }) => 
      GovernanceService.closeVoting(decisionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS });
      toast({
        title: "تم إغلاق التصويت",
        description: "تم احتساب النتائج وإغلاق التصويت",
      });
    },
    onError: (error) => {
      productionLogger.error('Close voting mutation error:', error);
      toast({
        title: "خطأ في إغلاق التصويت",
        description: "حدث خطأ أثناء إغلاق التصويت، يرجى المحاولة مرة أخرى",
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
    decisions: data?.data || [],
    isLoading,
    error,
    refetch,
    createDecision: createDecision.mutateAsync,
    closeVoting: closeVoting.mutateAsync,
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
}
