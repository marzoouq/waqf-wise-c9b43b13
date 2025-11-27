/**
 * أنواع التوزيعات ومعالج التوزيع
 */

export type DistributionPattern = 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid';

export type ApprovalWorkflowType = 'standard' | 'fast' | 'extended';

export interface DeductionsValues {
  nazer: number;
  reserve: number;
  development: number;
  maintenance: number;
  investment: number;
}

export interface ApprovalSettingsValues {
  workflow: ApprovalWorkflowType;
  autoNotify: boolean;
}

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

/**
 * نوع قيمة الفلتر المتقدم
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * نوع سجل الفلاتر
 */
export type FiltersRecord = Record<string, FilterValue>;
