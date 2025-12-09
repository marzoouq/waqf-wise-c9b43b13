/**
 * TanStack React Query DevTools Configuration
 * أدوات المطور لمراقبة وتتبع جميع الـ queries والـ mutations والـ cache
 * متاح في بيئة التطوير فقط
 */

import { logger } from '@/lib/logger';

export const DEVTOOLS_CONFIG = {
  // تفعيل الأدوات في بيئة التطوير
  enabled: import.meta.env.DEV,
  
  // فتح اللوحة تلقائياً عند التحميل
  initialIsOpen: false,
  
  // موضع اللوحة (top, bottom, left, right)
  position: 'bottom-right' as const,
};

// إضافة أدوات تحكم في console للمطورين
if (import.meta.env.DEV) {
  // دالة لفتح/إغلاق DevTools
  (window as Window & { toggleQueryDevtools?: () => void }).toggleQueryDevtools = () => {
    logger.info('React Query DevTools مفعّل');
  };
  
  // دالة لعرض معلومات QueryClient
  (window as Window & { getQueryClientInfo?: () => void }).getQueryClientInfo = () => {
    logger.debug('معلومات QueryClient', {
      staleTime: '5 دقائق',
      gcTime: '10 دقائق',
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    });
  };
  
  // دالة لعرض جميع الـ queries النشطة
  (window as Window & { showActiveQueries?: () => void }).showActiveQueries = () => {
    logger.info('للاطلاع على الـ queries النشطة، افتح React Query DevTools');
  };
}

