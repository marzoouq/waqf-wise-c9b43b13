import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeneficiaryService } from '@/services/beneficiary.service';
import { handleError, showSuccess } from '@/lib/errors';
import { QUERY_KEYS } from '@/lib/query-keys';

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
    queryKey: QUERY_KEYS.ELIGIBILITY_ASSESSMENTS(beneficiaryId),
    queryFn: async () => {
      const data = await BeneficiaryService.getEligibilityAssessments(beneficiaryId);
      return data as EligibilityAssessment[];
    },
    enabled: !!beneficiaryId,
  });

  // تشغيل تقييم جديد
  const runAssessment = useMutation({
    mutationFn: () => BeneficiaryService.runEligibilityAssessment(beneficiaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ELIGIBILITY_ASSESSMENTS(beneficiaryId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
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
