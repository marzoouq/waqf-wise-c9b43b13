/**
 * أنواع بيانات نظام التوزيعات
 */

export interface WaqfDistributionSettings {
  id: string;
  waqf_unit_id?: string;
  distribution_frequency: 'شهري' | 'ربع_سنوي' | 'نصف_سنوي' | 'سنوي';
  distribution_months: number[];
  auto_distribution: boolean;
  distribution_day_of_month: number;
  nazer_percentage: number;
  waqif_charity_percentage: number;
  waqf_corpus_percentage: number;
  distribution_rule: 'شرعي' | 'متساوي' | 'مخصص';
  wives_share_ratio: number;
  notify_beneficiaries: boolean;
  notify_nazer: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DistributionDetail {
  id: string;
  distribution_id: string;
  beneficiary_id: string;
  beneficiary_type: 'واقف' | 'ولد' | 'بنت' | 'زوجة' | 'حفيد' | 'ناظر' | 'أخرى';
  allocated_amount: number;
  payment_status: 'معلق' | 'مدفوع' | 'ملغي';
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DistributionSummary {
  total_revenues: number;
  total_expenses: number;
  net_revenues: number;
  nazer_share: number;
  waqif_charity: number;
  waqf_corpus: number;
  distributable_amount: number;
  beneficiaries_count: number;
}
