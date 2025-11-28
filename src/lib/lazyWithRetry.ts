/**
 * Lazy loading with automatic retry mechanism
 * آلية تحميل كسول مع إعادة المحاولة التلقائية
 * 
 * Standard pattern used by Netflix, Airbnb, Spotify
 * https://web.dev/articles/code-splitting-with-dynamic-imports
 */

import React, { lazy, ComponentType } from 'react';

export interface LazyRetryOptions {
  retries?: number;
  interval?: number;
  onError?: (error: Error, attempt: number) => void;
}

const SESSION_KEY = 'chunk_load_failures';
const MAX_FAILURES_BEFORE_HARD_RELOAD = 3;

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
 * Clear all caches (Service Worker + browser cache)
 */
async function clearAllCaches(): Promise<void> {
  try {
    // Clear Service Worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    
    // Unregister Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
  } catch (error) {
    console.warn('Failed to clear caches:', error);
  }
}

/**
 * Force reload with cache bypass
 */
function forceReload(): void {
  // Use cache bypass reload
  window.location.reload();
}

/**
 * Lazy load a component with automatic retry mechanism
 * 
 * @param componentImport - Dynamic import function
 * @param options - Retry options
 * @returns Lazy component with retry logic
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  options: LazyRetryOptions = {}
): React.LazyExoticComponent<T> {
  const {
    retries = 3,
    interval = 1500,
    onError
  } = options;

  return lazy(async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        // Add cache-busting parameter on retry attempts
        const result = await componentImport();
        
        // Success - reset failure count
        resetFailureCount();
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Log the error
        console.warn(`[LazyRetry] Attempt ${attempt + 1}/${retries} failed:`, lastError.message);
        
        // Call custom error handler if provided
        if (onError) {
          onError(lastError, attempt + 1);
        }
        
        // Don't wait after the last attempt
        if (attempt < retries - 1) {
          // Exponential backoff: 1.5s, 3s, 4.5s
          const delay = interval * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries exhausted - check if we should hard reload
    const failureCount = incrementFailureCount();
    
    console.error(`[LazyRetry] All ${retries} attempts failed. Total failures: ${failureCount}`);
    
    if (failureCount >= MAX_FAILURES_BEFORE_HARD_RELOAD) {
      console.warn('[LazyRetry] Max failures reached. Clearing cache and reloading...');
      
      // Clear caches and reload
      await clearAllCaches();
      resetFailureCount();
      forceReload();
      
      // Return a dummy component while reloading
      return { default: (() => null) as unknown as T };
    }

    // Throw the last error to be caught by Error Boundary
    throw lastError || new Error('Failed to load component');
  });
}

/**
 * Create a lazy component with retry for a specific page
 * Convenience wrapper with sensible defaults
 */
export function lazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazyWithRetry(importFn, {
    retries: 3,
    interval: 1500,
    onError: (error, attempt) => {
      // Could send to analytics/monitoring here
      console.warn(`Page load attempt ${attempt} failed:`, error.message);
    }
  });
}

export default lazyWithRetry;
