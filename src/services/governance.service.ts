/**
 * Governance Service - خدمة الحوكمة
 * @version 2.9.10
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database, Json } from '@/integrations/supabase/types';
import type { PaginatedResponse, PaginationParams } from '@/lib/pagination.types';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/pagination.types';

type GovernanceDecisionRow = Database['public']['Tables']['governance_decisions']['Row'];
type GovernanceDecisionInsert = Database['public']['Tables']['governance_decisions']['Insert'];
type GovernanceVoteRow = Database['public']['Tables']['governance_votes']['Row'];

export interface EligibleVoter {
  id: string;
  name: string;
  type: 'board_member' | 'beneficiary' | 'nazer';
  hasVoted?: boolean;
  vote?: 'approve' | 'reject' | 'abstain' | string;
}

export interface GovernanceDecisionInput {
  id: string;
  voting_participants_type: string;
  custom_voters?: Json | null;
}

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
   * جلب قرارات الحوكمة مع الترقيم من السيرفر
   */
  static async getDecisionsPaginated(
    params: PaginationParams = { page: DEFAULT_PAGE, pageSize: DEFAULT_PAGE_SIZE },
    filters?: { status?: string }
  ): Promise<PaginatedResponse<GovernanceDecisionRow>> {
    try {
      const { page, pageSize } = params;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // جلب العدد الكلي
      let countQuery = supabase.from('governance_decisions').select('*', { count: 'exact', head: true });
      if (filters?.status) countQuery = countQuery.eq('decision_status', filters.status);
      const { count } = await countQuery;

      // جلب البيانات
      let dataQuery = supabase
        .from('governance_decisions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (filters?.status) dataQuery = dataQuery.eq('decision_status', filters.status);
      
      const { data, error } = await dataQuery;
      if (error) throw error;

      const totalCount = count || 0;
      return {
        data: data || [],
        totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    } catch (error) {
      productionLogger.error('Error fetching paginated governance decisions', error);
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
  static async castVote(decisionId: string, voteValue: string, reason?: string): Promise<GovernanceVoteRow> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('غير مصرح');

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('id, full_name, category')
        .eq('user_id', user.id)
        .maybeSingle();

      const voterType = beneficiary ? 'beneficiary' : 'board_member';

      const { data, error } = await supabase
        .from('governance_votes')
        .insert([{
          decision_id: decisionId,
          voter_id: user.id,
          voter_name: profile?.full_name || 'مستخدم',
          voter_type: voterType,
          beneficiary_id: beneficiary?.id,
          vote: voteValue,
          vote_reason: reason,
        }])
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

  /**
   * جلب المصوتين المؤهلين
   */
  static async getEligibleVoters(decision: GovernanceDecisionInput): Promise<EligibleVoter[]> {
    try {
      let eligibleVoters: EligibleVoter[] = [];

      switch (decision.voting_participants_type) {
        case 'board_only': {
          const { data: boardUsers } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("role", ["admin", "nazer"]);
          
          if (boardUsers) {
            eligibleVoters = boardUsers.map(u => ({
              id: u.user_id,
              name: 'عضو مجلس',
              type: 'board_member' as const
            }));
          }
          break;
        }

        case 'first_class_beneficiaries': {
          const { data: beneficiaries } = await supabase
            .from("beneficiaries")
            .select("id, full_name, user_id")
            .eq("category", "الفئة الأولى")
            .eq("can_login", true);
          eligibleVoters = beneficiaries?.map(b => ({
            id: b.user_id,
            name: b.full_name,
            type: 'beneficiary' as const
          })) || [];
          break;
        }

        case 'board_and_beneficiaries': {
          const { data: boardUsers2 } = await supabase
            .from("user_roles")
            .select("user_id")
            .in("role", ["admin", "nazer"]);
          const { data: beneficiaries2 } = await supabase
            .from("beneficiaries")
            .select("id, full_name, user_id")
            .eq("category", "الفئة الأولى")
            .eq("can_login", true);
          
          eligibleVoters = [
            ...(boardUsers2?.map(u => ({
              id: u.user_id,
              name: 'عضو مجلس',
              type: 'board_member' as const
            })) || []),
            ...(beneficiaries2?.map(b => ({
              id: b.user_id,
              name: b.full_name,
              type: 'beneficiary' as const
            })) || [])
          ];
          break;
        }

        case 'custom':
          eligibleVoters = (decision.custom_voters as unknown as EligibleVoter[] | null) || [];
          break;

        case 'nazer_only': {
          const { data: nazerUser } = await supabase
            .from("user_roles")
            .select("user_id")
            .eq("role", "nazer")
            .limit(1)
            .maybeSingle();
          if (nazerUser) {
            eligibleVoters = [{
              id: nazerUser.user_id,
              name: 'الناظر',
              type: 'nazer' as const
            }];
          }
          break;
        }
      }

      const { data: votes } = await supabase
        .from("governance_votes")
        .select("voter_id, vote")
        .eq("decision_id", decision.id);

      return eligibleVoters.map(voter => {
        const vote = votes?.find(v => v.voter_id === voter.id);
        return {
          ...voter,
          hasVoted: !!vote,
          vote: vote?.vote
        };
      });
    } catch (error) {
      productionLogger.error('Error fetching eligible voters', error);
      throw error;
    }
  }

  /**
   * جلب قرارات الحوكمة الأخيرة
   */
  static async getRecentDecisions() {
    try {
      const { data } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("decision_status", "قيد التصويت")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    } catch (error) {
      productionLogger.error('Error fetching recent governance decisions', error);
      throw error;
    }
  }
}
