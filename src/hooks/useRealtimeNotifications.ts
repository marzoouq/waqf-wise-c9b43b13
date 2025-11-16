import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

/**
 * Hook للاستماع للإشعارات في الوقت الفعلي
 */
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    // الاشتراك في إشعارات المستخدم
    const notificationsChannel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // تحديث cache
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          
          // عرض toast notification
          const notification = payload.new as NotificationRow;
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    // الاشتراك في الطلبات
    const requestsChannel = supabase
      .channel('beneficiary-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beneficiary_requests',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['beneficiary-requests'] });
        }
      )
      .subscribe();

    // الاشتراك في المرفقات
    const attachmentsChannel = supabase
      .channel('beneficiary-attachments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beneficiary_attachments',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['beneficiary-attachments'] });
        }
      )
      .subscribe();

    // الاشتراك في الرسائل الداخلية
    const messagesChannel = supabase
      .channel('internal-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'internal_messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['internal-messages'] });
          
          const message = payload.new as InternalMessageRow;
          toast({
            title: '📨 رسالة جديدة',
            description: `من: ${message.sender_name || 'الإدارة'}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(attachmentsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user?.id, queryClient, toast]);
}
