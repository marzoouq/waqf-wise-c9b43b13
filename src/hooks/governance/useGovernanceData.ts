/**
 * Governance Data Hooks - خطافات بيانات الحوكمة
 * @version 2.8.35
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// ==================== Types ====================
interface EligibleVoter {
  id: string;
  name: string;
  type: 'board_member' | 'beneficiary' | 'nazer';
  hasVoted?: boolean;
  vote?: 'approve' | 'reject' | 'abstain';
}

interface GovernanceDecisionInput {
  id: string;
  voting_participants_type: string;
  custom_voters?: Json | null;
}

// ==================== Legacy Hook ====================
export function useGovernanceData() {
  // Tables don't exist yet - return empty data
  return {
    meetings: [],
    decisions: [],
    auditReports: [],
    isLoading: false,
    hasMeetings: false,
    hasDecisions: false,
    hasAuditReports: false,
  };
}

// ==================== Eligible Voters Hook ====================
export function useEligibleVoters(decision: GovernanceDecisionInput) {
  return useQuery({
    queryKey: ["eligible-voters", decision.id],
    queryFn: async () => {
      let eligibleVoters: EligibleVoter[] = [];

      switch (decision.voting_participants_type) {
        case 'board_only':
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

        case 'first_class_beneficiaries':
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

        case 'board_and_beneficiaries':
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

        case 'custom':
          eligibleVoters = (decision.custom_voters as unknown as EligibleVoter[] | null) || [];
          break;

        case 'nazer_only':
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
    },
    enabled: !!decision.id,
  });
}

// ==================== Recent Governance Decisions Hook ====================
export function useRecentGovernanceDecisions() {
  return useQuery({
    queryKey: ["recent-governance-decisions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("governance_decisions")
        .select("*")
        .eq("decision_status", "قيد التصويت")
        .order("created_at", { ascending: false })
        .limit(3);
      return data || [];
    },
  });
}

export type { EligibleVoter, GovernanceDecisionInput };
