import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { handleError, showSuccess } from '@/lib/errors';

interface CriteriaScores {
  income?: number;
  family_size?: number;
  needs?: number;
  verification?: number;
  [key: string]: number | undefined;
}

interface EligibilityAssessment {
  id: string;
  beneficiary_id: string;
  assessment_date: string;
  total_score: number;
  eligibility_status: string;
  criteria_scores: CriteriaScores;
  recommendations: string | null;
  assessed_by: string | null;
  created_at: string;
}

/**
 * Hook لإدارة تقييم الأهلية - المرحلة 2
 */
export function useEligibilityAssessment(beneficiaryId: string) {
  const queryClient = useQueryClient();

  // جلب تقييمات المستفيد
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['eligibility-assessments', beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eligibility_assessments')
        .select('id, beneficiary_id, assessment_date, total_score, eligibility_status, criteria_scores, recommendations, assessed_by, created_at')
        .eq('beneficiary_id', beneficiaryId)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      return data as EligibilityAssessment[];
    },
    enabled: !!beneficiaryId,
  });

  // تشغيل تقييم جديد
  const runAssessment = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('auto_assess_eligibility', {
        p_beneficiary_id: beneficiaryId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibility-assessments', beneficiaryId] });
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      showSuccess('تم التقييم', 'تم تقييم الأهلية بنجاح');
    },
    onError: (error: unknown) => {
      handleError(error, { context: { operation: 'assess_eligibility' } });
    },
  });

  // الحصول على أحدث تقييم
  const latestAssessment = assessments[0] || null;

  return {
    assessments,
    latestAssessment,
    isLoading,
    runAssessment: runAssessment.mutateAsync,
    isAssessing: runAssessment.isPending,
  };
}
