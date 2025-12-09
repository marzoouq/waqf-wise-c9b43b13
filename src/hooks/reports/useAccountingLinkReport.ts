/**
 * Accounting Link Report Hook
 * @version 2.8.45
 */

import { useQuery } from "@tanstack/react-query";
import { ReportService, type OperationRecord } from "@/services/report.service";

export type { OperationRecord };

export function useAccountingLinkReport() {
  const linkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "linked"],
    queryFn: () => ReportService.getLinkedOperations(),
  });

  const unlinkedQuery = useQuery<OperationRecord[]>({
    queryKey: ["accounting-link", "unlinked"],
    queryFn: () => ReportService.getUnlinkedOperations(),
  });

  return {
    linkedOperations: linkedQuery.data || [],
    unlinkedOperations: unlinkedQuery.data || [],
    isLoadingLinked: linkedQuery.isLoading,
    isLoadingUnlinked: unlinkedQuery.isLoading,
  };
}
