/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 2.8.92
 * @date 2025-12-11
 */

export const APP_VERSION = '2.8.95';
export const APP_VERSION_DATE = '2025-12-11';
export const APP_VERSION_NAME = 'منصة إدارة الوقف الإلكترونية';

export const VERSION_INFO = {
  version: APP_VERSION,
  date: APP_VERSION_DATE,
  name: APP_VERSION_NAME,
  changelog: '/docs/CHANGELOG.md',
  features: [
    '51 خدمة متكاملة في طبقة الخدمات',
    '170+ hooks منظمة في 36 مجلد',
    'QUERY_KEYS موحد لـ React Query',
    'Realtime موحد للوحات التحكم',
    '0 استدعاء Supabase مباشر من Components أو Pages',
    '0 أنواع any في الخدمات (Type Safety كامل)',
  ],
} as const;

/**
 * Architecture Status - حالة الهيكل المعماري
 */
export const ARCHITECTURE_STATUS = {
  services: {
    total: 51,
    status: 'complete',
    description: 'جميع الخدمات مكتملة ومنظمة',
  },
  hooks: {
    total: 170,
    folders: 36,
    status: 'complete',
    description: 'جميع الـ hooks منظمة في مجلدات وظيفية',
  },
  components: {
    totalWithDirectSupabase: 0,
    status: 'complete',
    description: 'جميع المكونات تستخدم الهيكل الصحيح (Component → Hook → Service)',
  },
  queryKeys: {
    status: 'complete',
    description: 'QUERY_KEYS موحد في src/lib/query-keys.ts',
  },
  realtime: {
    status: 'complete',
    description: 'Realtime موحد في hooks مخصصة للوحات التحكم',
  },
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
