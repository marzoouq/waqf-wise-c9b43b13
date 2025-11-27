/**
 * أنواع التوزيعات - ملف توافقي
 * @deprecated استخدم @/types/distribution/index.ts بدلاً من هذا الملف
 * 
 * هذا الملف موجود للتوافق مع الكود القديم فقط
 * جميع الأنواع الآن في @/types/distribution/index.ts
 */

export {
  // Types
  type DistributionPattern,
  type ApprovalWorkflowType,
  type DistributionFrequency,
  type DistributionRule,
  type BeneficiaryDistributionType,
  type PaymentStatus,
  type FilterValue,
  type FiltersRecord,
  
  // Interfaces
  type DeductionsValues,
  type ApprovalSettingsValues,
  type DistributionWizardFormData,
  type DistributionPreviewData,
  type WaqfDistributionSettings,
  type DistributionBeneficiary,
  type DistributionDetail,
  type DistributionSummary,
} from './distribution/index';
