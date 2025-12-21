/**
 * Unified Logger - نظام Logging موحد
 * يختار تلقائياً الـ Logger المناسب حسب البيئة
 * 
 * @example
 * ```typescript
 * import { logger, debugLog } from '@/lib/logger';
 * 
 * // النمط الجديد
 * logger.error('Error message', error, { context: 'test' });
 * 
 * // Debug logging (يظهر في التطوير فقط)
 * debugLog('ProtectedRoute', 'حالة:', { authLoading: true });
 * ```
 */

import { devLogger } from './dev-logger';
import { productionLogger } from './production-logger';
import type { ILogger, LogOptions, LogLevel, Severity, LogEntry } from './types';

const MODE = (import.meta.env.MODE as string) || 'development';
const IS_DEV = MODE !== 'production';

// ============= Debug Logger المركزي =============
const COMPONENT_ICONS = {
  ProtectedRoute: '🛡️',
  AppShell: '🏗️',
  AuthContext: '🔐',
  useLightAuth: '🔑',
  RoleBasedRedirect: '🔄',
} as const;

type ComponentName = keyof typeof COMPONENT_ICONS;

/**
 * Debug Logger - يظهر فقط في بيئة التطوير
 * مركزي ومحمي - لا يظهر في الإنتاج
 */
export const debugLog = (
  component: ComponentName,
  message: string,
  data?: unknown
): void => {
  if (IS_DEV) {
    const icon = COMPONENT_ICONS[component];
    if (data !== undefined) {
      console.log(`${icon} [${component}] ${message}`, data);
    } else {
      console.log(`${icon} [${component}] ${message}`);
    }
  }
};

// اختيار الـ Logger المناسب حسب البيئة
export const logger: ILogger = IS_DEV ? devLogger : productionLogger;

// إعادة تصدير الأنواع
export type { ILogger, LogOptions, LogLevel, Severity, LogEntry };

// إعادة تصدير الـ loggers الفردية للاستخدام المباشر إذا لزم الأمر
export { devLogger } from './dev-logger';
export { productionLogger } from './production-logger';

// Helper function للتوافق مع الكود القديم
export function logAppError(error: Error | unknown, context?: string): void {
  logger.error(error, { context, severity: 'medium' });
}

// تنظيف عند إغلاق الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (logger.cleanup) {
      logger.cleanup();
    }
  });
}
