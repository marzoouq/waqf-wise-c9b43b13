/**
 * Governance Service - خدمة الحوكمة
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database } from '@/integrations/supabase/types';

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];
type GovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];
type GovernanceVoteRow = Database['public']['Tables']['governance_votes']['Row'];

export class GovernanceService {
  /**
   * جلب جميع قرارات الحوكمة
   */
  static async getDecisions(): Promise<GovernanceDecisionRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching governance decisions', error);
      throw error;
    }
  }

  /**
   * جلب قرار بالمعرف
   */
  static async getDecisionById(id: string): Promise<GovernanceDecisionRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .eq('id', id)
        .single();

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
  static async updateDecision(id: string, updates: Partial<GovernanceDecisionRow>): Promise<GovernanceDecisionRow> {
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
   * حذف قرار
   */
  static async deleteDecision(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('governance_decisions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      productionLogger.error('Error deleting governance decision', error);
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
   * جلب الأصوات لقرار
   */
  static async getVotes(decisionId: string): Promise<GovernanceVoteRow[]> {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .select('*')
        .eq('decision_id', decisionId)
        .order('voted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching votes', error);
      throw error;
    }
  }

  /**
   * جلب صوت المستخدم
   */
  static async getUserVote(decisionId: string, userId: string): Promise<GovernanceVoteRow | null> {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .select('*')
        .eq('decision_id', decisionId)
        .eq('voter_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error fetching user vote', error);
      throw error;
    }
  }

  /**
   * تسجيل صوت
   */
  static async castVote(vote: {
    decision_id: string;
    voter_id: string;
    voter_name: string;
    voter_type: string;
    beneficiary_id?: string;
    vote: string;
    vote_reason?: string;
  }): Promise<GovernanceVoteRow> {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .insert([vote])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productionLogger.error('Error casting vote', error);
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
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
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
