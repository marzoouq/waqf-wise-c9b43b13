/**
 * Development Logger - نظام Logging للتطوير
 * يوفر رسائل واضحة في الـ console مع icons
 */

import type { ILogger, LogOptions } from './types';

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

  error(message: string, error?: unknown, _options?: LogOptions): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
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
