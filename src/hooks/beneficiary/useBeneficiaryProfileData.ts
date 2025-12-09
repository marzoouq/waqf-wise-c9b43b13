/**
 * Beneficiary Profile Data Hooks - خطافات بيانات ملف المستفيد
 * @version 2.8.35
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ==================== Family Tree Hook ====================
export function useFamilyTree(beneficiaryId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["family-tree", beneficiaryId],
    queryFn: async () => {
      // جلب المستفيد الحالي
      const { data: currentBeneficiary } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", beneficiaryId)
        .maybeSingle();

      if (!currentBeneficiary) return [];

      // جلب جميع أفراد العائلة
      const { data: family } = await supabase
        .from("beneficiaries")
        .select("*")
        .or(`family_name.eq.${currentBeneficiary.family_name},parent_beneficiary_id.eq.${beneficiaryId},id.eq.${currentBeneficiary.parent_beneficiary_id}`)
        .eq("status", "نشط")
        .order("is_head_of_family", { ascending: false })
        .order("date_of_birth", { ascending: true });

      return family || [];
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
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(`
          *,
          request_types (name_ar, description),
          beneficiaries (full_name, national_id)
        `)
        .eq("id", requestId)
        .maybeSingle();
      
      if (!data) throw new Error("Request not found");
      if (error) throw error;
      return data as RequestWithDetails;
    },
    enabled: isOpen && !!requestId,
  });

  const messagesQuery = useQuery({
    queryKey: ["request-messages", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
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
    queryKey: ["beneficiary-integration-stats", beneficiaryId],
    queryFn: async () => {
      // Get payments count
      const { count: paymentsCount } = await supabase
        .from("payments")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get documents count
      const { count: documentsCount } = await supabase
        .from("beneficiary_attachments")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get requests count
      const { count: requestsCount } = await supabase
        .from("beneficiary_requests")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId);

      // Get active requests count
      const { count: activeRequestsCount } = await supabase
        .from("beneficiary_requests")
        .select("*", { count: "exact", head: true })
        .eq("beneficiary_id", beneficiaryId)
        .in("status", ["معلق", "قيد المعالجة", "قيد المراجعة"]);

      // Get family info
      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("family_name, is_head_of_family")
        .eq("id", beneficiaryId)
        .maybeSingle();

      return {
        paymentsCount: paymentsCount || 0,
        documentsCount: documentsCount || 0,
        requestsCount: requestsCount || 0,
        activeRequestsCount: activeRequestsCount || 0,
        familyName: beneficiary?.family_name || null,
        isHeadOfFamily: beneficiary?.is_head_of_family || false,
      };
    },
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
    queryKey: ["heir-distributions-summary", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("heir_distributions")
        .select(`
          id,
          share_amount,
          heir_type,
          distribution_date,
          fiscal_year_id,
          fiscal_years (
            name,
            start_date,
            end_date,
            is_closed,
            is_active
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("distribution_date", { ascending: false });

      if (error) throw error;
      return (data || []) as HeirDistribution[];
    },
    enabled: !!beneficiaryId,
  });
}

export type { RequestWithDetails, HeirDistribution };
