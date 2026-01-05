/**
 * ثوابت الطلبات - لتوحيد الحالات والأولويات
 * Request Constants - Unified statuses and priorities
 */

// الحالات الفعلية في قاعدة البيانات
export const REQUEST_STATUS = {
  PENDING: 'قيد المراجعة',
  IN_PROGRESS: 'قيد المعالجة',
  APPROVED: 'موافق عليه',
  REJECTED: 'مرفوض',
  COMPLETED: 'مكتمل',
} as const;

// الأولويات الفعلية في قاعدة البيانات
export const REQUEST_PRIORITY = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'عالية',
  URGENT: 'عاجلة',
} as const;

// خيارات الحالة للفلاتر
export const STATUS_OPTIONS = [
  { value: 'all', label: 'جميع الحالات' },
  { value: REQUEST_STATUS.PENDING, label: 'قيد المراجعة' },
  { value: REQUEST_STATUS.IN_PROGRESS, label: 'قيد المعالجة' },
  { value: REQUEST_STATUS.APPROVED, label: 'موافق عليه' },
  { value: REQUEST_STATUS.REJECTED, label: 'مرفوض' },
  { value: REQUEST_STATUS.COMPLETED, label: 'مكتمل' },
];

// خيارات الأولوية للفلاتر
export const PRIORITY_OPTIONS = [
  { value: REQUEST_PRIORITY.LOW, label: 'منخفضة' },
  { value: REQUEST_PRIORITY.MEDIUM, label: 'متوسطة' },
  { value: REQUEST_PRIORITY.HIGH, label: 'عالية' },
  { value: REQUEST_PRIORITY.URGENT, label: 'عاجلة' },
];

// ألوان شارات الحالة
export const STATUS_BADGE_STYLES: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  [REQUEST_STATUS.PENDING]: { variant: 'secondary', className: 'bg-warning/10 text-warning border-warning/30' },
  [REQUEST_STATUS.IN_PROGRESS]: { variant: 'default', className: 'bg-primary/10 text-primary border-primary/30' },
  [REQUEST_STATUS.APPROVED]: { variant: 'default', className: 'bg-success/10 text-success border-success/30' },
  [REQUEST_STATUS.REJECTED]: { variant: 'destructive' },
  [REQUEST_STATUS.COMPLETED]: { variant: 'default', className: 'bg-success/10 text-success border-success/30' },
};

// ألوان شارات الأولوية
export const PRIORITY_BADGE_STYLES: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  [REQUEST_PRIORITY.LOW]: { variant: 'secondary' },
  [REQUEST_PRIORITY.MEDIUM]: { variant: 'outline' },
  [REQUEST_PRIORITY.HIGH]: { variant: 'default' },
  [REQUEST_PRIORITY.URGENT]: { variant: 'destructive' },
};

// مستويات الموافقة
export const APPROVAL_LEVELS = [
  { level: 1, name: 'المشرف', role: 'admin' },
  { level: 2, name: 'المحاسب', role: 'accountant' },
  { level: 3, name: 'الناظر', role: 'nazer' },
];
