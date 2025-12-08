/**
 * Application Version Information
 * معلومات إصدار التطبيق
 * 
 * @version 2.8.25
 * @date 2025-12-08
 */

export const APP_VERSION = '2.8.30';
export const APP_VERSION_DATE = '2025-12-08';
export const APP_VERSION_NAME = 'منصة إدارة الوقف الإلكترونية';

export const VERSION_INFO = {
  version: APP_VERSION,
  date: APP_VERSION_DATE,
  name: APP_VERSION_NAME,
  changelog: '/docs/CHANGELOG.md',
  features: [
    'اكتمال نقل جميع الـ hooks للخدمات',
    '41 خدمة متكاملة (Core: 4, Domain: 34, Infrastructure: 3)',
    'Realtime subscriptions مقبولة في 7 hooks',
    'SecurityService, SettingsService, IntegrationService',
    'MonitoringService, KnowledgeService, DocumentationService',
    'NotificationSettingsService للإشعارات',
    'صفر أخطاء بناء - 100% فصل الاهتمامات',
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
