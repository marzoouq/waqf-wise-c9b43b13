/**
 * خريطة الصلاحيات لكل دور في النظام
 * Role Permissions Configuration
 * 
 * @description يحدد الصلاحيات المتاحة لكل دور في النظام
 * يجب تحديث هذا الملف عند إضافة أدوار أو صلاحيات جديدة
 */

export type Permission = 
  // صلاحيات عامة
  | 'view_dashboard'
  | 'view_all_data'
  | 'export_data'
  // صلاحيات المستفيدين
  | 'manage_beneficiaries'
  | 'view_beneficiaries'
  // صلاحيات التوزيعات والمدفوعات
  | 'manage_distributions'
  | 'view_distributions'
  | 'approve_payments'
  | 'process_payments'
  // صلاحيات العقارات
  | 'manage_properties'
  | 'manage_contracts'
  // صلاحيات المحاسبة
  | 'manage_journal_entries'
  // صلاحيات التقارير
  | 'view_reports'
  // صلاحيات الإدارة
  | 'manage_settings'
  | 'manage_users'
  // صلاحيات الأرشيف
  | 'manage_documents'
  | 'upload_files'
  | 'manage_archive'
  // صلاحيات المستفيد الشخصية
  | 'view_own_profile'
  | 'view_own_payments'
  | 'view_waqf_summary'
  | 'view_properties'
  | 'view_governance'
  | 'view_budgets'
  | 'view_family_tree'
  | 'view_disclosures'
  | 'view_bank_accounts'
  | 'view_financial_reports'
  | 'view_approvals_log'
  | 'view_statements'
  | 'edit_user_email'
  // صلاحيات نقطة البيع
  | 'pos_access'
  | 'pos_open_shift'
  | 'pos_close_shift'
  | 'pos_collect'
  | 'pos_disburse'
  | 'pos_print_receipt'
  | 'pos_view_reports'
  | 'pos_daily_settlement';

export type RoleName =
  | 'nazer' 
  | 'admin' 
  | 'accountant' 
  | 'cashier' 
  | 'archivist' 
  | 'beneficiary' 
  | 'waqf_heir'
  | 'user';

/**
 * خريطة الصلاحيات لكل دور
 */
export const ROLE_PERMISSIONS: Record<RoleName, Permission[]> = {
  nazer: [
    'view_dashboard', 
    'manage_beneficiaries', 
    'manage_distributions', 
    'approve_payments', 
    'view_reports', 
    'manage_settings', 
    'manage_users',
    'view_all_data', 
    'export_data', 
    'manage_properties', 
    'manage_contracts',
    'edit_user_email',
    // صلاحيات نقطة البيع
    'pos_access',
    'pos_open_shift',
    'pos_close_shift',
    'pos_collect',
    'pos_disburse',
    'pos_print_receipt',
    'pos_view_reports',
    'pos_daily_settlement'
  ],
  admin: [
    'view_dashboard', 
    'manage_beneficiaries', 
    'manage_distributions',
    'view_reports', 
    'manage_settings', 
    'manage_users', 
    'view_all_data',
    'export_data', 
    'manage_properties', 
    'manage_contracts',
    'edit_user_email',
    // صلاحيات نقطة البيع
    'pos_access',
    'pos_open_shift',
    'pos_close_shift',
    'pos_collect',
    'pos_disburse',
    'pos_print_receipt',
    'pos_view_reports',
    'pos_daily_settlement'
  ],
  accountant: [
    'view_dashboard', 
    'manage_distributions', 
    'view_reports',
    'export_data', 
    'manage_journal_entries', 
    'view_beneficiaries',
    // صلاحيات نقطة البيع
    'pos_access',
    'pos_open_shift',
    'pos_close_shift',
    'pos_collect',
    'pos_disburse',
    'pos_print_receipt',
    'pos_view_reports',
    'pos_daily_settlement'
  ],
  cashier: [
    'view_dashboard', 
    'process_payments', 
    'view_beneficiaries',
    'view_distributions',
    // صلاحيات نقطة البيع
    'pos_access',
    'pos_open_shift',
    'pos_close_shift',
    'pos_collect',
    'pos_disburse',
    'pos_print_receipt'
  ],
  archivist: [
    'view_dashboard', 
    'manage_documents', 
    'view_beneficiaries',
    'upload_files', 
    'manage_archive'
  ],
  beneficiary: [
    'view_own_profile',
    'view_own_payments',
    'view_waqf_summary',
    'view_properties',
    'view_distributions',
    'view_governance',
    'view_budgets',
    'view_family_tree',
    'view_disclosures',
    'view_bank_accounts',
    'view_financial_reports',
    'view_approvals_log',
    'view_statements',
  ],
  waqf_heir: [
    'view_own_profile',
    'view_own_payments',
    'view_waqf_summary',
    'view_properties',
    'view_distributions',
    'view_governance',
    'view_budgets',
    'view_family_tree',
    'view_disclosures',
    'view_bank_accounts',
    'view_financial_reports',
    'view_approvals_log',
    'view_statements',
  ],
  user: [
    'view_dashboard'
  ]
};

/**
 * التحقق من صلاحية معينة لمجموعة أدوار
 */
export function checkPermission(permission: Permission, userRoles: string[]): boolean {
  for (const role of userRoles) {
    const permissions = ROLE_PERMISSIONS[role as RoleName] || [];
    if (permissions.includes(permission) || permissions.includes('view_all_data')) {
      return true;
    }
  }
  return false;
}

/**
 * الحصول على جميع صلاحيات مجموعة أدوار
 */
export function getAllPermissions(userRoles: string[]): Permission[] {
  const permissions = new Set<Permission>();
  
  for (const role of userRoles) {
    const rolePermissions = ROLE_PERMISSIONS[role as RoleName] || [];
    rolePermissions.forEach(p => permissions.add(p));
  }
  
  return Array.from(permissions);
}

/**
 * التحقق من وجود دور معين
 */
export function hasRole(roleName: RoleName, userRoles: string[]): boolean {
  return userRoles.includes(roleName);
}

/**
 * الأدوار المتاحة في النظام
 */
export const AVAILABLE_ROLES: { name: RoleName; label: string; description: string }[] = [
  { name: 'nazer', label: 'الناظر', description: 'صلاحيات كاملة على النظام' },
  { name: 'admin', label: 'المشرف', description: 'إدارة المستخدمين والإعدادات' },
  { name: 'accountant', label: 'المحاسب', description: 'إدارة القيود المالية والتقارير' },
  { name: 'cashier', label: 'أمين الصندوق', description: 'معالجة المدفوعات' },
  { name: 'archivist', label: 'الأرشيفي', description: 'إدارة المستندات والأرشيف' },
  { name: 'beneficiary', label: 'المستفيد', description: 'عرض البيانات الشخصية فقط' },
  { name: 'waqf_heir', label: 'وارث الوقف', description: 'وصول كامل لبيانات الوقف للشفافية' },
  { name: 'user', label: 'مستخدم', description: 'صلاحيات أساسية' },
];
