/**
 * أنواع البيانات التجريبية للاختبارات
 * Test data types for testing pages
 */

export type DistributionPattern = 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid';

/**
 * نوع المستفيد التجريبي
 */
export interface TestBeneficiary {
  id: string;
  full_name: string;
  beneficiary_number: string;
  beneficiary_type: string;
  category: string;
  status: string;
  national_id?: string;
  family_size?: number;
  monthly_income?: number;
  total_received?: number;
  tribe?: string;
  city?: string;
  iban?: string;
  bank_name?: string;
}

/**
 * نوع التوزيع التجريبي
 */
export interface TestDistribution {
  id: string;
  distribution_number: string;
  month: string;
  total_amount: number;
  pattern: string;
  status: string;
  beneficiaries_count: number;
  created_at: string;
  approved_at?: string;
  executed_at?: string;
  distribution_date?: string;
  updated_at?: string;
  distribution_details?: Array<{
    beneficiary_id: string;
    amount: number;
  }>;
}

/**
 * نوع حدث Timeline
 */
export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  timestamp?: string;
  user?: string;
}

/**
 * خيارات محرك التوزيع
 */
export interface DistributionEngineInput {
  total_amount: number;
  beneficiaries: TestBeneficiary[];
  pattern?: DistributionPattern;
  deductions: {
    nazer_percentage: number;
    reserve_percentage: number;
    development_percentage: number;
    maintenance_percentage: number;
    waqf_corpus_percentage: number;
  };
}
