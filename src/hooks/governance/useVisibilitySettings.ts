import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useUserRole } from "@/hooks/auth/useUserRole";
import { GovernanceService } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface VisibilitySettings {
  id: string;
  show_overview: boolean;
  show_profile: boolean;
  show_requests: boolean;
  show_distributions: boolean;
  show_statements: boolean;
  show_properties: boolean;
  show_documents: boolean;
  show_bank_accounts: boolean;
  show_financial_reports: boolean;
  show_approvals_log: boolean;
  show_disclosures: boolean;
  show_governance: boolean;
  show_budgets: boolean;
  show_other_beneficiaries_names: boolean;
  show_other_beneficiaries_amounts: boolean;
  show_other_beneficiaries_personal_data: boolean;
  show_family_tree: boolean;
  show_total_beneficiaries_count: boolean;
  show_beneficiary_categories: boolean;
  show_beneficiaries_statistics: boolean;
  show_inactive_beneficiaries: boolean;
  mask_iban: boolean;
  mask_phone_numbers: boolean;
  mask_exact_amounts: boolean;
  mask_tenant_info: boolean;
  mask_national_ids: boolean;
  show_bank_balances: boolean;
  show_bank_transactions: boolean;
  show_bank_statements: boolean;
  show_invoices: boolean;
  show_contracts_details: boolean;
  show_maintenance_costs: boolean;
  show_property_revenues: boolean;
  show_expenses_breakdown: boolean;
  show_governance_meetings: boolean;
  show_nazer_decisions: boolean;
  show_policy_changes: boolean;
  show_strategic_plans: boolean;
  show_audit_reports: boolean;
  show_compliance_reports: boolean;
  show_own_loans: boolean;
  show_other_loans: boolean;
  mask_loan_amounts: boolean;
  show_emergency_aid: boolean;
  show_emergency_statistics: boolean;
  show_annual_budget: boolean;
  show_budget_execution: boolean;
  show_reserve_funds: boolean;
  show_investment_plans: boolean;
  show_journal_entries: boolean;
  show_trial_balance: boolean;
  show_ledger_details: boolean;
  show_internal_messages: boolean;
  show_support_tickets: boolean;
  allow_export_pdf: boolean;
  allow_print: boolean;
  allow_profile_edit: boolean;
  // إعدادات الأرشيف التفصيلية
  show_archive_contracts: boolean;
  show_archive_legal_docs: boolean;
  show_archive_financial_reports: boolean;
  show_archive_meeting_minutes: boolean;
  allow_download_documents: boolean;
  allow_preview_documents: boolean;
}

export function useVisibilitySettings(targetRole?: 'beneficiary' | 'waqf_heir') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isWaqfHeir } = useUserRole();
  
  const effectiveRole = targetRole || (isWaqfHeir ? 'waqf_heir' : 'beneficiary');

  const { data: settings, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.VISIBILITY_SETTINGS(effectiveRole),
    queryFn: async () => {
      const data = await GovernanceService.getVisibilitySettings(effectiveRole);
      if (!data) {
        return await GovernanceService.createDefaultVisibilitySettings(effectiveRole);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateSettings = useMutation({
    mutationFn: (updates: Partial<VisibilitySettings>) => 
      GovernanceService.updateVisibilitySettings(settings?.id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VISIBILITY_SETTINGS(effectiveRole) });
      toast({
        title: "تم الحفظ",
        description: `تم تحديث إعدادات الشفافية ${effectiveRole === 'waqf_heir' ? 'للورثة' : 'للمستفيدين'} بنجاح`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings: settings as VisibilitySettings | undefined,
    isLoading,
    error,
    refetch,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
