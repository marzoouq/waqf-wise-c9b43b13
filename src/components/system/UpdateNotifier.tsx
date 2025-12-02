import { useEffect, useCallback, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/version';
import { handleSWRegistrationError, cleanupOldServiceWorkers } from '@/lib/sw-cleanup';

/**
 * مكون إشعار التحديثات - يظهر إشعار عند توفر تحديث جديد
 * ويقوم بتحديث تلقائي بعد فترة قصيرة
 */
export function UpdateNotifier() {
  const [pwaAvailable, setPwaAvailable] = useState(true);
  
  // فحص توفر PWA عند التحميل
  useEffect(() => {
    fetch('/sw.js', { method: 'HEAD', cache: 'no-store' })
      .then(res => {
        if (!res.ok) {
          setPwaAvailable(false);
          cleanupOldServiceWorkers();
        }
      })
      .catch(() => {
        setPwaAvailable(false);
        cleanupOldServiceWorkers();
      });
  }, []);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // فحص التحديثات كل دقيقة
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onNeedRefresh() {
      // سيتم التعامل معه في useEffect
    },
    onOfflineReady() {
      toast.success('التطبيق جاهز للعمل بدون اتصال', {
        icon: <Download className="h-4 w-4" />,
        duration: 3000,
      });
    },
    async onRegisterError(error) {
      console.error('❌ فشل تسجيل Service Worker:', error);
      
      // معالجة خطأ "Not found"
      const handled = await handleSWRegistrationError(error);
      
      if (handled) {
        // تم تنظيف SW القديم، لا داعي لإظهار خطأ
        toast.info('تم تنظيف الكاش القديم. التطبيق يعمل بشكل طبيعي.', {
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 4000,
        });
        setPwaAvailable(false);
      } else {
        toast.error('حدث خطأ في تحميل التحديثات. جرب تحديث الصفحة.', {
          duration: 5000,
        });
      }
    },
  });

  const handleUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  // عرض إشعار التحديث وتحديث تلقائي بعد 5 ثواني
  useEffect(() => {
    if (needRefresh && pwaAvailable) {
      // إظهار إشعار
      const toastId = toast.info(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="font-medium">يوجد تحديث جديد ({APP_VERSION})</span>
          </div>
          <p className="text-sm text-muted-foreground">
            سيتم التحديث تلقائياً خلال 5 ثواني...
          </p>
          <Button 
            size="sm" 
            onClick={() => {
              toast.dismiss(toastId);
              handleUpdate();
            }}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث الآن
          </Button>
        </div>,
        { 
          duration: 10000,
          id: 'pwa-update',
        }
      );

      // تحديث تلقائي بعد 5 ثواني
      const timer = setTimeout(() => {
        toast.dismiss(toastId);
        handleUpdate();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [needRefresh, handleUpdate, pwaAvailable]);

  return null;
}
