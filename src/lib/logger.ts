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

    // في التطوير: عرض في Console
    if (import.meta.env.DEV) {
      console.group(`🔴 Error ${options?.context ? `[${options.context}]` : ''}`);
      console.error(error);
      if (options?.metadata) {
        console.log('Metadata:', options.metadata);
      }
      console.groupEnd();
    }
  }

  /**
   * تسجيل تحذير
   */
  warn(message: string, options?: LogOptions): void {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ ${options?.context ? `[${options.context}]` : ''} ${message}`);
    }
  }

  /**
   * تسجيل معلومة
   */
  info(message: string, options?: LogOptions): void {
    if (import.meta.env.DEV) {
      console.log(`ℹ️ ${options?.context ? `[${options.context}]` : ''} ${message}`);
    }
  }

  /**
   * تسجيل debug
   */
  debug(message: string, data?: unknown): void {
    if (import.meta.env.DEV) {
      console.debug(`🐛 ${message}`, data);
    }
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
