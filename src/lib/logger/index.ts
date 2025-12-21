/**
 * Unified Logger - نظام Logging موحد
 * يختار تلقائياً الـ Logger المناسب حسب البيئة
 * 
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 * 
 * logger.debug('Debug message', { data: 'value' });
 * logger.info('Info message');
 * logger.warn('Warning message');
 * logger.error('Error message', error);
 * ```
 */

import { devLogger } from './dev-logger';
import { productionLogger } from './production-logger';
import type { ILogger, LogOptions, LogLevel, Severity, LogEntry } from './types';

const MODE = (import.meta.env.MODE as string) || 'development';
const IS_DEV = MODE !== 'production';

// اختيار الـ Logger المناسب حسب البيئة
export const logger = IS_DEV ? devLogger : productionLogger;

// إعادة تصدير الأنواع
export type { ILogger, LogOptions, LogLevel, Severity, LogEntry };

// إعادة تصدير الـ loggers الفردية للاستخدام المباشر إذا لزم الأمر
export { devLogger } from './dev-logger';
export { productionLogger } from './production-logger';

// Helper function للتوافق مع الكود القديم
export function logAppError(error: Error | unknown, context?: string): void {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(message, error, { context, severity: 'medium' });
}

// تنظيف عند إغلاق الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (logger.cleanup) {
      logger.cleanup();
    } else if (logger.flush) {
      logger.flush();
    }
  });
}
