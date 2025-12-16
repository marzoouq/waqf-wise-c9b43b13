import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { InternalMessageInsert } from "@/types/messages";
import { createMutationErrorHandler } from "@/lib/errors";
import { MessageService } from "@/services/message.service";
import { RealtimeService } from "@/services/realtime.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useInternalMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable(
      'internal_messages',
      () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERNAL_MESSAGES })
    );
    return () => { subscription.unsubscribe(); };
  }, [queryClient]);

  const { data: inboxMessages = [], isLoading: isLoadingInbox } = useQuery({
    queryKey: [...QUERY_KEYS.INTERNAL_MESSAGES, "inbox", user?.id],
    queryFn: () => MessageService.getInboxMessages(user!.id),
    enabled: !!user?.id,
  });

  const { data: sentMessages = [], isLoading: isLoadingSent } = useQuery({
    queryKey: [...QUERY_KEYS.INTERNAL_MESSAGES, "sent", user?.id],
    queryFn: () => MessageService.getSentMessages(user!.id),
    enabled: !!user?.id,
  });

  const sendMessage = useMutation({
    mutationFn: (message: InternalMessageInsert) => 
      MessageService.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERNAL_MESSAGES });
      toast({
        title: "تم إرسال الرسالة",
        description: "تم إرسال الرسالة بنجاح",
      });
    },
    onError: createMutationErrorHandler({
      context: 'send_message',
      toastTitle: 'خطأ في الإرسال',
    }),
  });

  const markAsRead = useMutation({
    mutationFn: (messageId: string) => MessageService.markAsRead(messageId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.INTERNAL_MESSAGES });
    },
  });

  const unreadCount = inboxMessages.filter((m: { is_read: boolean }) => !m.is_read).length;

  return {
    inboxMessages,
    sentMessages,
    isLoadingInbox,
    isLoadingSent,
    sendMessage: sendMessage.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    unreadCount,
  };
}
