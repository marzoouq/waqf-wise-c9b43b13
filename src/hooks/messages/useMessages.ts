import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { MessageService, MessageWithUsers } from '@/services/message.service';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface MessageData {
  receiver_id: string;
  subject: string;
  body: string;
  priority: string;
}

export type { MessageWithUsers as Message };

export function useMessages() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب الرسائل
  const { data: messages = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.MESSAGES, user?.id],
    queryFn: () => MessageService.getAllMessages(user!.id),
    enabled: !!user,
  });

  // تحديد الرسالة كمقروءة
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new Error('User not authenticated');
      return MessageService.markAsRead(messageId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
    },
  });

  // إرسال رسالة جديدة
  const sendMessage = useMutation({
    mutationFn: async (message: MessageData) => {
      if (!user) throw new Error('User not authenticated');
      return MessageService.sendMessage({
        sender_id: user.id,
        ...message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MESSAGES });
      toast({
        title: 'تم الإرسال',
        description: 'تم إرسال الرسالة بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    },
  });

  const unreadCount = messages.filter(
    (m) => m.receiver_id === user?.id && !m.is_read
  ).length;

  return {
    messages,
    isLoading,
    unreadCount,
    markAsRead,
    sendMessage,
  };
}