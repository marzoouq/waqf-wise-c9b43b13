/**
 * نظام موحد لكشف ومعالجة أخطاء تحميل الـ Chunks
 * Unified Chunk Load Error Detection & Handling System
 * 
 * يحل محل التعريفات المتكررة في:
 * - LazyErrorBoundary
 * - GlobalErrorBoundary
 * - lazyWithRetry
 * - versionCheck
 */

export type ChunkErrorType = 'network' | 'update' | 'server' | 'timeout' | 'unknown';

export interface ChunkErrorInfo {
  type: ChunkErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  shouldReload: boolean;
}

const CHUNK_ERROR_PATTERNS = [
  'failed to fetch dynamically imported module',
  'loading chunk',
  'loading css chunk',
  'dynamically imported module',
  'failed to fetch',
  'chunkloaderror',
  'unexpected token',
  'syntax error',
  'network error',
  'load failed'
] as const;

/**
 * فحص موحد لأخطاء تحميل الـ Chunks
 * يدعم جميع أنواع الأخطاء المعروفة
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  
  // Handle Error objects
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    
    // Check error name first
    if (name === 'chunkloaderror') return true;
    
    // Check message patterns
    return CHUNK_ERROR_PATTERNS.some(pattern => msg.includes(pattern));
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    const msg = error.toLowerCase();
    return CHUNK_ERROR_PATTERNS.some(pattern => msg.includes(pattern));
  }
  
  // Handle objects with message property
  if (typeof error === 'object' && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === 'string') {
      return isChunkLoadError(errObj.message);
    }
  }
  
  return false;
}

/**
 * تحديد نوع خطأ الـ Chunk بدقة
 * لعرض رسالة مناسبة للمستخدم
 */
export function getChunkErrorType(error: unknown): ChunkErrorType {
  // Check network status first
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'network';
  }
  
  if (!(error instanceof Error)) {
    return 'unknown';
  }
  
  const msg = error.message.toLowerCase();
  
  // Network errors
  if (
    msg.includes('network error') ||
    msg.includes('failed to fetch') && !msg.includes('module') ||
    msg.includes('net::err')
  ) {
    return 'network';
  }
  
  // Server errors (404, 500, etc.)
  if (
    msg.includes('404') ||
    msg.includes('not found')
  ) {
    return 'update'; // 404 usually means new version deployed
  }
  
  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('internal server error')
  ) {
    return 'server';
  }
  
  // Timeout errors
  if (
    msg.includes('timeout') ||
    msg.includes('timed out') ||
    msg.includes('aborted')
  ) {
    return 'timeout';
  }
  
  // Default: likely a version mismatch (most common case)
  if (msg.includes('dynamically imported module') || msg.includes('loading chunk')) {
    return 'update';
  }
  
  return 'unknown';
}

/**
 * الحصول على معلومات تفصيلية عن الخطأ
 * بما في ذلك الرسالة المناسبة للمستخدم
 */
export function getChunkErrorInfo(error: unknown): ChunkErrorInfo {
  const type = getChunkErrorType(error);
  const originalMessage = error instanceof Error ? error.message : String(error);
  
  const errorInfoMap: Record<ChunkErrorType, Omit<ChunkErrorInfo, 'type' | 'message'>> = {
    network: {
      userMessage: 'تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
      canRetry: true,
      shouldReload: false
    },
    update: {
      userMessage: 'تم تحديث التطبيق. جاري إعادة التحميل...',
      canRetry: false,
      shouldReload: true
    },
    server: {
      userMessage: 'خطأ في الخادم. يرجى المحاولة لاحقاً',
      canRetry: true,
      shouldReload: false
    },
    timeout: {
      userMessage: 'انتهت مهلة التحميل. تحقق من سرعة الإنترنت',
      canRetry: true,
      shouldReload: false
    },
    unknown: {
      userMessage: 'حدث خطأ أثناء تحميل الصفحة',
      canRetry: true,
      shouldReload: false
    }
  };
  
  return {
    type,
    message: originalMessage,
    ...errorInfoMap[type]
  };
}

/**
 * تسجيل خطأ الـ Chunk للتشخيص
 */
export function logChunkError(
  error: unknown,
  context: {
    component?: string;
    attempt?: number;
    action?: 'initial' | 'retry' | 'reload';
  } = {}
): void {
  const errorInfo = getChunkErrorInfo(error);
  const timestamp = new Date().toISOString();
  
  // Store in session for debugging
  try {
    const logs = JSON.parse(sessionStorage.getItem('chunk_error_logs') || '[]');
    logs.push({
      timestamp,
      ...errorInfo,
      ...context
    });
    // Keep only last 10 errors
    sessionStorage.setItem('chunk_error_logs', JSON.stringify(logs.slice(-10)));
  } catch {
    // Ignore storage errors
  }
  
  // Console log in development
  if (import.meta.env.DEV) {
    console.group(`[ChunkError] ${errorInfo.type}`);
    console.log('Message:', errorInfo.message);
    console.log('User Message:', errorInfo.userMessage);
    console.log('Context:', context);
    console.log('Can Retry:', errorInfo.canRetry);
    console.log('Should Reload:', errorInfo.shouldReload);
    console.groupEnd();
  }
}

/**
 * الحصول على سجل أخطاء الـ Chunks
 */
export function getChunkErrorLogs(): Array<ChunkErrorInfo & { timestamp: string }> {
  try {
    return JSON.parse(sessionStorage.getItem('chunk_error_logs') || '[]');
  } catch {
    return [];
  }
}

/**
 * مسح سجل أخطاء الـ Chunks
 */
export function clearChunkErrorLogs(): void {
  try {
    sessionStorage.removeItem('chunk_error_logs');
  } catch {
    // Ignore storage errors
  }
}
