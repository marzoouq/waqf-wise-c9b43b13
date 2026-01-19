/**
 * Governance Policies Hooks - هوكس سياسات الحوكمة
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { productionLogger } from "@/lib/logger/production-logger";
import { GovernancePoliciesService } from "@/services/governance/governance-policies.service";
import type { Database } from "@/integrations/supabase/types";

type PolicyInsert = Database['public']['Tables']['governance_policies']['Insert'];
type PolicyUpdate = Database['public']['Tables']['governance_policies']['Update'];

const QUERY_KEYS = {
  GOVERNANCE_POLICIES: ['governance', 'policies'] as const,
  GOVERNANCE_POLICY: (id: string) => ['governance', 'policies', id] as const,
  ACTIVE_POLICIES: ['governance', 'policies', 'active'] as const,
  POLICIES_BY_CATEGORY: (category: string) => ['governance', 'policies', 'category', category] as const,
  POLICIES_STATS: ['governance', 'policies', 'stats'] as const,
};

/**
 * جلب جميع سياسات الحوكمة
 */
export function useGovernancePolicies() {
  return useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_POLICIES,
    queryFn: () => GovernancePoliciesService.getPolicies(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });
}

/**
 * جلب السياسات النشطة فقط
 */
export function useActivePolicies() {
  return useQuery({
    queryKey: QUERY_KEYS.ACTIVE_POLICIES,
    queryFn: () => GovernancePoliciesService.getActivePolicies(),
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * جلب السياسات حسب الفئة
 */
export function usePoliciesByCategory(category: string) {
  return useQuery({
    queryKey: QUERY_KEYS.POLICIES_BY_CATEGORY(category),
    queryFn: () => GovernancePoliciesService.getPoliciesByCategory(category),
    enabled: !!category,
    retry: 2,
  });
}

/**
 * جلب سياسة محددة بالمعرف
 */
export function useGovernancePolicy(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_POLICY(id),
    queryFn: () => GovernancePoliciesService.getPolicyById(id),
    enabled: !!id,
    retry: 2,
  });
}

/**
 * جلب إحصائيات السياسات
 */
export function usePoliciesStats() {
  return useQuery({
    queryKey: QUERY_KEYS.POLICIES_STATS,
    queryFn: () => GovernancePoliciesService.getPoliciesStats(),
    staleTime: 10 * 60 * 1000, // 10 دقائق
  });
}

/**
 * إنشاء سياسة جديدة
 */
export function useCreatePolicy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (policy: PolicyInsert) => GovernancePoliciesService.createPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POLICIES_STATS });
      toast({
        title: "تم إنشاء السياسة بنجاح",
        description: "تم إضافة سياسة الحوكمة الجديدة",
      });
    },
    onError: (error) => {
      productionLogger.error('Create policy mutation error:', error);
      toast({
        title: "خطأ في إنشاء السياسة",
        description: "حدث خطأ أثناء إنشاء السياسة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });
}

/**
 * تحديث سياسة
 */
export function useUpdatePolicy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PolicyUpdate }) =>
      GovernancePoliciesService.updatePolicy(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_POLICY(variables.id) });
      toast({
        title: "تم تحديث السياسة",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error) => {
      productionLogger.error('Update policy mutation error:', error);
      toast({
        title: "خطأ في تحديث السياسة",
        description: "حدث خطأ أثناء تحديث السياسة",
        variant: "destructive",
      });
    },
  });
}

/**
 * حذف سياسة
 */
export function useDeletePolicy() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GovernancePoliciesService.deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GOVERNANCE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACTIVE_POLICIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POLICIES_STATS });
      toast({
        title: "تم حذف السياسة",
        description: "تم حذف السياسة بنجاح",
      });
    },
    onError: (error) => {
      productionLogger.error('Delete policy mutation error:', error);
      toast({
        title: "خطأ في حذف السياسة",
        description: "حدث خطأ أثناء حذف السياسة",
        variant: "destructive",
      });
    },
  });
}

/**
 * الحصول على الفئات المتاحة
 */
export function useAvailableCategories() {
  return GovernancePoliciesService.getAvailableCategories();
}

/**
 * الحصول على أنواع السياسات
 */
export function usePolicyTypes() {
  return GovernancePoliciesService.getPolicyTypes();
}
