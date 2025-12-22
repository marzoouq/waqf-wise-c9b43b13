/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 2.9.90
 * @date 2025-12-22
 */

export const APP_VERSION = '2.9.90';
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
    '231 جدول قاعدة بيانات',
    '675 سياسة RLS موحدة',
    '200 Database Trigger',
    '50 Edge Function نشطة',
    '350+ Query Key في 8 ملفات منظمة',
    'نظام إشعارات متكامل مع Database Triggers',
    'لوحة مراقبة حية مع رسوم بيانية Real-time',
    '29 مرحلة فحص منهجي مكتملة',
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
    tables: 231,
    rlsPolicies: 675,
    triggers: 200,
    status: 'complete',
    description: 'قاعدة بيانات كاملة مع RLS وTriggers',
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
