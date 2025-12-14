/**
 * Types for Distributions Module - Unified
 * أنواع وحدة التوزيعات - موحدة
 * 
 * هذا الملف يجمع جميع أنواع التوزيعات في مكان واحد
 */

// ====================
// أنواع نمط التوزيع
// ====================

export type DistributionPattern = 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid';

export type ApprovalWorkflowType = 'standard' | 'fast' | 'extended';

export type DistributionFrequency = 'شهري' | 'ربع_سنوي' | 'نصف_سنوي' | 'سنوي';

export type DistributionRule = 'شرعي' | 'متساوي' | 'مخصص';

export type BeneficiaryDistributionType = 'واقف' | 'ولد' | 'بنت' | 'زوجة' | 'حفيد' | 'ناظر' | 'أخرى';

export type PaymentStatus = 'معلق' | 'مدفوع' | 'ملغي';

export type FilterValue = string | number | boolean | null | undefined;

export type FiltersRecord = Record<string, FilterValue>;

// ====================
// الكيان الأساسي للتوزيع
// ====================

export interface Distribution {
  id: string;
  created_at: string;
  updated_at?: string | null;
  month: string;
  total_amount: number;
  beneficiaries_count: number;
  status: string;
  distribution_date: string;
  notes?: string | null;
  distribution_type?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  executed_at?: string | null;
  executed_by?: string | null;
  // حقول إضافية للتقارير والعرض
  period_start?: string;
  period_end?: string;
  total_revenues?: number;
  total_expenses?: number;
  net_revenues?: number;
  nazer_share?: number;
  waqif_charity?: number;
  waqf_corpus?: number;
  distributable_amount?: number;
  journal_entry_id?: string;
}

// ====================
// أنواع المستفيد في التوزيع
// ====================

export interface DistributionBeneficiary {
  id: string;
  full_name: string;
  national_id?: string;
  category?: string;
  beneficiary_type?: string;
  iban?: string;
  bank_name?: string;
}

// ====================
// أنواع الاستقطاعات
// ====================

export interface DeductionsValues {
  nazer: number;
  reserve: number;
  development: number;
  maintenance: number;
  investment: number;
}

// ====================
// أنواع إعدادات الموافقة
// ====================

export interface ApprovalSettingsValues {
  workflow: ApprovalWorkflowType;
  autoNotify: boolean;
}

// ====================
// أنواع معالج التوزيع (Wizard)
// ====================

export interface DistributionWizardFormData {
  pattern: DistributionPattern;
  beneficiaries: string[];
  deductions: DeductionsValues;
  approvalSettings: ApprovalSettingsValues;
}

export interface DistributionPreviewData {
  pattern: DistributionPattern;
  beneficiaries: string[];
  deductions: DeductionsValues;
  approvalSettings: ApprovalSettingsValues;
}

// ====================
// أنواع إعدادات التوزيع
// ====================

export interface WaqfDistributionSettings {
  id: string;
  waqf_unit_id?: string;
  distribution_frequency: DistributionFrequency;
  distribution_months: number[];
  auto_distribution: boolean;
  distribution_day_of_month: number;
  maintenance_percentage: number;
  nazer_percentage: number;
  waqif_charity_percentage: number;
  waqf_corpus_percentage: number;
  reserve_percentage: number;
  calculation_order: string;
  distribution_rule: DistributionRule;
  wives_share_ratio: number;
  notify_beneficiaries: boolean;
  notify_nazer: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ====================
// أنواع تفاصيل التوزيع
// ====================

export interface DistributionDetail {
  id: string;
  distribution_id: string;
  beneficiary_id: string;
  beneficiary_type: BeneficiaryDistributionType;
  allocated_amount: number;
  payment_status: PaymentStatus;
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  beneficiaries?: DistributionBeneficiary;
}

// ====================
// أنواع ملخص التوزيع
// ====================

export interface DistributionSummary {
  total_revenues: number;
  total_expenses: number;
  net_revenues: number;
  maintenance_amount: number;
  nazer_share: number;
  waqif_charity: number;
  waqf_corpus: number;
  reserve_amount: number;
  distributable_amount: number;
  beneficiaries_count: number;
}

// ====================
// أنواع البيانات الشهرية
// ====================

export interface MonthlyDistributionData {
  month: string;
  count: number;
  amount: number;
}

export interface PatternDistributionData {
  name: string;
  count: number;
}

// ====================
// أنواع الإحصائيات
// ====================

export interface DistributionStats {
  total: number;
  thisMonth: number;
  totalAmount: number;
  avgAmount: number;
  completed: number;
  pending: number;
}

// ====================
// أنواع توزيعات الورثة (موحد)
// ====================

/**
 * واجهة موحدة لتوزيعات الورثة
 * تُستخدم في جميع مكونات وhooks التوزيعات
 */
export interface HeirDistribution {
  id: string;
  share_amount: number;
  heir_type: string;
  distribution_date: string;
  fiscal_year_id: string;
  notes?: string | null;
  fiscal_years: {
    name: string;
    start_date?: string;
    end_date?: string;
    is_closed: boolean;
    is_active?: boolean;
  } | null;
}
