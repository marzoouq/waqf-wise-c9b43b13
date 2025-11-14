import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function usePushNotifications() {
  const { toast } = useToast();

  // التحقق من دعم المتصفح
  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  // الحصول على حالة الإذن
  const { data: permission } = useQuery({
    queryKey: ['notification-permission'],
    queryFn: async () => {
      if (!isSupported) return 'denied';
      return Notification.permission;
    },
    enabled: isSupported,
  });

  // طلب الإذن
  const requestPermission = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error('المتصفح لا يدعم الإشعارات');
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('تم رفض إذن الإشعارات');
      }

      return permission;
    },
    onSuccess: () => {
      toast({
        title: 'تم منح الإذن',
        description: 'يمكنك الآن استقبال الإشعارات',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في طلب الإذن',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // الاشتراك في الإشعارات
  const subscribe = useMutation({
    mutationFn: async () => {
      if (!isSupported) {
        throw new Error('المتصفح لا يدعم الإشعارات');
      }

      // التحقق من Service Worker
      const registration = await navigator.serviceWorker.ready;

      // الاشتراك في Push
      const vapidKey = urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as any, // Type assertion للتوافق
      });

      // حفظ الاشتراك في قاعدة البيانات
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not found');

      const subscriptionJson = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.user.id,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
          user_agent: navigator.userAgent,
        });

      if (error) throw error;

      return subscription;
    },
    onSuccess: () => {
      toast({
        title: 'تم الاشتراك',
        description: 'سيتم إرسال الإشعارات إلى هذا الجهاز',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في الاشتراك',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // إلغاء الاشتراك
  const unsubscribe = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // حذف من قاعدة البيانات
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.user.id)
            .eq('endpoint', subscription.endpoint);
        }
      }
    },
    onSuccess: () => {
      toast({
        title: 'تم إلغاء الاشتراك',
        description: 'لن يتم إرسال إشعارات إلى هذا الجهاز',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في إلغاء الاشتراك',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    isSupported,
    permission,
    requestPermission: requestPermission.mutateAsync,
    subscribe: subscribe.mutateAsync,
    unsubscribe: unsubscribe.mutateAsync,
    isRequesting: requestPermission.isPending,
    isSubscribing: subscribe.isPending,
    isUnsubscribing: unsubscribe.isPending,
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}