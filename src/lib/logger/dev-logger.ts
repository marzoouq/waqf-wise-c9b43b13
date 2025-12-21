/**
 * Development Logger - نظام Logging للتطوير
 * يوفر رسائل واضحة في الـ console مع icons
 * يدعم نمطين من الاستخدام
 */

import type { ILogger, LogOptions } from './types';

/**
 * فحص إذا كان الـ object هو LogOptions
 */
function isLogOptions(obj: unknown): obj is LogOptions {
  if (!obj || typeof obj !== 'object') return false;
  const keys = Object.keys(obj);
  const validKeys = ['context', 'userId', 'severity', 'metadata'];
  return keys.some(key => validKeys.includes(key));
}

/**
 * استخراج رسالة من Error أو أي نوع آخر
 */
function extractMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'message' in value) {
    return String((value as { message: unknown }).message);
  }
  return String(value);
}

class DevLogger implements ILogger {
  debug(message: string, data?: unknown): void {
    console.debug(`🐛 ${message}`, data !== undefined ? data : '');
  }

  info(message: string, data?: unknown): void {
    console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
  }

  warn(message: string, data?: unknown, _options?: LogOptions): void {
    console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
  }

  /**
   * تسجيل خطأ - يدعم نمطين:
   * - النمط الجديد: error('message', errorObject, options)
   * - النمط القديم: error(errorObject, options)
   */
  error(
    messageOrError: string | Error | unknown,
    errorOrOptions?: unknown | LogOptions,
    _options?: LogOptions
  ): void {
    let message: string;
    let errorData: unknown;

    // فحص النمط المستخدم
    if (typeof messageOrError === 'string') {
      // النمط الجديد: error('message', error, options)
      message = messageOrError;
      if (errorOrOptions instanceof Error) {
        errorData = { message: errorOrOptions.message, stack: errorOrOptions.stack, name: errorOrOptions.name };
      } else if (errorOrOptions && !isLogOptions(errorOrOptions)) {
        errorData = errorOrOptions;
      }
    } else {
      // النمط القديم: error(error, options)
      message = extractMessage(messageOrError);
      if (messageOrError instanceof Error) {
        errorData = { message: messageOrError.message, stack: messageOrError.stack, name: messageOrError.name };
      } else {
        errorData = messageOrError;
      }
    }

    console.error(`❌ ${message}`, errorData !== undefined ? errorData : '');
  }

  success(message: string, data?: unknown): void {
    console.log(`✅ ${message}`, data !== undefined ? data : '');
  }

  flush(): void {
    // لا شيء للإرسال في بيئة التطوير
  }

  cleanup(): void {
    // لا شيء للتنظيف في بيئة التطوير
  }
}

export const devLogger = new DevLogger();
