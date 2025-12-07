/**
 * React Hook للإصلاح الذاتي
 * Self-Healing React Hook
 */

import { useCallback } from 'react';
import { selfHealing, fetchWithFallback, retryOperation } from '@/lib/selfHealing';
import { useToast } from '@/hooks/use-toast';

interface UseSelfHealingOptions {
  showToastOnFallback?: boolean;
  showToastOnRetry?: boolean;
}

/**
 * Hook لاستخدام ميزات الإصلاح الذاتي بسهولة في مكونات React
 */
export function useSelfHealing(options: UseSelfHealingOptions = {}) {
  const { toast } = useToast();

  /**
   * جلب بيانات مع استرجاع تلقائي من الـ Cache
   */
  const fetchWithRecovery = useCallback(
    async <T,>(
      cacheKey: string,
      fetchFn: () => Promise<T>,
      cacheTTL?: number
    ): Promise<T> => {
      try {
        const result = await selfHealing.fetch(cacheKey, fetchFn, { cacheTTL });

        if (result.fromCache && options.showToastOnFallback) {
          toast({
            title: '⚡ استخدام بيانات محفوظة',
            description: 'تعذر جلب البيانات الجديدة، يتم عرض آخر بيانات متاحة',
            variant: 'default',
          });
        }

        return result.data;
      } catch (error) {
        toast({
          title: '❌ فشل في جلب البيانات',
          description: 'تعذر جلب البيانات حتى من الذاكرة المؤقتة',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [toast, options.showToastOnFallback]
  );

  /**
   * تنفيذ عملية مع إعادة محاولة تلقائية
   */
  const executeWithRetry = useCallback(
    async <T,>(operation: () => Promise<T>, maxAttempts: number = 3): Promise<T> => {
      try {
        return await retryOperation(operation);
      } catch (error) {
        if (options.showToastOnRetry) {
          toast({
            title: '❌ فشلت العملية',
            description: `فشلت العملية بعد ${maxAttempts} محاولات`,
            variant: 'destructive',
          });
        }
        throw error;
      }
    },
    [toast, options.showToastOnRetry]
  );

  /**
   * مسح الـ Cache يدوياً
   */
  const clearCache = useCallback(() => {
    selfHealing.cache.clear();
    toast({
      title: '🗑️ تم مسح الذاكرة المؤقتة',
      description: 'تم حذف جميع البيانات المحفوظة',
    });
  }, [toast]);

  /**
   * إعادة الاتصال بقاعدة البيانات يدوياً
   */
  const reconnectDatabase = useCallback(async () => {
    toast({
      title: '🔄 جاري إعادة الاتصال...',
      description: 'محاولة إعادة الاتصال بقاعدة البيانات',
    });

    const success = await selfHealing.autoRecovery.reconnectDatabase();

    if (success) {
      toast({
        title: '✅ نجح الاتصال',
        description: 'تم إعادة الاتصال بقاعدة البيانات بنجاح',
      });
    } else {
      toast({
        title: '❌ فشل الاتصال',
        description: 'تعذر إعادة الاتصال بقاعدة البيانات',
        variant: 'destructive',
      });
    }

    return success;
  }, [toast]);

  /**
   * مزامنة البيانات المعلقة
   */
  const syncPendingData = useCallback(async () => {
    toast({
      title: '🔄 جاري المزامنة...',
      description: 'مزامنة البيانات المعلقة',
    });

    await selfHealing.autoRecovery.syncPendingData();

    toast({
      title: '✅ اكتملت المزامنة',
      description: 'تم مزامنة جميع البيانات المعلقة',
    });
  }, [toast]);

  return {
    fetchWithRecovery,
    executeWithRetry,
    clearCache,
    reconnectDatabase,
    syncPendingData,
    // الوصول المباشر للمديرين
    retryHandler: selfHealing.retryHandler,
    cache: selfHealing.cache,
    autoRecovery: selfHealing.autoRecovery,
    healthMonitor: selfHealing.healthMonitor,
  };
}
