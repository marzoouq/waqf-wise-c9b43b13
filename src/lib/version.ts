/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 2.6.11
 * @date 2025-12-04
 */

export const APP_VERSION = '2.6.11';
export const APP_VERSION_DATE = '2025-12-04';
export const APP_VERSION_NAME = 'منصة إدارة الوقف الإلكترونية';

export const VERSION_INFO = {
  version: APP_VERSION,
  date: APP_VERSION_DATE,
  name: APP_VERSION_NAME,
  changelog: '/docs/CHANGELOG.md',
  features: [
    'نظام تقارير موحد مع تحديث مباشر (Real-time)',
    'مكون KPIs موحد (UnifiedDashboardKPIs) لجميع لوحات التحكم',
    'تفعيل Real-time subscriptions على 9 جداول رئيسية',
    'مؤشر آخر تحديث وزر التحديث اليدوي في التقارير',
    'تقليل staleTime من 1 ساعة إلى 2 دقيقة',
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
