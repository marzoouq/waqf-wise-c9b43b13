/**
 * Lazy Loading with Retry
 * مساعد للتحميل الديناميكي مع إعادة المحاولة عند فشل الشبكة
 * @version 1.0.0
 */

import { ComponentType, lazy } from 'react';
import { logChunkError } from './errors/chunk-error-handler';

interface LazyWithRetryOptions {
  retries?: number;
  delay?: number;
  onError?: (error: Error, attempt: number) => void;
}

/**
 * تغليف lazy import مع إعادة المحاولة التلقائية
 * يحل مشكلة "Failed to fetch dynamically imported module" على الشبكات البطيئة
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyWithRetryOptions = {}
): React.LazyExoticComponent<T> {
  const { retries = 3, delay = 1000, onError } = options;

  return lazy(async () => {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await componentImport();
      } catch (error) {
        lastError = error as Error;
        
        // Log the error
        await logChunkError(error, { 
          attempt, 
          action: attempt === 1 ? 'initial' : 'retry' 
        });
        
        // Call custom error handler if provided
        onError?.(lastError, attempt);

        // If not the last attempt, wait before retrying
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 3s...
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    // All retries failed - throw the last error
    throw lastError;
  });
}

/**
 * نسخة خاصة للمكونات المُصدّرة بأسماء (named exports)
 */
export function lazyWithRetryNamed<T extends ComponentType<unknown>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string,
  options: LazyWithRetryOptions = {}
): React.LazyExoticComponent<T> {
  return lazyWithRetry(
    () => importFn().then(module => ({ default: module[exportName] })),
    options
  );
}
