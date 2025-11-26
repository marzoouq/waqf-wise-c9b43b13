/**
 * Role Labels - تسميات الأدوار الموحدة
 * ملف مركزي لجميع تسميات الأدوار في النظام
 */

export type AppRole = 
  | 'nazer'
  | 'admin' 
  | 'accountant'
  | 'cashier'
  | 'archivist'
  | 'beneficiary'
  | 'user'
  | 'manager'
  | 'finance'
  | 'reviewer'
  | 'financial_manager'
  | 'executor';

/**
 * تسميات الأدوار بالعربية
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  // الأدوار الأساسية
  nazer: 'الناظر',
  admin: 'المشرف',
  accountant: 'المحاسب',
  cashier: 'موظف صرف',
  archivist: 'أرشيفي',
  beneficiary: 'مستفيد',
  user: 'مستخدم',
  
  // أدوار الموافقات
  manager: 'المدير',
  finance: 'الموظف المالي',
  reviewer: 'مراجع',
  financial_manager: 'مدير مالي',
  executor: 'منفذ',
} as const;

/**
 * ألوان الأدوار للـ Badges
 */
export const ROLE_COLORS: Record<AppRole, string> = {
  nazer: 'bg-purple-100 text-purple-700 border-purple-300',
  admin: 'bg-blue-100 text-blue-700 border-blue-300',
  accountant: 'bg-green-100 text-green-700 border-green-300',
  cashier: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  archivist: 'bg-gray-100 text-gray-700 border-gray-300',
  beneficiary: 'bg-pink-100 text-pink-700 border-pink-300',
  user: 'bg-slate-100 text-slate-700 border-slate-300',
  manager: 'bg-indigo-100 text-indigo-700 border-indigo-300',
  finance: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  reviewer: 'bg-teal-100 text-teal-700 border-teal-300',
  financial_manager: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  executor: 'bg-orange-100 text-orange-700 border-orange-300',
} as const;

/**
 * أدوار محددة حسب السياق
 */
export const APPROVAL_ROLES = ['accountant', 'manager', 'nazer', 'finance'] as const;
export const WORKFLOW_ROLES = ['reviewer', 'accountant', 'nazer', 'financial_manager', 'executor'] as const;
export const SYSTEM_ROLES = ['nazer', 'admin', 'accountant', 'cashier', 'archivist', 'beneficiary', 'user'] as const;

/**
 * Entity Type Labels - تسميات أنواع الكيانات
 */
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  journal_entry: 'قيد محاسبي',
  distribution: 'توزيع غلة',
  payment: 'دفع مستحقات',
  loan: 'قرض',
  request: 'طلب',
  contract: 'عقد',
} as const;
