/**
 * Accounting Link Report Hook
 * @version 2.8.44
 */

import { useQuery } from "@tanstack/react-query";
import { ReportsService, type OperationRecord } from "@/services/reports.service";

export type { OperationRecord };

export function useAccountingLinkReport() {
  const linkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "linked"],
    queryFn: () => ReportsService.getLinkedOperations(),
  });

  const unlinkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "unlinked"],
    queryFn: () => ReportsService.getUnlinkedOperations(),
  });

  return {
    linkedOperations: linkedQuery.data || [],
    unlinkedOperations: unlinkedQuery.data || [],
    isLoadingLinked: linkedQuery.isLoading,
    isLoadingUnlinked: unlinkedQuery.isLoading,
  };
}
