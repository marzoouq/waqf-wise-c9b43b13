import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: 'غير مدعوم',
        description: 'المتصفح لا يدعم الإشعارات الفورية',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: 'تم التفعيل',
          description: 'تم تفعيل الإشعارات الفورية بنجاح',
        });
        return true;
      } else {
        toast({
          title: 'تم الرفض',
          description: 'يرجى السماح بالإشعارات من إعدادات المتصفح',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const subscribe = async () => {
    if (!user) {
      toast({
        title: 'خطأ',
        description: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      return;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // For now, subscribe without VAPID key (will work for basic notifications)
      // In production, you would configure VAPID keys
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
      });

      const subscriptionData: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        },
      };

      // حفظ الاشتراك في قاعدة البيانات
      const { error } = await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        endpoint: subscriptionData.endpoint,
        p256dh: subscriptionData.keys.p256dh,
        auth: subscriptionData.keys.auth,
        is_active: true,
      });

      if (error) throw error;

      setIsSubscribed(true);
      toast({
        title: 'تم الاشتراك',
        description: 'سيتم إرسال الإشعارات الفورية إليك',
      });
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: 'خطأ',
        description: 'فشل الاشتراك في الإشعارات',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // تعطيل الاشتراك في قاعدة البيانات
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsSubscribed(false);
      toast({
        title: 'تم الإلغاء',
        description: 'تم إلغاء الاشتراك في الإشعارات الفورية',
      });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'خطأ',
        description: 'فشل إلغاء الاشتراك',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
