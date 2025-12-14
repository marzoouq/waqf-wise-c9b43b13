/**
 * Beneficiary Tabs Data Hooks
 * @version 2.8.52
 * Provides data fetching for beneficiary portal tabs using services
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { StorageService } from "@/services/storage.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

// Hook for approvals log tab
export function useApprovalsLog(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS_LOG_BENEFICIARY,
    queryFn: () => BeneficiaryService.getApprovalsLog(50),
    enabled,
  });
}

// Hook for bank accounts (waqf accounts visible to beneficiaries)
export function useBeneficiaryBankAccounts(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.BANK_ACCOUNTS_BENEFICIARY,
    queryFn: () => BeneficiaryService.getWaqfBankAccounts(),
    enabled,
  });
}

// Hook for beneficiary documents
export function useBeneficiaryDocuments(beneficiaryId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_DOCUMENTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getDocuments(beneficiaryId),
    enabled: !!beneficiaryId,
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => BeneficiaryService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_DOCUMENTS() });
      toast.success("تم حذف المستند بنجاح");
    },
    onError: () => {
      toast.error("فشل حذف المستند");
    },
  });

  const viewDocument = async (filePath: string) => {
    const signedUrl = await StorageService.getSignedUrl('beneficiary-documents', filePath, 3600);
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  return {
    ...query,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    viewDocument,
  };
}

// Hook for beneficiary statements (payments)
export function useBeneficiaryStatements(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE_PAYMENTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getStatementsSimple(beneficiaryId),
    enabled: !!beneficiaryId,
  });
}

// Hook for annual disclosures
export function useDisclosures(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ANNUAL_DISCLOSURES_BENEFICIARY,
    queryFn: () => BeneficiaryService.getAnnualDisclosures(10),
    enabled,
  });
}

// Hook for distribution pie chart data
export function useDistributionChartData() {
  const query = useQuery({
    queryKey: QUERY_KEYS.DISTRIBUTION_PIE_CHART,
    queryFn: () => BeneficiaryService.getDistributionChartData(),
  });
  
  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook for beneficiary requests
export function useBeneficiaryRequestsTab(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE_REQUESTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getRequestsWithTypes(beneficiaryId),
    enabled: !!beneficiaryId,
  });
}

// Hook for yearly comparison chart
export function useYearlyComparison(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.YEARLY_COMPARISON(beneficiaryId),
    queryFn: () => BeneficiaryService.getYearlyComparison(beneficiaryId),
    enabled: !!beneficiaryId,
  });
}

// Hook for monthly revenue chart
export function useMonthlyRevenue() {
  return useQuery({
    queryKey: QUERY_KEYS.MONTHLY_REVENUE_CHART,
    queryFn: () => BeneficiaryService.getMonthlyRevenue(),
  });
}

// Hook for property stats
export function usePropertyStats() {
  return useQuery({
    queryKey: QUERY_KEYS.PROPERTY_STATS_COMBINED,
    queryFn: () => BeneficiaryService.getPropertyStats(),
  });
}
