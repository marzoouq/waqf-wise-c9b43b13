/**
 * Lazy loading with automatic retry mechanism
 * آلية تحميل كسول مع إعادة المحاولة التلقائية
 * 
 * Standard pattern used by Netflix, Airbnb, Spotify
 * https://web.dev/articles/code-splitting-with-dynamic-imports
 * 
 * @version 2.0.0 - إضافة cache busting وتحسين معالجة الأخطاء
 */

import React, { lazy, ComponentType } from 'react';
import { 
  getChunkErrorInfo, 
  logChunkError 
} from '@/lib/errors/chunk-error-handler';
import { clearAllCaches } from '@/lib/clearCache';

export interface LazyRetryOptions {
  retries?: number;
  interval?: number;
  onError?: (error: Error, attempt: number) => void;
  /** تفعيل cache busting عند فشل المحاولة الأولى */
  cacheBusting?: boolean;
}

const SESSION_KEY = 'chunk_load_failures';
const MAX_FAILURES_BEFORE_HARD_RELOAD = 3;
const VERSION_KEY = 'app_chunk_version';

/**
 * Get current failure count from session storage
 */
function getFailureCount(): number {
  try {
    return parseInt(sessionStorage.getItem(SESSION_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * Increment failure count in session storage
 */
function incrementFailureCount(): number {
  const count = getFailureCount() + 1;
  try {
    sessionStorage.setItem(SESSION_KEY, count.toString());
  } catch {
    // Ignore storage errors
  }
  return count;
}

/**
 * Reset failure count on successful load
 */
function resetFailureCount(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Force reload with cache bypass
 */
function forceReload(): void {
  // إضافة timestamp للـ URL لتجاوز الـ cache
  const url = new URL(window.location.href);
  url.searchParams.set('_cb', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * محاولة تنظيف cache الوحدات قبل إعادة المحاولة
 */
async function clearModuleCache(): Promise<void> {
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const modulesCaches = cacheNames.filter(name => 
        name.includes('workbox') || 
        name.includes('module') || 
        name.includes('chunk')
      );
      await Promise.all(modulesCaches.map(name => caches.delete(name)));
    }
  } catch {
    // تجاهل الأخطاء
  }
}

/**
 * Lazy load a component with automatic retry mechanism
 * 
 * @param componentImport - Dynamic import function
 * @param options - Retry options
 * @returns Lazy component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyRetryOptions = {}
): React.LazyExoticComponent<T> {
const {
    retries = 3,
    interval = 1500,
    onError,
    cacheBusting = true
  } = options;

  // ✅ v2.1.0: إضافة Jitter لتجنب thundering herd
  const getDelayWithJitter = (baseDelay: number): number => {
    const jitter = Math.random() * 0.3 * baseDelay; // 0-30% jitter
    return baseDelay + jitter;
  };

  return lazy(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // ✅ v2.0.0: تنظيف الـ cache قبل المحاولة الثانية
        if (attempt > 0 && cacheBusting) {
          await clearModuleCache();
        }
        
        const result = await componentImport();
        
        // Success - reset failure count
        resetFailureCount();
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Log using unified handler
        logChunkError(lastError, { 
          attempt: attempt + 1, 
          action: attempt === 0 ? 'initial' : 'retry' 
        });
        
        // Get error info for smart handling
        const errorInfo = getChunkErrorInfo(lastError);
        
        // Call custom error handler if provided
        if (onError) {
          onError(lastError, attempt + 1);
        }
        
        // ✅ v2.0.0: معالجة أفضل لحالة تحديث الإصدار
        if (errorInfo.shouldReload) {
          // تنظيف الـ cache قبل إعادة المحاولة
          await clearModuleCache();
          
          // إذا كانت المحاولة الأخيرة، أعد التحميل
          if (attempt === retries - 1) {
            break;
          }
        }
        
        // Don't wait after the last attempt
        if (attempt < retries - 1) {
          // Exponential backoff with jitter: ~1.5s, ~3s, ~4.5s
          const baseDelay = interval * (attempt + 1);
          const delay = getDelayWithJitter(baseDelay);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted - check if we should hard reload
    const failureCount = incrementFailureCount();
    
    if (import.meta.env.DEV) {
      console.error(`[LazyRetry] All ${retries} attempts failed. Total failures: ${failureCount}`);
    }
    
    if (failureCount >= MAX_FAILURES_BEFORE_HARD_RELOAD) {
      console.warn('[LazyRetry] Max failures reached. Clearing cache and reloading...');
      
      // Clear caches and reload
      await clearAllCaches();
      resetFailureCount();
      forceReload();
      
      // Return a dummy component while reloading
      return { default: ((): null => null) as unknown as T };
    }

    // Throw the last error to be caught by Error Boundary
    throw lastError || new Error('Failed to load component');
  });
}

/**
 * Lazy load a named export with automatic retry mechanism
 */
export function lazyWithRetryNamed<T extends ComponentType<unknown>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string,
  options: LazyRetryOptions = {}
): React.LazyExoticComponent<T> {
  return lazyWithRetry(
    () => importFn().then(module => ({ default: module[exportName] })),
    options
  );
}

/**
 * Create a lazy component with retry for a specific page
 * Convenience wrapper with sensible defaults
 */
export function lazyPage<T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazyWithRetry(importFn, {
    retries: 3,
    interval: 1500,
    onError: (error, attempt) => {
      const errorInfo = getChunkErrorInfo(error);
      console.warn(`Page load attempt ${attempt} failed:`, errorInfo.userMessage);
    }
  });
}

export default lazyWithRetry;
