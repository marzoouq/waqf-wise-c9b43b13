import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function PushNotificationsSetup() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const { subscribe, unsubscribe } = usePushNotifications();

  useEffect(() => {
    // Check if push notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    if (!isSupported) {
      toast.error('المتصفح لا يدعم الإشعارات الفورية');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Register service worker and subscribe
        const registration = await navigator.serviceWorker.ready;
        
        // Generate VAPID keys or use existing ones
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            'YOUR_VAPID_PUBLIC_KEY' // يجب استبداله بالمفتاح الحقيقي
          )
        });

        // Save subscription to database
        await subscribe();

        setIsEnabled(true);
        toast.success('تم تفعيل الإشعارات الفورية بنجاح');
      } else {
        toast.error('تم رفض إذن الإشعارات');
      }
    } catch (error) {
      logger.error(error as Error, { context: 'PushNotifications.enable' });
      toast.error('فشل تفعيل الإشعارات الفورية');
    }
  };

  const handleDisable = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await unsubscribe();
      }

      setIsEnabled(false);
      toast.success('تم إيقاف الإشعارات الفورية');
    } catch (error) {
      logger.error(error as Error, { context: 'PushNotifications.disable' });
      toast.error('فشل إيقاف الإشعارات الفورية');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              الإشعارات الفورية
            </CardTitle>
            <CardDescription>
              استقبل إشعارات فورية على هذا الجهاز
            </CardDescription>
          </div>
          {permission === 'granted' && (
            <Badge variant="default" className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              مفعّل
            </Badge>
          )}
          {permission === 'denied' && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <X className="h-3 w-3" />
              محظور
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <div className="text-sm text-muted-foreground">
            المتصفح الحالي لا يدعم الإشعارات الفورية
          </div>
        ) : permission === 'denied' ? (
          <div className="text-sm text-muted-foreground">
            تم رفض إذن الإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>تفعيل الإشعارات الفورية</Label>
                <p className="text-sm text-muted-foreground">
                  احصل على تنبيهات فورية للأحداث المهمة
                </p>
              </div>
              <Switch
                checked={isEnabled || permission === 'granted'}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleEnable();
                  } else {
                    handleDisable();
                  }
                }}
              />
            </div>

            {(isEnabled || permission === 'granted') && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">ستتلقى إشعارات عن:</p>
                <ul className="text-sm space-y-1 text-muted-foreground mr-4">
                  <li>• طلبات جديدة تحتاج موافقتك</li>
                  <li>• تذاكر دعم تم تعيينها لك</li>
                  <li>• تحديثات على المعاملات المالية</li>
                  <li>• تنبيهات العقود والإيجارات</li>
                </ul>
              </div>
            )}

            {permission === 'default' && (
              <Button onClick={handleEnable} className="w-full">
                <Bell className="h-4 w-4 ms-2" />
                تفعيل الإشعارات الفورية
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}