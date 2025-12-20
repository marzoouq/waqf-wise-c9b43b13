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
// أسماء الأعمدة المتغيرة (Deprecated → Current)
// =====================================================

/**
 * قائمة الأعمدة التي تم تغيير أسمائها
 * المفتاح: الاسم القديم (الممنوع)
 * القيمة: الاسم الجديد (الصحيح) + الجدول المتأثر
 */
export const DEPRECATED_COLUMNS = {
  // properties: address تم تغييره إلى location
  address: {
    tables: ['properties'],
    correctName: 'location',
    reason: 'تم توحيد أسماء الأعمدة - استخدم location بدلاً من address',
  },
  
  // أمثلة إضافية للأعمدة المتغيرة
  property_type: {
    tables: ['properties'],
    correctName: 'type',
    reason: 'تم اختصار الاسم - استخدم type بدلاً من property_type في جدول properties',
  },
} as const;

/**
 * قائمة الأعمدة الصحيحة لكل جدول
 */
export const TABLE_COLUMNS = {
  properties: [
    'id', 'name', 'type', 'location', 'units', 'occupied', 'monthly_revenue',
    'status', 'description', 'created_at', 'updated_at', 'waqf_unit_id',
    'total_units', 'occupied_units', 'available_units', 'occupancy_percentage',
    'tax_percentage', 'shop_count', 'apartment_count', 'revenue_type', 'floors'
  ] as const,
  
  beneficiaries: [
    'id', 'full_name', 'national_id', 'phone', 'email', 'category', 'family_name',
    'relationship', 'status', 'notes', 'created_at', 'updated_at', 'user_id',
    'tribe', 'priority_level', 'marital_status', 'nationality', 'city', 'address',
    'date_of_birth', 'gender', 'bank_name', 'bank_account_number', 'iban',
    'monthly_income', 'family_size', 'is_head_of_family', 'parent_beneficiary_id',
    'tags', 'number_of_sons', 'number_of_daughters', 'number_of_wives',
    'employment_status', 'housing_type', 'notification_preferences',
    'last_notification_at', 'can_login', 'username', 'last_login_at',
    'login_enabled_at', 'beneficiary_number', 'beneficiary_type', 'account_balance',
    'total_received', 'pending_requests', 'family_id', 'verification_status',
    'verified_at', 'verified_by', 'last_activity_at', 'total_payments',
    'pending_amount', 'verification_documents', 'verification_notes',
    'last_verification_date', 'verification_method', 'risk_score',
    'eligibility_status', 'eligibility_notes', 'last_review_date',
    'next_review_date', 'social_status_details', 'income_sources',
    'disabilities', 'medical_conditions'
  ] as const,
  
  contracts: [
    'id', 'contract_number', 'property_id', 'tenant_name', 'tenant_phone',
    'tenant_id_number', 'tenant_email', 'contract_type', 'start_date', 'end_date',
    'monthly_rent', 'security_deposit', 'payment_frequency', 'status',
    'is_renewable', 'auto_renew', 'renewal_notice_days', 'terms_and_conditions',
    'notes', 'created_at', 'updated_at', 'created_by', 'units_count',
    'tenant_id', 'tax_percentage'
  ] as const,
} as const;

// =====================================================
// قواعد فحص أسماء الأعمدة
// =====================================================

export const COLUMN_RULES = {
  // الأعمدة الممنوعة لكل جدول
  forbiddenColumns: {
    properties: ['address', 'property_type'],
  },
  
  // التصحيحات المقترحة
  corrections: {
    properties: {
      address: 'location',
      property_type: 'type',
    },
  },
} as const;

/**
 * التحقق مما إذا كان اسم العمود صحيحاً للجدول المحدد
 */
export function isValidColumn(table: keyof typeof TABLE_COLUMNS, column: string): boolean {
  const columns = TABLE_COLUMNS[table];
  return columns ? columns.includes(column as any) : true;
}

/**
 * الحصول على الاسم الصحيح للعمود
 */
export function getCorrectColumnName(table: string, deprecatedColumn: string): string | null {
  const corrections = COLUMN_RULES.corrections[table as keyof typeof COLUMN_RULES.corrections];
  if (corrections && deprecatedColumn in corrections) {
    return corrections[deprecatedColumn as keyof typeof corrections];
  }
  return null;
}

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
