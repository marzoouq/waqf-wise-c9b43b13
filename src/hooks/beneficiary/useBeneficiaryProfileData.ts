/**
 * Beneficiary Profile Data Hooks - خطافات بيانات ملف المستفيد
 * @version 2.8.67
 */

import { useQuery } from "@tanstack/react-query";
import { BeneficiaryService, RequestService, MessageService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

// ==================== Family Tree Hook ====================
export function useFamilyTree(beneficiaryId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.FAMILY_TREE(beneficiaryId),
    queryFn: async () => {
      const result = await BeneficiaryService.getFamilyTree(beneficiaryId);
      return result.familyMembers || [];
    },
    enabled: enabled && !!beneficiaryId,
  });
}

// ==================== Request Details Hook ====================
interface RequestWithDetails {
  id: string;
  request_number: string | null;
  status: string | null;
  priority: string | null;
  description: string;
  amount: number | null;
  submitted_at: string | null;
  created_at: string | null;
  decision_notes: string | null;
  rejection_reason: string | null;
  sla_due_at: string | null;
  attachments_count: number | null;
  request_types?: { name_ar: string; description: string | null } | null;
  beneficiaries?: { full_name: string; national_id: string } | null;
}

export function useRequestDetails(requestId: string, isOpen: boolean) {
  const requestQuery = useQuery<RequestWithDetails>({
    queryKey: QUERY_KEYS.REQUEST_DETAILS(requestId),
    queryFn: async () => {
      const data = await RequestService.getById(requestId);
      if (!data) throw new Error("Request not found");
      return data as unknown as RequestWithDetails;
    },
    enabled: isOpen && !!requestId,
  });

  const messagesQuery = useQuery({
    queryKey: QUERY_KEYS.REQUEST_MESSAGES(requestId),
    queryFn: async () => {
      return MessageService.getByRequestId(requestId);
    },
    enabled: isOpen && !!requestId,
  });

  return {
    request: requestQuery.data,
    messages: messagesQuery.data || [],
    isLoading: requestQuery.isLoading,
  };
}

// ==================== Beneficiary Integration Stats Hook ====================
export function useBeneficiaryIntegrationStats(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_INTEGRATION_STATS(beneficiaryId),
    queryFn: () => BeneficiaryService.getIntegrationStats(beneficiaryId),
    staleTime: 30 * 1000,
  });
}

// ==================== Waqf Distributions Summary Hook ====================
interface HeirDistribution {
  id: string;
  share_amount: number;
  heir_type: string;
  distribution_date: string;
  fiscal_year_id: string;
  fiscal_years: {
    name: string;
    start_date: string;
    end_date: string;
    is_closed: boolean;
    is_active: boolean;
  } | null;
}

export function useWaqfDistributionsSummary(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.HEIR_DISTRIBUTIONS_SUMMARY(beneficiaryId),
    queryFn: async () => {
      const data = await BeneficiaryService.getWaqfDistributionsSummary(beneficiaryId);
      return data as HeirDistribution[];
    },
    enabled: !!beneficiaryId,
  });
}

export type { RequestWithDetails, HeirDistribution };
