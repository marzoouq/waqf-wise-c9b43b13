/**
 * Beneficiary Verification Service - خدمة التحقق والأهلية
 * @version 2.8.82
 */

import { supabase } from '@/integrations/supabase/client';
import { productionLogger } from '@/lib/logger/production-logger';
import { BeneficiaryCoreService } from './core.service';

export class BeneficiaryVerificationService {
  /**
   * تقييم أهلية المستفيد
   */
  static async assessEligibility(beneficiaryId: string): Promise<{
    eligible: boolean;
    reasons: string[];
    score: number;
  }> {
    try {
      const beneficiary = await BeneficiaryCoreService.getById(beneficiaryId);
      if (!beneficiary) throw new Error('المستفيد غير موجود');

      const reasons: string[] = [];
      let score = 100;

      if (beneficiary.status !== 'active') {
        reasons.push('الحساب غير نشط');
        score -= 50;
      }

      if (beneficiary.verification_status !== 'verified') {
        reasons.push('لم يتم التحقق من الهوية');
        score -= 30;
      }

      if (!beneficiary.iban) {
        reasons.push('لا يوجد حساب بنكي');
        score -= 20;
      }

      return {
        eligible: score >= 50,
        reasons,
        score,
      };
    } catch (error) {
      productionLogger.error('Error assessing eligibility', error);
      throw error;
    }
  }

  /**
   * جلب تقييمات الأهلية
   */
  static async getEligibilityAssessments(beneficiaryId: string) {
    const { data, error } = await supabase
      .from('eligibility_assessments')
      .select('id, beneficiary_id, assessment_date, total_score, eligibility_status, criteria_scores, recommendations, assessed_by, created_at')
      .eq('beneficiary_id', beneficiaryId)
      .order('assessment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * تشغيل تقييم أهلية
   */
  static async runEligibilityAssessment(beneficiaryId: string) {
    const { data, error } = await supabase.rpc('auto_assess_eligibility', {
      p_beneficiary_id: beneficiaryId,
    });

    if (error) throw error;
    return data;
  }

  /**
   * التحقق من هوية المستفيد
   */
  static async verifyIdentity(
    beneficiaryId: string,
    formData: {
      verification_type: string;
      verification_method: string;
      verification_status: string;
      notes: string;
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('identity_verifications').insert({
      beneficiary_id: beneficiaryId,
      ...formData,
      verified_by: user?.id,
      verified_at: new Date().toISOString(),
    });

    await supabase.from('beneficiaries').update({
      verification_status: formData.verification_status,
      verification_method: formData.verification_method,
      last_verification_date: new Date().toISOString(),
      verification_notes: formData.notes,
    }).eq('id', beneficiaryId);
  }
}
