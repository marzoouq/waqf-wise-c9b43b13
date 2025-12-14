/**
 * Unified Role Types - أنواع الأدوار الموحدة
 * 
 * المصدر الوحيد للحقيقة لجميع تعريفات الأدوار في النظام
 * مرتبط مع Database enum: app_role
 * 
 * @version 2.9.2
 */

import type { Database } from "@/integrations/supabase/types";

// ==================== نوع الدور الأساسي من قاعدة البيانات ====================
/**
 * أدوار النظام الأساسية - مستمدة من Database enum
 */
export type AppRole = Database['public']['Enums']['app_role'];

// ==================== أدوار سير العمل ====================
/**
 * أدوار سير العمل والموافقات
 */
export type WorkflowRole = 
  | 'manager'
  | 'finance'
  | 'reviewer'
  | 'financial_manager'
  | 'executor';

// ==================== جميع الأدوار ====================
/**
 * جميع الأدوار في النظام (أساسية + سير العمل)
 */
export type AllRole = AppRole | WorkflowRole;

// ==================== تسميات الأدوار ====================
/**
 * تسميات الأدوار بالعربية
 */
export const ROLE_LABELS: Record<AllRole, string> = {
  // الأدوار الأساسية (8 أدوار)
  nazer: 'الناظر',
  admin: 'المشرف',
  accountant: 'المحاسب',
  cashier: 'موظف الصرف',
  archivist: 'أرشيفي',
  beneficiary: 'مستفيد',
  waqf_heir: 'وارث الوقف',
  user: 'مستخدم',
  
  // أدوار سير العمل (5 أدوار)
  manager: 'المدير',
  finance: 'الموظف المالي',
  reviewer: 'مراجع',
  financial_manager: 'مدير مالي',
  executor: 'منفذ',
} as const;

// ==================== ألوان الأدوار ====================
/**
 * ألوان الأدوار باستخدام CSS Variables
 * متوافقة مع الثيم الفاتح والداكن
 */
export const ROLE_COLORS: Record<AllRole, string> = {
  // الأدوار الأساسية
  nazer: 'bg-role-nazer/10 text-role-nazer border-role-nazer/30',
  admin: 'bg-role-admin/10 text-role-admin border-role-admin/30',
  accountant: 'bg-role-accountant/10 text-role-accountant border-role-accountant/30',
  cashier: 'bg-role-cashier/10 text-role-cashier border-role-cashier/30',
  archivist: 'bg-role-archivist/10 text-role-archivist border-role-archivist/30',
  beneficiary: 'bg-role-beneficiary/10 text-role-beneficiary border-role-beneficiary/30',
  waqf_heir: 'bg-role-waqf-heir/10 text-role-waqf-heir border-role-waqf-heir/30',
  user: 'bg-role-user/10 text-role-user border-role-user/30',
  
  // أدوار سير العمل
  manager: 'bg-role-manager/10 text-role-manager border-role-manager/30',
  finance: 'bg-role-finance/10 text-role-finance border-role-finance/30',
  reviewer: 'bg-role-reviewer/10 text-role-reviewer border-role-reviewer/30',
  financial_manager: 'bg-role-financial-manager/10 text-role-financial-manager border-role-financial-manager/30',
  executor: 'bg-role-executor/10 text-role-executor border-role-executor/30',
} as const;

// ==================== مجموعات الأدوار ====================
/**
 * أدوار النظام الأساسية (8 أدوار)
 */
export const SYSTEM_ROLES: readonly AppRole[] = [
  'nazer',
  'admin',
  'accountant',
  'cashier',
  'archivist',
  'beneficiary',
  'waqf_heir',
  'user',
] as const;

/**
 * أدوار سير العمل والموافقات (مختلطة)
 */
export const WORKFLOW_ROLES: readonly string[] = [
  'reviewer',
  'accountant',
  'nazer',
  'financial_manager',
  'executor',
] as const;

/**
 * أدوار الموافقات
 */
export const APPROVAL_ROLES: readonly string[] = [
  'accountant',
  'manager',
  'nazer',
  'finance',
] as const;

/**
 * أدوار الإدارة (يمكنها الوصول للوحة التحكم)
 */
export const ADMIN_ROLES: readonly AppRole[] = [
  'nazer',
  'admin',
  'accountant',
  'cashier',
  'archivist',
] as const;

// ==================== خريطة التوجيه ====================
/**
 * خريطة توجيه لوحات التحكم حسب الدور
 */
export const ROLE_DASHBOARD_MAP: Record<AppRole, string> = {
  waqf_heir: '/beneficiary-portal',
  beneficiary: '/beneficiary-portal',
  nazer: '/nazer-dashboard',
  admin: '/admin-dashboard',
  accountant: '/accountant-dashboard',
  cashier: '/cashier-dashboard',
  archivist: '/archivist-dashboard',
  user: '/dashboard',
} as const;

/**
 * أولوية الأدوار للتوجيه (الأعلى أولاً)
 */
export const ROLE_PRIORITY: readonly AppRole[] = [
  'nazer',
  'admin',
  'accountant',
  'cashier',
  'archivist',
  'waqf_heir',
  'beneficiary',
  'user',
] as const;

// ==================== دوال مساعدة ====================
/**
 * الحصول على تسمية الدور بالعربية
 */
export function getRoleLabel(role: AllRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * الحصول على ألوان الدور
 */
export function getRoleColor(role: AllRole): string {
  return ROLE_COLORS[role] || ROLE_COLORS.user;
}

/**
 * التحقق من وجود الدور في قائمة الأدوار
 */
export function hasRole(role: AppRole, userRoles: string[]): boolean {
  return userRoles.includes(role);
}

/**
 * الحصول على لوحة التحكم المناسبة حسب الأدوار
 */
export function getDashboardForRoles(roles: AppRole[]): string {
  if (!roles || roles.length === 0) {
    return '/dashboard';
  }

  for (const priorityRole of ROLE_PRIORITY) {
    if (roles.includes(priorityRole)) {
      return ROLE_DASHBOARD_MAP[priorityRole];
    }
  }

  return '/dashboard';
}

/**
 * التحقق من كون الدور إدارياً
 */
export function isAdminRole(role: AppRole): boolean {
  return ADMIN_ROLES.includes(role);
}
