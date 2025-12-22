/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 3.1.5
 * @date 2025-12-22
 * 
 * @changelog 3.1.5
 * - إصلاح create_system_alert_from_error (أعمدة خاطئة)
 * - إصلاح log_security_event (metadata → event_data)
 * - إصلاح نوع ip_address في login_attempts_log (inet → text)
 * - إصلاح RLS على audit_logs_archive (تأمين للمسؤولين فقط)
 */

export const APP_VERSION = '3.1.5';
export const APP_VERSION_DATE = '2025-12-22';
export const APP_VERSION_NAME = 'منصة إدارة الوقف الإلكترونية';

export const VERSION_INFO = {
  version: APP_VERSION,
  date: APP_VERSION_DATE,
  name: APP_VERSION_NAME,
  changelog: '/docs/CHANGELOG.md',
  features: [
    '60+ خدمة متكاملة في طبقة الخدمات',
    '300+ hooks منظمة في 38 مجلد',
    '600+ مكون UI في 44 مجلد',
    '202 جدول قاعدة بيانات',
    '675 سياسة RLS موحدة',
    '189 Database Trigger',
    '258 Database Function',
    '29 Database View',
    '537 Database Index',
    '50 Edge Function نشطة',
    '350+ Query Key في 8 ملفات منظمة',
    'نظام إشعارات متكامل مع Database Triggers',
    'لوحة مراقبة حية مع رسوم بيانية Real-time',
    '31 مرحلة فحص منهجي مكتملة',
  ],
} as const;

/**
 * Architecture Status - حالة الهيكل المعماري
 */
export const ARCHITECTURE_STATUS = {
  services: {
    total: 60,
    status: 'complete',
    description: 'جميع الخدمات مكتملة ومنظمة',
  },
  hooks: {
    total: 300,
    folders: 38,
    status: 'complete',
    description: 'جميع الـ hooks منظمة في مجلدات وظيفية',
  },
  components: {
    total: 600,
    folders: 44,
    totalWithDirectSupabase: 0,
    status: 'complete',
    description: 'جميع المكونات تستخدم الهيكل الصحيح (Component → Hook → Service)',
  },
  queryKeys: {
    total: 350,
    files: 8,
    status: 'complete',
    description: 'QUERY_KEYS موحد في src/lib/query-keys/ (8 ملفات)',
  },
  database: {
    tables: 202,
    rlsPolicies: 675,
    triggers: 189,
    indexes: 521,
    functions: 258,
    views: 29,
    status: 'complete',
    description: 'قاعدة بيانات كاملة مع 258 Function و29 View و521 Index (محسّن)',
  },
  databaseFunctions: {
    total: 258,
    securityDefiner: 241,
    securityInvoker: 17,
    categories: {
      dataRetrieval: 45,
      updateTriggers: 52,
      permissions: 28,
      calculations: 35,
      automation: 22,
      creation: 18,
      generation: 15,
      validation: 20,
      notifications: 12,
      cleanup: 8,
      other: 3,
    },
    status: 'complete',
    description: '258 دالة قاعدة بيانات (93.4% SECURITY DEFINER)',
  },
  databaseViews: {
    total: 29,
    categories: {
      statistics: 8,
      reports: 7,
      dashboards: 5,
      lookups: 6,
      security: 3,
    },
    status: 'complete',
    description: '29 View للإحصائيات والتقارير ولوحات التحكم',
  },
  edgeFunctions: {
    total: 50,
    status: 'complete',
    description: '50 Edge Function نشطة ومنشورة',
  },
  realtime: {
    status: 'complete',
    description: 'Realtime موحد في hooks مخصصة للوحات التحكم',
  },
  rtlSupport: {
    status: 'complete',
    description: 'CSS Logical Properties (ms-*/me-*) بدلاً من ml-*/mr-*',
  },
  theming: {
    status: 'complete',
    description: 'CSS Variables للألوان بدلاً من القيم الثابتة',
  },
} as const;

/**
 * Database Functions Summary - ملخص دوال قاعدة البيانات
 */
export const DATABASE_FUNCTIONS_SUMMARY = {
  // دوال استرجاع البيانات
  dataRetrieval: [
    'get_dashboard_stats', 'get_beneficiary_statistics', 'get_distribution_summary',
    'get_financial_report', 'get_property_stats', 'get_fund_balance',
    'get_loan_summary', 'get_approval_stats', 'get_user_permissions',
  ],
  // دوال التحديث التلقائي (Triggers)
  updateTriggers: [
    'update_updated_at_column', 'update_account_balance', 'update_distribution_totals',
    'update_beneficiary_totals', 'update_property_occupancy', 'update_fund_balance',
    'update_loan_balance', 'update_contract_status', 'update_payment_status',
  ],
  // دوال الصلاحيات
  permissions: [
    'is_admin', 'is_nazer', 'is_accountant', 'is_beneficiary_manager',
    'has_permission', 'check_user_role', 'get_user_role', 'can_approve',
  ],
  // دوال الحسابات
  calculations: [
    'calculate_account_balance', 'calculate_distribution_share', 'calculate_loan_interest',
    'calculate_property_revenue', 'calculate_fund_performance', 'calculate_beneficiary_share',
  ],
  // دوال الأتمتة
  automation: [
    'auto_approve_distribution', 'auto_create_journal_entry', 'auto_generate_voucher',
    'auto_update_fiscal_year', 'auto_archive_old_records', 'auto_cleanup_sessions',
  ],
} as const;

/**
 * Database Views Summary - ملخص Views قاعدة البيانات
 */
export const DATABASE_VIEWS_SUMMARY = {
  statistics: [
    'beneficiary_statistics', 'distribution_statistics', 'property_statistics',
    'fund_statistics', 'loan_statistics', 'payment_statistics',
  ],
  reports: [
    'journal_entries_with_lines', 'general_ledger', 'accounts_hierarchy',
    'distributions_summary', 'beneficiaries_overview', 'pending_approvals_view',
  ],
  dashboards: [
    'dashboard_kpis', 'financial_dashboard', 'property_dashboard',
    'beneficiary_dashboard', 'approval_dashboard',
  ],
  security: [
    'beneficiaries_masked', 'payment_vouchers_masked', 'unmatched_bank_transactions',
  ],
} as const;

/**
 * Get formatted version string
 */
export function getVersionString(): string {
  return `v${APP_VERSION} (${APP_VERSION_DATE})`;
}

/**
 * Check if version is newer than given version
 */
export function isNewerVersion(currentVersion: string, compareVersion: string): boolean {
  const current = currentVersion.split('.').map(Number);
  const compare = compareVersion.split('.').map(Number);
  
  for (let i = 0; i < Math.max(current.length, compare.length); i++) {
    const c = current[i] || 0;
    const v = compare[i] || 0;
    if (c > v) return true;
    if (c < v) return false;
  }
  return false;
}
