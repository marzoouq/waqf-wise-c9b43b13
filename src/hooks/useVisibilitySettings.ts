import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VisibilitySettings {
  id: string;
  // الأقسام الرئيسية
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
  
  // المستفيدون الآخرون
  show_other_beneficiaries_names: boolean;
  show_other_beneficiaries_amounts: boolean;
  show_other_beneficiaries_personal_data: boolean;
  show_family_tree: boolean;
  show_total_beneficiaries_count: boolean;
  show_beneficiary_categories: boolean;
  show_beneficiaries_statistics: boolean;
  show_inactive_beneficiaries: boolean;
  
  // البيانات الحساسة والإخفاء
  mask_iban: boolean;
  mask_phone_numbers: boolean;
  mask_exact_amounts: boolean;
  mask_tenant_info: boolean;
  mask_national_ids: boolean;
  
  // الجداول المالية
  show_bank_balances: boolean;
  show_bank_transactions: boolean;
  show_bank_statements: boolean;
  show_invoices: boolean;
  show_contracts_details: boolean;
  show_maintenance_costs: boolean;
  show_property_revenues: boolean;
  show_expenses_breakdown: boolean;
  
  // الحوكمة والقرارات
  show_governance_meetings: boolean;
  show_nazer_decisions: boolean;
  show_policy_changes: boolean;
  show_strategic_plans: boolean;
  show_audit_reports: boolean;
  show_compliance_reports: boolean;
  
  // القروض والفزعات
  show_own_loans: boolean;
  show_other_loans: boolean;
  mask_loan_amounts: boolean;
  show_emergency_aid: boolean;
  show_emergency_statistics: boolean;
  
  // الميزانيات والتخطيط
  show_annual_budget: boolean;
  show_budget_execution: boolean;
  show_reserve_funds: boolean;
  show_investment_plans: boolean;
  
  // المحاسبة التفصيلية
  show_journal_entries: boolean;
  show_trial_balance: boolean;
  show_ledger_details: boolean;
  
  // التواصل والدعم
  show_internal_messages: boolean;
  show_support_tickets: boolean;
  
  // الإعدادات العامة
  allow_export_pdf: boolean;
  allow_print: boolean;
}

export function useVisibilitySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["visibility-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_visibility_settings")
        .select("*")
        .single();

      if (error) throw error;
      return data as VisibilitySettings;
    },
    staleTime: 5 * 60 * 1000,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<VisibilitySettings>) => {
      const { data, error } = await supabase
        .from("beneficiary_visibility_settings")
        .update(updates)
        .eq("id", settings?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visibility-settings"] });
      toast({
        title: "تم الحفظ",
        description: "تم تحديث إعدادات الشفافية بنجاح",
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
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
