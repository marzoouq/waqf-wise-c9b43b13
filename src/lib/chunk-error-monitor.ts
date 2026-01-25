/**
 * نظام مراقبة متقدم لأخطاء تحميل الـ Chunks
 * Advanced Chunk Error Monitoring System
 * 
 * يوفر:
 * - تتبع الأخطاء في الوقت الفعلي
 * - إحصائيات ومقاييس
 * - إرسال للـ Analytics (اختياري)
 * - تخزين محلي للتحليل
 * 
 * @version 1.0.0
 */

import { getChunkErrorInfo, type ChunkErrorInfo, type ChunkErrorType } from '@/lib/errors/chunk-error-handler';

// ============ Types ============

export interface ChunkErrorEvent {
  id: string;
  timestamp: number;
  error: ChunkErrorInfo;
  url: string;
  userAgent: string;
  retryCount: number;
  resolved: boolean;
  resolvedAt?: number;
  metadata?: Record<string, unknown>;
}

export interface ChunkErrorStats {
  totalErrors: number;
  resolvedErrors: number;
  errorsByType: Record<ChunkErrorType, number>;
  avgRetryCount: number;
  lastErrorAt: number | null;
  successRate: number;
}

export interface MonitorConfig {
  maxStoredErrors: number;
  enableAnalytics: boolean;
  enableLocalStorage: boolean;
  retentionDays: number;
}

// ============ Constants ============

const STORAGE_KEY = 'chunk_error_monitor';
const DEFAULT_CONFIG: MonitorConfig = {
  maxStoredErrors: 100,
  enableAnalytics: true,
  enableLocalStorage: true,
  retentionDays: 7,
};

// ============ Utility ============

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function cleanOldErrors(errors: ChunkErrorEvent[], retentionDays: number): ChunkErrorEvent[] {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return errors.filter(e => e.timestamp > cutoff);
}

// ============ Storage ============

function loadErrors(): ChunkErrorEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ChunkErrorEvent[];
  } catch {
    return [];
  }
}

function saveErrors(errors: ChunkErrorEvent[], config: MonitorConfig): void {
  if (!config.enableLocalStorage) return;
  
  try {
    // Clean old errors and limit size
    const cleaned = cleanOldErrors(errors, config.retentionDays);
    const limited = cleaned.slice(-config.maxStoredErrors);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
  } catch {
    // Storage full or unavailable - silently fail
  }
}

// ============ Analytics ============

function sendToAnalytics(event: ChunkErrorEvent, config: MonitorConfig): void {
  if (!config.enableAnalytics) return;
  
  // Integration with analytics services (if available)
  try {
    // Google Analytics 4
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'chunk_load_error', {
        error_type: event.error.type,
        error_message: event.error.message,
        retry_count: event.retryCount,
        url: event.url,
      });
    }
    
    // Custom event for Sentry (if available)
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      const Sentry = (window as { Sentry?: { captureMessage: (msg: string, options?: { extra?: Record<string, unknown>; tags?: Record<string, string> }) => void } }).Sentry;
      Sentry?.captureMessage(`Chunk Load Error: ${event.error.type}`, {
        extra: {
          errorInfo: event.error,
          retryCount: event.retryCount,
          url: event.url,
        },
        tags: {
          errorType: event.error.type,
        },
      });
    }
  } catch {
    // Analytics not available - silently fail
  }
}

// ============ Monitor Class ============

class ChunkErrorMonitor {
  private errors: ChunkErrorEvent[] = [];
  private config: MonitorConfig = DEFAULT_CONFIG;
  private initialized = false;

  /**
   * تهيئة المراقب مع الإعدادات
   */
  initialize(config: Partial<MonitorConfig> = {}): void {
    if (this.initialized) return;
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.errors = loadErrors();
    this.initialized = true;
    
    // Clean old errors on init
    this.errors = cleanOldErrors(this.errors, this.config.retentionDays);
    saveErrors(this.errors, this.config);
  }

  /**
   * تسجيل خطأ جديد
   */
  trackError(
    error: Error | unknown,
    metadata?: { component?: string; attempt?: number }
  ): ChunkErrorEvent {
    if (!this.initialized) this.initialize();
    
    const errorInfo = getChunkErrorInfo(error);
    
    const event: ChunkErrorEvent = {
      id: generateId(),
      timestamp: Date.now(),
      error: errorInfo,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      retryCount: metadata?.attempt || 0,
      resolved: false,
      metadata,
    };
    
    this.errors.push(event);
    saveErrors(this.errors, this.config);
    sendToAnalytics(event, this.config);
    
    // Console log in development
    if (import.meta.env.DEV) {
      console.warn(`[ChunkMonitor] Error tracked:`, event);
    }
    
    return event;
  }

  /**
   * تحديد خطأ كمحلول
   */
  markResolved(eventId: string): void {
    const event = this.errors.find(e => e.id === eventId);
    if (event) {
      event.resolved = true;
      event.resolvedAt = Date.now();
      saveErrors(this.errors, this.config);
    }
  }

  /**
   * الحصول على إحصائيات الأخطاء
   */
  getStats(): ChunkErrorStats {
    if (!this.initialized) this.initialize();
    
    const totalErrors = this.errors.length;
    const resolvedErrors = this.errors.filter(e => e.resolved).length;
    
    const errorsByType: Record<ChunkErrorType, number> = {
      network: 0,
      update: 0,
      server: 0,
      timeout: 0,
      unknown: 0,
    };
    
    let totalRetries = 0;
    let lastErrorAt: number | null = null;
    
    for (const error of this.errors) {
      errorsByType[error.error.type]++;
      totalRetries += error.retryCount;
      if (!lastErrorAt || error.timestamp > lastErrorAt) {
        lastErrorAt = error.timestamp;
      }
    }
    
    return {
      totalErrors,
      resolvedErrors,
      errorsByType,
      avgRetryCount: totalErrors > 0 ? totalRetries / totalErrors : 0,
      lastErrorAt,
      successRate: totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 100,
    };
  }

  /**
   * الحصول على آخر الأخطاء
   */
  getRecentErrors(limit = 10): ChunkErrorEvent[] {
    if (!this.initialized) this.initialize();
    return this.errors.slice(-limit).reverse();
  }

  /**
   * مسح جميع الأخطاء المسجلة
   */
  clearAll(): void {
    this.errors = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * تصدير الأخطاء للتحليل
   */
  exportForAnalysis(): string {
    if (!this.initialized) this.initialize();
    
    const report = {
      exportedAt: new Date().toISOString(),
      stats: this.getStats(),
      errors: this.errors,
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// ============ Singleton Export ============

export const chunkErrorMonitor = new ChunkErrorMonitor();

/**
 * تسجيل خطأ في المراقب (دالة مساعدة)
 */
export function trackChunkError(
  error: Error | unknown,
  metadata?: { component?: string; attempt?: number }
): ChunkErrorEvent {
  return chunkErrorMonitor.trackError(error, metadata);
}

/**
 * الحصول على إحصائيات الأخطاء (دالة مساعدة)
 */
export function getChunkErrorStats(): ChunkErrorStats {
  return chunkErrorMonitor.getStats();
}

export default chunkErrorMonitor;
