/**
 * نظام Logging موحد وآمن للتطبيق
 * يستبدل console.error ويوفر معالجة موحدة
 */

import { logError } from './errors';
import type { AppError } from '@/types/errors';

export interface LogOptions {
  context?: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

const IS_DEV = import.meta.env.DEV;

/**
 * Logger موحد للتطبيق
 */
class Logger {
  /**
   * تسجيل خطأ
   */
  error(error: unknown, options?: LogOptions): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // تسجيل في النظام الموحد
    logError(errorMessage, options?.severity || 'medium', {
      context: options?.context,
      userId: options?.userId,
      ...options?.metadata,
    });
  }

  /**
   * تحويل unknown error إلى AppError
   */
  private toAppError(error: unknown): AppError {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('Unknown error occurred');
  }

  /**
   * تسجيل تحذير
   */
  warn(message: string, options?: LogOptions): void {
    if (IS_DEV) {
      console.warn(`⚠️ ${message}`, options?.metadata);
    }
    
    // في الإنتاج، يمكن إرسال التحذيرات للسيرفر
    if (!IS_DEV && options?.severity === 'high') {
      this.sendToServer('warning', message, options);
    }
  }

  /**
   * تسجيل معلومة
   */
  info(message: string, options?: LogOptions): void {
    if (IS_DEV) {
      console.info(`ℹ️ ${message}`, options?.metadata);
    }
    
    // يمكن تفعيل info logging للإنتاج عند الحاجة
  }

  /**
   * تسجيل debug
   */
  debug(message: string, data?: unknown): void {
    if (IS_DEV) {
      console.debug(`🐛 ${message}`, data);
    }
  }

  /**
   * إرسال اللوج للسيرفر (للإنتاج)
   */
  private sendToServer(
    level: string,
    message: string,
    options?: LogOptions
  ): void {
    // يمكن تفعيل هذا لإرسال اللوجات للسيرفر
    // مثلاً باستخدام supabase.functions.invoke('log-message', { body: ... })
    if (!IS_DEV) {
      // TODO: Implement server-side logging when needed
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
