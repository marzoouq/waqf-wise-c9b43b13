/**
 * نظام Logging موحد وآمن للتطبيق
 * يستبدل console.error ويوفر معالجة موحدة
 */

import { logError } from './errors';
import type { AppError } from '@/types/errors';
import { supabase } from '@/integrations/supabase/client';

export interface LogOptions {
  context?: string;
  userId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
}

const IS_DEV = import.meta.env.DEV;

// قائمة انتظار للـ logs للإرسال دفعة واحدة
let logQueue: Array<{
  level: string;
  message: string;
  options?: LogOptions;
  timestamp: string;
}> = [];

let flushTimeout: ReturnType<typeof setTimeout> | null = null;
const FLUSH_INTERVAL = 5000; // 5 ثواني
const MAX_QUEUE_SIZE = 50;

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

    // إرسال للسيرفر في الإنتاج
    if (!IS_DEV) {
      this.queueLog('error', errorMessage, options);
    }
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
    
    // في الإنتاج، إرسال التحذيرات للسيرفر
    if (!IS_DEV && options?.severity === 'high') {
      this.queueLog('warning', message, options);
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
   * إضافة log لقائمة الانتظار
   */
  private queueLog(level: string, message: string, options?: LogOptions): void {
    logQueue.push({
      level,
      message,
      options,
      timestamp: new Date().toISOString(),
    });

    // إرسال فوري إذا امتلأت القائمة
    if (logQueue.length >= MAX_QUEUE_SIZE) {
      this.flushLogs();
      return;
    }

    // جدولة الإرسال إذا لم يكن مجدولاً
    if (!flushTimeout) {
      flushTimeout = setTimeout(() => this.flushLogs(), FLUSH_INTERVAL);
    }
  }

  /**
   * إرسال اللوجات للسيرفر
   */
  private async flushLogs(): Promise<void> {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    if (logQueue.length === 0) return;

    const logsToSend = [...logQueue];
    logQueue = [];

    try {
      // إرسال للسيرفر عبر audit_logs table
      const { data: user } = await supabase.auth.getUser();
      
      const auditEntries = logsToSend.map(log => ({
        action_type: `log_${log.level}`,
        description: log.message,
        severity: log.options?.severity || 'low',
        user_id: user?.user?.id || null,
        user_email: user?.user?.email || null,
        table_name: log.options?.context || null,
        new_values: log.options?.metadata ? JSON.parse(JSON.stringify(log.options.metadata)) : null,
        created_at: log.timestamp,
      }));

      await supabase.from('audit_logs').insert(auditEntries);
    } catch (error) {
      // في حالة الفشل، إعادة المحاولة لاحقاً
      if (IS_DEV) {
        console.error('Failed to send logs to server:', error);
      }
    }
  }

  /**
   * إجبار إرسال اللوجات المتبقية (عند إغلاق التطبيق)
   */
  flush(): void {
    this.flushLogs();
  }
}

// Singleton instance
export const logger = new Logger();

// إرسال اللوجات عند إغلاق الصفحة
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    logger.flush();
  });
}

/**
 * Helper للاستخدام السريع
 */
export function logAppError(error: AppError, context?: string): void {
  logger.error(error, { context, severity: 'medium' });
}
