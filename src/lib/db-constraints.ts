/**
 * تعريف جميع CHECK constraints من قاعدة البيانات
 * يُستخدم للتحقق من توافق الكود مع قيود قاعدة البيانات
 * 
 * ⚠️ مهم: هذه القيم مستخرجة من pg_constraint في قاعدة البيانات
 * تأكد من تحديثها عند تغيير الـ constraints في الـ migrations
 */

// =====================================================
// تعريف الـ Constraints
// =====================================================

export const DB_CONSTRAINTS = {
  // جدول system_alerts - لا يقبل 'info'
  system_alerts: {
    severity: ['low', 'medium', 'high', 'critical'] as const,
    status: ['active', 'acknowledged', 'resolved'] as const,
  },
  
  // جدول audit_logs - يقبل 'info' (لأنه للتوثيق العام)
  audit_logs: {
    severity: ['info', 'warning', 'error', 'critical'] as const,
  },
  
  // جدول system_error_logs - لا يقبل 'info'
  system_error_logs: {
    severity: ['low', 'medium', 'high', 'critical'] as const,
    status: ['new', 'investigating', 'resolved', 'ignored'] as const,
  },
  
  // جدول contracts
  contracts: {
    status: ['مسودة', 'نشط', 'منتهي', 'ملغي', 'متأخر'] as const,
    contract_type: ['إيجار', 'بيع', 'صيانة', 'خدمات'] as const,
  },
  
  // جدول properties
  properties: {
    property_type: ['سكني', 'تجاري', 'صناعي', 'زراعي', 'أرض'] as const,
    status: ['نشط', 'معلق', 'للبيع', 'للإيجار', 'قيد الصيانة'] as const,
  },
  
  // جدول beneficiaries
  beneficiaries: {
    status: ['نشط', 'معلق', 'غير نشط'] as const,
    gender: ['ذكر', 'أنثى'] as const,
    marital_status: ['أعزب', 'متزوج', 'مطلق', 'أرمل'] as const,
    verification_status: ['pending', 'verified', 'rejected'] as const,
    eligibility_status: ['eligible', 'ineligible', 'pending_review'] as const,
  },
  
  // جدول distributions
  distributions: {
    status: ['draft', 'pending', 'approved', 'distributed', 'cancelled'] as const,
  },
  
  // جدول payment_vouchers
  payment_vouchers: {
    status: ['pending', 'approved', 'rejected', 'cancelled', 'paid'] as const,
    payment_method: ['cash', 'bank_transfer', 'check'] as const,
  },
} as const;

// =====================================================
// Type exports للاستخدام في TypeScript
// =====================================================

// System Alerts
export type SystemAlertSeverity = typeof DB_CONSTRAINTS.system_alerts.severity[number];
export type SystemAlertStatus = typeof DB_CONSTRAINTS.system_alerts.status[number];

// Audit Logs
export type AuditLogSeverity = typeof DB_CONSTRAINTS.audit_logs.severity[number];

// System Error Logs
export type SystemErrorLogSeverity = typeof DB_CONSTRAINTS.system_error_logs.severity[number];
export type SystemErrorLogStatus = typeof DB_CONSTRAINTS.system_error_logs.status[number];

// Contracts
export type ContractStatus = typeof DB_CONSTRAINTS.contracts.status[number];
export type ContractType = typeof DB_CONSTRAINTS.contracts.contract_type[number];

// Properties
export type PropertyType = typeof DB_CONSTRAINTS.properties.property_type[number];
export type PropertyStatus = typeof DB_CONSTRAINTS.properties.status[number];

// Beneficiaries
export type BeneficiaryStatus = typeof DB_CONSTRAINTS.beneficiaries.status[number];
export type BeneficiaryGender = typeof DB_CONSTRAINTS.beneficiaries.gender[number];
export type BeneficiaryMaritalStatus = typeof DB_CONSTRAINTS.beneficiaries.marital_status[number];
export type BeneficiaryVerificationStatus = typeof DB_CONSTRAINTS.beneficiaries.verification_status[number];
export type BeneficiaryEligibilityStatus = typeof DB_CONSTRAINTS.beneficiaries.eligibility_status[number];

// Distributions
export type DistributionStatus = typeof DB_CONSTRAINTS.distributions.status[number];

// Payment Vouchers
export type PaymentVoucherStatus = typeof DB_CONSTRAINTS.payment_vouchers.status[number];
export type PaymentMethod = typeof DB_CONSTRAINTS.payment_vouchers.payment_method[number];

// =====================================================
// دوال التحقق
// =====================================================

/**
 * التحقق من صحة قيمة severity لجدول system_alerts
 */
export function isValidSystemAlertSeverity(value: string): value is SystemAlertSeverity {
  return DB_CONSTRAINTS.system_alerts.severity.includes(value as SystemAlertSeverity);
}

/**
 * التحقق من صحة قيمة severity لجدول audit_logs
 */
export function isValidAuditLogSeverity(value: string): value is AuditLogSeverity {
  return DB_CONSTRAINTS.audit_logs.severity.includes(value as AuditLogSeverity);
}

/**
 * التحقق من صحة قيمة severity لجدول system_error_logs
 */
export function isValidSystemErrorLogSeverity(value: string): value is SystemErrorLogSeverity {
  return DB_CONSTRAINTS.system_error_logs.severity.includes(value as SystemErrorLogSeverity);
}

/**
 * الحصول على القيمة الافتراضية الآمنة لـ severity
 * إذا كانت القيمة المطلوبة غير مسموحة، ترجع 'low'
 */
export function getSafeSeverity(
  table: 'system_alerts' | 'system_error_logs',
  requestedSeverity: string
): SystemAlertSeverity | SystemErrorLogSeverity {
  const allowedValues = DB_CONSTRAINTS[table].severity;
  
  if (allowedValues.includes(requestedSeverity as any)) {
    return requestedSeverity as SystemAlertSeverity | SystemErrorLogSeverity;
  }
  
  // تحويل 'info' إلى 'low' تلقائياً
  if (requestedSeverity === 'info') {
    return 'low';
  }
  
  return 'low';
}

// =====================================================
// قواعد التحقق للاستخدام في السكريبتات
// =====================================================

export const SEVERITY_RULES = {
  // الجداول التي لا تقبل 'info'
  tablesWithoutInfo: ['system_alerts', 'system_error_logs'] as const,
  
  // الجداول التي تقبل 'info'
  tablesWithInfo: ['audit_logs'] as const,
  
  // القيم الممنوعة لكل جدول
  forbiddenValues: {
    system_alerts: { severity: ['info'] },
    system_error_logs: { severity: ['info'] },
  },
} as const;

// =====================================================
// معلومات للتوثيق
// =====================================================

export const CONSTRAINT_DOCS = {
  system_alerts: {
    description: 'تنبيهات النظام - للأخطاء والتحذيرات المهمة',
    severity_note: 'لا تستخدم info، استخدم low للتنبيهات منخفضة الأهمية',
  },
  system_error_logs: {
    description: 'سجلات الأخطاء - لتتبع المشاكل التقنية',
    severity_note: 'لا تستخدم info، استخدم low للأخطاء البسيطة',
  },
  audit_logs: {
    description: 'سجلات التدقيق - لتوثيق جميع العمليات',
    severity_note: 'يمكن استخدام info للعمليات العادية',
  },
} as const;
