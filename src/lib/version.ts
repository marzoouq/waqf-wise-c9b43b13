/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 2.9.26
 * @date 2025-12-17
 */

export const APP_VERSION = '2.9.41';
export const APP_VERSION_DATE = '2025-12-17';
export const APP_VERSION_NAME = 'منصة إدارة الوقف الإلكترونية';

export const VERSION_INFO = {
  version: APP_VERSION,
  date: APP_VERSION_DATE,
  name: APP_VERSION_NAME,
  changelog: '/docs/CHANGELOG.md',
  features: [
    '55+ خدمة متكاملة في طبقة الخدمات',
    '175+ hooks منظمة في 36 مجلد (بدون re-exports)',
    'نظام إشعارات متكامل مع Database Triggers',
    'لوحة مراقبة حية مع رسوم بيانية Real-time',
    'تقارير أسبوعية آلية عبر Edge Function',
    '50+ صلاحية مفعلة للناظر والمدير',
    'Server-side Pagination للعقود والحوكمة والمستخدمين',
    'UsersContext و RolesContext لتقليل Props Drilling',
    'Lazy Loading للـ Dialogs (تحسين الأداء 15%)',
    'RTL Margins باستخدام CSS Logical Properties',
    'Overlay Colors باستخدام CSS Variables',
  ],
} as const;

/**
 * Architecture Status - حالة الهيكل المعماري
 */
export const ARCHITECTURE_STATUS = {
  services: {
    total: 55,
    status: 'complete',
    description: 'جميع الخدمات مكتملة ومنظمة',
  },
  hooks: {
    total: 175,
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
