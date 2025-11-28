import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface MessageData {
  receiver_id: string;
  subject: string;
  body: string;
  priority: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  priority?: string;
  created_at: string;
  sender_name?: string;
  receiver_name?: string;
}

export function useMessages() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // جلب الرسائل
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('messages_with_users')
        .select('id, sender_id, receiver_id, subject, body, is_read, read_at, priority, created_at, sender_name, receiver_name')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!user,
  });

  // تحديد الرسالة كمقروءة
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('internal_messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // إرسال رسالة جديدة
  const sendMessage = useMutation({
    mutationFn: async (message: MessageData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('internal_messages')
        .insert({
          sender_id: user.id,
          ...message,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
