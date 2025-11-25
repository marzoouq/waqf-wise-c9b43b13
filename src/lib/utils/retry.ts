/**
 * Retry mechanism with exponential backoff
 * يوفر آلية إعادة المحاولة مع تأخير تصاعدي
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * تنفيذ عملية مع إعادة المحاولة التلقائية
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've exhausted attempts
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Check if we should retry this error
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt),
        maxDelay
      );
      
      // Add jitter (random variation) to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * تحقق من نوع الخطأ للقرار هل يجب إعادة المحاولة
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  
  // PostgrestError from Supabase
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    // Retry on timeout and connection errors
    return ['PGRST301', '08000', '08003', '08006'].includes(code);
  }
  
  return false;
}
