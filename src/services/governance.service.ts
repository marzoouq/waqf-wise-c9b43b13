/**
 * Governance Service - خدمة الحوكمة
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];
type GovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];

export class GovernanceService {
  /**
   * جلب جميع القرارات
   */
  static async getDecisions(): Promise<GovernanceDecisionRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .order('decision_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching governance decisions', error);
      throw error;
    }
  }

  /**
   * جلب قرار واحد
   */
  static async getDecisionById(id: string): Promise<GovernanceDecisionRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching governance decision', error);
      throw error;
    }
  }

  /**
   * إنشاء قرار جديد
   */
  static async createDecision(decision: GovernanceDecisionInsert): Promise<GovernanceDecisionRow> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .insert([decision])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating governance decision', error);
      throw error;
    }
  }

  /**
   * تحديث قرار
   */
  static async updateDecision(id: string, updates: Partial<GovernanceDecisionInsert>): Promise<GovernanceDecisionRow> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating governance decision', error);
      throw error;
    }
  }

  /**
   * إغلاق التصويت
   */
  static async closeVoting(decisionId: string, status: 'معتمد' | 'مرفوض'): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_decisions')
        .update({
          voting_completed: true,
          decision_status: status,
        })
        .eq('id', decisionId);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error closing voting', error);
      throw error;
    }
  }

  /**
   * جلب إعدادات الرؤية
   */
  static async getVisibilitySettings(targetRole: 'beneficiary' | 'waqf_heir') {
    try {
      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .select('*')
        .eq('target_role', targetRole)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching visibility settings', error);
      throw error;
    }
  }

  /**
   * إنشاء إعدادات الرؤية الافتراضية
   */
  static async createDefaultVisibilitySettings(targetRole: 'beneficiary' | 'waqf_heir') {
    try {
      const defaultSettings = {
        target_role: targetRole,
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

      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error creating default visibility settings', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات الرؤية
   */
  static async updateVisibilitySettings(id: string, updates: Record<string, unknown>) {
    try {
      const { data, error } = await supabase
        .from('beneficiary_visibility_settings')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error updating visibility settings', error);
      throw error;
    }
  }

  /**
   * جلب إعدادات المنظمة
   */
  static async getOrganizationSettings() {
    try {
      const { data, error } = await supabase
        .from('organization_settings')
        .select('*')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching organization settings', error);
      throw error;
    }
  }

  /**
   * تحديث إعدادات المنظمة
   */
  static async updateOrganizationSettings(id: string | undefined, updates: Record<string, unknown>) {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('organization_settings')
          .update(updates as never)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('organization_settings')
          .insert([updates as never])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      productionLogger.error('Error updating organization settings', error);
      throw error;
    }
  }
}
