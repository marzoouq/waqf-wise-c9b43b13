/**
 * Governance Data Hooks - خطافات بيانات الحوكمة
 * @version 2.9.0
 */

import { useQuery } from "@tanstack/react-query";
import { GovernanceService } from "@/services";
import type { EligibleVoter, GovernanceDecisionInput } from "@/services/governance.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { supabase } from "@/integrations/supabase/client";

// ==================== Governance Data Hook ====================
export function useGovernanceData() {
  // جلب الاجتماعات
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_MEETINGS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governance_meetings')
        .select('*')
        .order('scheduled_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // جلب القرارات
  const { data: decisions = [], isLoading: decisionsLoading } = useQuery({
    queryKey: QUERY_KEYS.GOVERNANCE_DECISIONS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('governance_decisions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // جلب تقارير التدقيق (من audit_logs إذا لم يكن الجدول المخصص متاحاً)
  const { data: auditReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['governance-audit-reports'],
    queryFn: async () => {
      // نحاول جلب من audit_logs كبديل
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .in('action_type', ['compliance_check', 'audit_report', 'review'])
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return data || [];
    },
  });

  return {
    meetings,
    decisions,
    auditReports,
    isLoading: meetingsLoading || decisionsLoading || reportsLoading,
    hasMeetings: meetings.length > 0,
    hasDecisions: decisions.length > 0,
    hasAuditReports: auditReports.length > 0,
  };
}

// ==================== Eligible Voters Hook ====================
export function useEligibleVoters(decision: GovernanceDecisionInput) {
  return useQuery({
    queryKey: QUERY_KEYS.ELIGIBLE_VOTERS(decision.id || ''),
    queryFn: () => GovernanceService.getEligibleVoters(decision),
    enabled: !!decision.id,
  });
}

// ==================== Recent Governance Decisions Hook ====================
export function useRecentGovernanceDecisions() {
  return useQuery({
    queryKey: QUERY_KEYS.RECENT_GOVERNANCE_DECISIONS,
    queryFn: () => GovernanceService.getRecentDecisions(),
  });
}

export type { EligibleVoter, GovernanceDecisionInput };
