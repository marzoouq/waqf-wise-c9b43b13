/**
 * Network Utilities - أدوات الشبكة والاتصال
 * 
 * يشمل:
 * - Retry Logic مع Exponential Backoff
 * - Optimistic Updates
 * - Offline Queue
 * - Network Status Detection
 * 
 * @version 1.0.0
 */

import { productionLogger } from '@/lib/logger/production-logger';

// ============================================
// 1. Network Status Detection
// ============================================

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: 'wifi' | 'cellular' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  effectiveType: string;
  downlink: number; // Mbps
  rtt: number; // Round Trip Time in ms
  saveData: boolean;
}

/**
 * الحصول على معلومات الاتصال الحالية
 */
export function getNetworkInfo(): NetworkStatus {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  
  // Network Information API (إذا كانت متاحة)
  const connection = (navigator as Navigator & {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
      type?: string;
    };
  }).connection;

  const effectiveType = connection?.effectiveType || 'unknown';
  const isSlowConnection = ['slow-2g', '2g', '3g'].includes(effectiveType);

  return {
    isOnline: online,
    isSlowConnection,
    connectionType: (connection?.type as NetworkStatus['connectionType']) || 'unknown',
    effectiveType,
    downlink: connection?.downlink || 10, // افتراضي 10 Mbps
    rtt: connection?.rtt || 100, // افتراضي 100ms
    saveData: connection?.saveData || false,
  };
}

/**
 * التحقق مما إذا كان يجب تأجيل العمليات الثقيلة
 */
export function shouldDeferHeavyOperations(): boolean {
  const { isSlowConnection, saveData } = getNetworkInfo();
  return isSlowConnection || saveData;
}

// ============================================
// 2. Retry Logic with Exponential Backoff
// ============================================

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  shouldRetry: (error) => {
    // إعادة المحاولة فقط لأخطاء الشبكة وأخطاء الخادم
    if (error.message.includes('network') || error.message.includes('fetch')) return true;
    if (error.message.includes('500') || error.message.includes('503')) return true;
    if (error.message.includes('timeout')) return true;
    return false;
  },
  onRetry: () => {},
};

/**
 * تنفيذ طلب مع إعادة المحاولة
 */
export async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fetcher();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // التحقق مما إذا كان يجب إعادة المحاولة
      if (attempt >= opts.maxRetries || !opts.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // حساب وقت الانتظار (Exponential Backoff)
      const delay = Math.min(
        opts.baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        opts.maxDelay
      );

      opts.onRetry(lastError, attempt);
      productionLogger.warn(`Retry attempt ${attempt + 1}/${opts.maxRetries}`, { delay, error: lastError.message });

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * دالة مساعدة للانتظار
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 3. Offline Queue
// ============================================

interface QueuedAction {
  id: string;
  action: () => Promise<void>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class OfflineQueueManager {
  private queue: QueuedAction[] = [];
  private isProcessing = false;
  private readonly STORAGE_KEY = 'offline_queue_meta';

  constructor() {
    if (typeof window !== 'undefined') {
      // الاستماع لحالة الاتصال
      window.addEventListener('online', () => this.processQueue());
      
      // تحميل البيانات المحفوظة (metadata فقط - الإجراءات لا يمكن حفظها)
      this.loadQueueMeta();
    }
  }

  /**
   * إضافة إجراء للقائمة
   */
  enqueue(action: () => Promise<void>, maxRetries = 3): string {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.queue.push({
      id,
      action,
      timestamp: Date.now(),
      retries: 0,
      maxRetries,
    });

    this.saveQueueMeta();
    
    // محاولة المعالجة إذا كنا متصلين
    if (navigator.onLine) {
      this.processQueue();
    }

    return id;
  }

  /**
   * إزالة إجراء من القائمة
   */
  dequeue(id: string): boolean {
    const index = this.queue.findIndex(item => item.id === id);
    if (index > -1) {
      this.queue.splice(index, 1);
      this.saveQueueMeta();
      return true;
    }
    return false;
  }

  /**
   * معالجة القائمة
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0 || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    productionLogger.info(`Processing offline queue: ${this.queue.length} items`);

    const itemsToProcess = [...this.queue];
    const failedItems: QueuedAction[] = [];

    for (const item of itemsToProcess) {
      try {
        await item.action();
        this.dequeue(item.id);
      } catch (error) {
        item.retries++;
        
        if (item.retries >= item.maxRetries) {
          productionLogger.error(`Offline action failed after ${item.maxRetries} retries`, { id: item.id, error });
          this.dequeue(item.id);
        } else {
          failedItems.push(item);
        }
      }
    }

    this.isProcessing = false;
    this.saveQueueMeta();

    // إذا كانت هناك عناصر فاشلة، حاول مرة أخرى بعد تأخير
    if (failedItems.length > 0 && navigator.onLine) {
      setTimeout(() => this.processQueue(), 5000);
    }
  }

  /**
   * الحصول على حجم القائمة
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * مسح القائمة
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueueMeta();
  }

  /**
   * حفظ metadata للقائمة
   */
  private saveQueueMeta(): void {
    if (typeof window !== 'undefined') {
      const meta = this.queue.map(({ id, timestamp, retries, maxRetries }) => ({
        id, timestamp, retries, maxRetries
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(meta));
    }
  }

  /**
   * تحميل metadata للقائمة
   */
  private loadQueueMeta(): void {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          // نحتفظ فقط بـ metadata - الإجراءات الفعلية ضائعة
          productionLogger.info('Loaded offline queue metadata');
        }
      } catch {
        // تجاهل أخطاء التحميل
      }
    }
  }
}

// Instance واحد للتطبيق
export const offlineQueue = new OfflineQueueManager();

// ============================================
// 4. React Hooks
// ============================================

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook لمراقبة حالة الشبكة
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkInfo);

  useEffect(() => {
    const updateStatus = () => setStatus(getNetworkInfo());

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // مراقبة تغييرات الاتصال
    const connection = (navigator as Navigator & {
      connection?: EventTarget & { addEventListener: (type: string, listener: EventListener) => void };
    }).connection;
    
    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return status;
}

/**
 * Hook للـ Optimistic Updates
 */
export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onOptimisticUpdate: (variables: TVariables) => void;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onRollback: (variables: TVariables) => void;
    offlineSupport?: boolean;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const rollbackRef = useRef<(() => void) | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    setIsPending(true);
    setError(null);

    // تطبيق التحديث المتفائل فوراً
    options.onOptimisticUpdate(variables);
    rollbackRef.current = () => options.onRollback(variables);

    // التحقق من الاتصال
    if (!navigator.onLine && options.offlineSupport) {
      // إضافة للقائمة غير المتصلة
      offlineQueue.enqueue(async () => {
        await mutationFn(variables);
      });
      setIsPending(false);
      return;
    }

    try {
      const data = await fetchWithRetry(() => mutationFn(variables));
      options.onSuccess?.(data, variables);
      rollbackRef.current = null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      // التراجع عن التحديث المتفائل
      options.onRollback(variables);
      options.onError?.(error, variables);
      rollbackRef.current = null;
    } finally {
      setIsPending(false);
    }
  }, [mutationFn, options]);

  const rollback = useCallback(() => {
    if (rollbackRef.current) {
      rollbackRef.current();
      rollbackRef.current = null;
    }
  }, []);

  return { mutate, isPending, error, rollback };
}

/**
 * Hook لمراقبة Offline Queue
 */
export function useOfflineQueue() {
  const [queueLength, setQueueLength] = useState(offlineQueue.getQueueLength);

  useEffect(() => {
    const interval = setInterval(() => {
      setQueueLength(offlineQueue.getQueueLength());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    queueLength,
    clearQueue: () => offlineQueue.clearQueue(),
    processQueue: () => offlineQueue.processQueue(),
  };
}

// ============================================
// 5. Error Recovery Helpers
// ============================================

/**
 * أنواع الأخطاء الشائعة
 */
export type NetworkErrorType = 
  | 'connection_lost'
  | 'timeout'
  | 'server_error'
  | 'rate_limited'
  | 'unauthorized'
  | 'not_found'
  | 'unknown';

/**
 * تحديد نوع الخطأ
 */
export function classifyNetworkError(error: Error): NetworkErrorType {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'connection_lost';
  }
  if (message.includes('timeout') || message.includes('aborted')) {
    return 'timeout';
  }
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return 'server_error';
  }
  if (message.includes('429') || message.includes('rate')) {
    return 'rate_limited';
  }
  if (message.includes('401') || message.includes('unauthorized')) {
    return 'unauthorized';
  }
  if (message.includes('404') || message.includes('not found')) {
    return 'not_found';
  }
  
  return 'unknown';
}

/**
 * الحصول على رسالة الخطأ المناسبة
 */
export function getErrorMessage(errorType: NetworkErrorType): string {
  const messages: Record<NetworkErrorType, string> = {
    connection_lost: 'تعذر الاتصال. تحقق من اتصالك بالإنترنت.',
    timeout: 'انتهت مهلة الاتصال. حاول مرة أخرى.',
    server_error: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.',
    rate_limited: 'تم تجاوز الحد المسموح. انتظر قليلاً ثم حاول مرة أخرى.',
    unauthorized: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.',
    not_found: 'لم يتم العثور على البيانات المطلوبة.',
    unknown: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  };
  
  return messages[errorType];
}

/**
 * التحقق مما إذا كان الخطأ قابلاً لإعادة المحاولة
 */
export function isRetryableError(errorType: NetworkErrorType): boolean {
  return ['connection_lost', 'timeout', 'server_error'].includes(errorType);
}
