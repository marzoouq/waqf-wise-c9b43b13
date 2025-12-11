import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { CheckCircle } from 'lucide-react';
import { fullServiceWorkerCleanup } from '@/lib/sw-cleanup';

/**
 * مكون تنظيف Service Workers و Workbox Caches
 * يقوم بحذف جميع SWs و caches عند التحميل
 * (PWA معطّل في هذا المشروع)
 */
export function UpdateNotifier() {
  const hasCleanedUp = useRef(false);

  useEffect(() => {
    // تنفيذ مرة واحدة فقط
    if (hasCleanedUp.current) return;
    hasCleanedUp.current = true;

    // تنظيف شامل لـ Service Workers و Caches
    fullServiceWorkerCleanup()
      .then(({ swUnregistered, cachesDeleted }) => {
        if (swUnregistered || cachesDeleted > 0) {
          if (import.meta.env.DEV) {
            console.log(`✅ تنظيف SW: ${swUnregistered ? 'نعم' : 'لا'}, Caches محذوفة: ${cachesDeleted}`);
          }
          
          // إظهار toast فقط إذا تم حذف شيء فعلياً
          if (cachesDeleted > 0) {
            toast.success('تم تنظيف الكاش القديم', {
              icon: <CheckCircle className="h-4 w-4" />,
              duration: 2000,
            });
          }
        }
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.error(err);
      });
  }, []);

  return null;
}
