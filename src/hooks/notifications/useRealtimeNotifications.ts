/**
 * Hook للاستماع للإشعارات في الوقت الفعلي
 * @version 2.0.0 - تم إصلاح مشكلة تراكم الاشتراكات
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/ui/use-toast';
import type { RealtimeNotification } from '@/types/notifications';
import type { InternalMessage } from '@/types/messages';
import { queryInvalidationManager } from '@/lib/query-invalidation-manager';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // استخدام refs لتجنب إعادة إنشاء الاشتراكات
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  useEffect(() => {
    if (!user?.id) return;

    // اسم قناة ثابت لكل مستخدم
    const channelName = `user-notifications-${user.id}`;

    // الاشتراك الموحد في قناة واحدة
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryInvalidationManager.invalidate(['notifications']);
          
          const notification = payload.new as RealtimeNotification;
          toastRef.current({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beneficiary_requests',
        },
        () => {
          queryInvalidationManager.invalidate(['beneficiary-requests']);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beneficiary_attachments',
        },
        () => {
          queryInvalidationManager.invalidate(['beneficiary-attachments']);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'internal_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          queryInvalidationManager.invalidate(['internal-messages']);
          
          const message = payload.new as InternalMessage;
          toastRef.current({
            title: '📨 رسالة جديدة',
            description: `من: ${message.sender_id || 'الإدارة'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]); // فقط user.id - لا queryClient أو toast
}
