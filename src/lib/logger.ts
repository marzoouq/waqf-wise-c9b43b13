/**
 * نظام Logging موحد وآمن للتطبيق
 * يستبدل console.error ويوفر معالجة موحدة
 */

import { logError } from './errorService';
import type { AppError } from '@/types/errors';

export interface LogOptions {
  context?: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

/**
 * Logger موحد للتطبيق
 */
class Logger {
  /**
   * تسجيل خطأ
   */
  error(error: AppError, options?: LogOptions): void {
    // تسجيل في errorService
    logError(error, {
      operation: options?.context,
      userId: options?.userId,
      metadata: options?.metadata,
    });

    // Logging يتم في errorService
  }

  /**
   * تسجيل تحذير
   */
  warn(message: string, options?: LogOptions): void {
    // يمكن إضافة logging للتحذيرات لاحقاً
  }

  /**
   * تسجيل معلومة
   */
  info(message: string, options?: LogOptions): void {
    // يمكن إضافة logging للمعلومات لاحقاً
  }

  /**
   * تسجيل debug
   */
  debug(message: string, data?: unknown): void {
    // يمكن إضافة logging للتصحيح لاحقاً
  }
}

// Singleton instance
export const logger = new Logger();

/**
 * Helper للاستخدام السريع
 */
export function logAppError(error: AppError, context?: string): void {
  logger.error(error, { context, severity: 'medium' });
}
