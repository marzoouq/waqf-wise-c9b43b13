/**
 * Accounting Link Report Hook
 * @version 2.8.45
 */

import { useQuery } from "@tanstack/react-query";
import { ReportService, type OperationRecord } from "@/services/report.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { OperationRecord };

export function useAccountingLinkReport() {
  const linkedQuery = useQuery<OperationRecord[]>({
    queryKey: QUERY_KEYS.ACCOUNTING_LINK_LINKED,
    queryFn: () => ReportService.getLinkedOperations(),
  });

  const unlinkedQuery = useQuery<OperationRecord[]>({
    queryKey: QUERY_KEYS.ACCOUNTING_LINK_UNLINKED,
    queryFn: () => ReportService.getUnlinkedOperations(),
  });

  return {
    linkedOperations: linkedQuery.data || [],
    unlinkedOperations: unlinkedQuery.data || [],
    isLoadingLinked: linkedQuery.isLoading,
    isLoadingUnlinked: unlinkedQuery.isLoading,
  };
}
