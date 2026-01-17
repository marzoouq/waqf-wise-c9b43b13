/**
 * Retry Helper - مساعد إعادة المحاولة
 * يوفر آلية retry مع exponential backoff للاستعلامات
 * 
 * @version 1.0.0
 */

import { productionLogger } from "@/lib/logger/production-logger";

export interface RetryOptions {
  /** عدد المحاولات القصوى */
  maxRetries?: number;
  /** التأخير الأولي بالميلي ثانية */
  initialDelay?: number;
  /** معامل الضرب للتأخير (exponential backoff) */
  backoffMultiplier?: number;
  /** الحد الأقصى للتأخير بالميلي ثانية */
  maxDelay?: number;
  /** دالة للتحقق من إمكانية إعادة المحاولة */
  shouldRetry?: (error: Error) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  shouldRetry: (error: Error) => {
    // إعادة المحاولة فقط لأخطاء الشبكة أو أخطاء الخادم
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    );
  },
};

/**
 * تأخير التنفيذ
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تنفيذ دالة مع إعادة المحاولة
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;
  let currentDelay = opts.initialDelay;

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      const isLastAttempt = attempt === opts.maxRetries;
      const canRetry = opts.shouldRetry(lastError);
      
      if (isLastAttempt || !canRetry) {
        productionLogger.error(`[Retry] فشلت جميع المحاولات (${attempt}/${opts.maxRetries})`, {
          error: lastError.message,
          canRetry,
        });
        throw lastError;
      }
      
      productionLogger.warn(`[Retry] المحاولة ${attempt} فشلت، إعادة بعد ${currentDelay}ms`, {
        error: lastError.message,
        nextAttempt: attempt + 1,
      });
      
      await delay(currentDelay);
      currentDelay = Math.min(currentDelay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError!;
}

/**
 * دالة مساعدة لإنشاء دالة مع retry
 */
export function createRetryWrapper<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  options: RetryOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>) => {
    return withRetry(() => fn(...args), options);
  };
}

/**
 * خيارات retry محسّنة للـ Supabase
 */
export const SUPABASE_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelay: 500,
  backoffMultiplier: 2,
  maxDelay: 5000,
  shouldRetry: (error: Error) => {
    const message = error.message.toLowerCase();
    // لا نعيد المحاولة لأخطاء RLS أو أخطاء المصادقة
    if (message.includes('rls') || message.includes('permission') || message.includes('401')) {
      return false;
    }
    return (
      message.includes('failed to fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('pgrst') ||
      message.includes('connection')
    );
  },
};
