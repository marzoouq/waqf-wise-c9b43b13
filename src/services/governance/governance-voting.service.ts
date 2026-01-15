/**
 * Governance Voting Service - خدمة التصويت
 * @version 1.0.0
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import type { Database, Json } from '@/integrations/supabase/types';

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

export class GovernanceVotingService {
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
        .maybeSingle();

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
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('فشل تسجيل الصوت');
      return data;
    } catch (error) {
      productionLogger.error('Error casting vote', error);
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
}
