/**
 * Query Invalidation Manager - مدير إبطال الاستعلامات
 * يجمع ويؤخر طلبات الإبطال لمنع الحلقات المفرغة
 * @version 1.0.0
 */

import type { QueryClient } from '@tanstack/react-query';

class QueryInvalidationManager {
  private static instance: QueryInvalidationManager;
  private pendingInvalidations: Set<string> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private queryClient: QueryClient | null = null;
  private readonly DEBOUNCE_MS = 100;
  private isProcessing = false;

  private constructor() {
    // Singleton
  }

  static getInstance(): QueryInvalidationManager {
    if (!this.instance) {
      this.instance = new QueryInvalidationManager();
    }
    return this.instance;
  }

  /**
   * تعيين QueryClient - يجب استدعاؤها مرة واحدة عند بدء التطبيق
   */
  setQueryClient(client: QueryClient): void {
    this.queryClient = client;
  }

  /**
   * إضافة طلب إبطال للقائمة (مع debounce)
   */
  invalidate(queryKey: readonly unknown[]): void {
    if (!this.queryClient) {
      console.warn('[QueryInvalidationManager] QueryClient not set. Call setQueryClient() first.');
      return;
    }

    const key = JSON.stringify(queryKey);
    
    // منع الإبطال المتكرر لنفس المفتاح
    if (this.pendingInvalidations.has(key)) {
      return;
    }

    this.pendingInvalidations.add(key);

    // إعادة ضبط المؤقت
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.flushInvalidations();
    }, this.DEBOUNCE_MS);
  }

  /**
   * إضافة عدة مفاتيح للإبطال دفعة واحدة
   */
  invalidateMultiple(queryKeys: (readonly unknown[])[]): void {
    queryKeys.forEach(key => this.invalidate(key));
  }

  /**
   * تنفيذ جميع طلبات الإبطال المعلقة
   */
  private flushInvalidations(): void {
    if (!this.queryClient || this.isProcessing) return;
    
    this.isProcessing = true;
    const count = this.pendingInvalidations.size;

    if (import.meta.env.DEV && count > 0) {
      console.log(`[QueryInvalidationManager] Flushing ${count} invalidations`);
    }

    // تنفيذ الإبطالات
    this.pendingInvalidations.forEach(keyStr => {
      try {
        const queryKey = JSON.parse(keyStr);
        this.queryClient!.invalidateQueries({ queryKey });
      } catch (error) {
        console.error('[QueryInvalidationManager] Failed to invalidate:', error);
      }
    });

    this.pendingInvalidations.clear();
    this.isProcessing = false;
  }

  /**
   * إبطال فوري بدون debounce (للحالات الطارئة)
   */
  invalidateImmediate(queryKey: readonly unknown[]): void {
    if (!this.queryClient) return;
    this.queryClient.invalidateQueries({ queryKey });
  }

  /**
   * الحصول على عدد الإبطالات المعلقة
   */
  getPendingCount(): number {
    return this.pendingInvalidations.size;
  }

  /**
   * مسح جميع الإبطالات المعلقة بدون تنفيذها
   */
  clearPending(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingInvalidations.clear();
  }
}

export const queryInvalidationManager = QueryInvalidationManager.getInstance();
