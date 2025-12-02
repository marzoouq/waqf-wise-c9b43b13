import { useEffect, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from 'sonner';
import { RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_VERSION } from '@/lib/version';

/**
 * مكون إشعار التحديثات - يظهر إشعار عند توفر تحديث جديد
 * ويقوم بتحديث تلقائي بعد فترة قصيرة
 */
export function UpdateNotifier() {
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
    onRegisterError(error) {
      console.error('❌ فشل تسجيل Service Worker:', error);
      toast.error('حدث خطأ في تحميل التحديثات. جرب تحديث الصفحة.', {
        duration: 5000,
      });
    },
  });

  const handleUpdate = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  // عرض إشعار التحديث وتحديث تلقائي بعد 5 ثواني
  useEffect(() => {
    if (needRefresh) {
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
  }, [needRefresh, handleUpdate]);

  return null;
}
