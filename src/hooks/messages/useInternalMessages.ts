import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { InternalMessageInsert } from "@/types/messages";
import { createMutationErrorHandler } from "@/lib/errors";
import { MessageService } from "@/services/message.service";
import { supabase } from "@/integrations/supabase/client";

export function useInternalMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internal_messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ["internal_messages"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const { data: inboxMessages = [], isLoading: isLoadingInbox } = useQuery({
    queryKey: ["internal_messages", "inbox", user?.id],
    queryFn: () => MessageService.getInboxMessages(user!.id),
    enabled: !!user?.id,
  });

  const { data: sentMessages = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["internal_messages", "sent", user?.id],
    queryFn: () => MessageService.getSentMessages(user!.id),
    enabled: !!user?.id,
  });

  const sendMessage = useMutation({
    mutationFn: (message: InternalMessageInsert) => 
      MessageService.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal_messages"] });
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
    mutationFn: (messageId: string) => MessageService.markAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal_messages"] });
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
