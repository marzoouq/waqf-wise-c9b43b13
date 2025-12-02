import { useEffect } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { unregisterAllServiceWorkers } from '@/lib/sw-cleanup';

/**
 * مكون تنظيف Service Workers القديمة
 * يقوم بحذف جميع Service Workers عند التحميل
 * (PWA معطّل في هذا المشروع)
 */
export function UpdateNotifier() {
  useEffect(() => {
    // حذف جميع Service Workers القديمة
    unregisterAllServiceWorkers()
      .then(wasUnregistered => {
        if (wasUnregistered) {
          console.log('✅ تم حذف Service Workers القديمة بنجاح');
          toast.info('تم تنظيف الكاش القديم. التطبيق محدّث.', {
            icon: <AlertTriangle className="h-4 w-4" />,
            duration: 3000,
          });
        }
      })
      .catch(console.error);
  }, []);

  return null;
}
