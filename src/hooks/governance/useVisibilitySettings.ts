import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";

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

export function useVisibilitySettings(targetRole?: 'beneficiary' | 'waqf_heir') {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isWaqfHeir } = useUserRole();
  
  // تحديد الدور المستهدف: إذا لم يتم تحديده، استخدم دور المستخدم الحالي
  const effectiveRole = targetRole || (isWaqfHeir ? 'waqf_heir' : 'beneficiary');

  const { data: settings, isLoading } = useQuery({
    queryKey: ["visibility-settings", effectiveRole],
    queryFn: async () => {
      // جلب السجل حسب الدور المستهدف
      const { data, error } = await supabase
        .from("beneficiary_visibility_settings")
        .select("*")
        .eq('target_role', effectiveRole)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // إذا لم يكن هناك سجل، استخدم القيم الافتراضية حسب الدور
      if (!data) {
        const defaultSettings = {
          target_role: effectiveRole,
          show_overview: true,
          show_profile: true,
          show_requests: true,
          show_distributions: true,
          show_statements: true,
          show_properties: true,
          show_documents: true,
          show_bank_accounts: true,
          show_financial_reports: true,
          show_approvals_log: true,
          show_disclosures: true,
          show_governance: true,
          show_budgets: true,
          show_other_beneficiaries_names: true,
          show_other_beneficiaries_amounts: false,
          show_other_beneficiaries_personal_data: false,
          show_family_tree: true,
          show_total_beneficiaries_count: true,
          show_beneficiary_categories: true,
          show_beneficiaries_statistics: true,
          show_inactive_beneficiaries: false,
          mask_iban: true,
          mask_phone_numbers: true,
          mask_exact_amounts: false,
          mask_tenant_info: true,
          mask_national_ids: true,
          show_bank_balances: true,
          show_bank_transactions: true,
          show_bank_statements: true,
          show_invoices: true,
          show_contracts_details: true,
          show_maintenance_costs: true,
          show_property_revenues: true,
          show_expenses_breakdown: true,
          show_governance_meetings: true,
          show_nazer_decisions: true,
          show_policy_changes: true,
          show_strategic_plans: true,
          show_audit_reports: true,
          show_compliance_reports: true,
          show_own_loans: true,
          show_other_loans: false,
          mask_loan_amounts: false,
          show_emergency_aid: true,
          show_emergency_statistics: true,
          show_annual_budget: true,
          show_budget_execution: true,
          show_reserve_funds: true,
          show_investment_plans: true,
          show_journal_entries: false,
          show_trial_balance: false,
          show_ledger_details: false,
          show_internal_messages: true,
          show_support_tickets: true,
          allow_export_pdf: true,
          allow_print: true,
        };

        const { data: newData, error: insertError } = await supabase
          .from("beneficiary_visibility_settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as VisibilitySettings;
      }

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
      queryClient.invalidateQueries({ queryKey: ["visibility-settings", effectiveRole] });
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
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
