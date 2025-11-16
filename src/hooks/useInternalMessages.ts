import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import type { InternalMessage, InternalMessageInsert } from "@/types/messages";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export function useInternalMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'internal_messages'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["internal_messages"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // جلب الرسائل الواردة
  const { data: inboxMessages = [], isLoading: isLoadingInbox } = useQuery<InternalMessage[]>({
    queryKey: ["internal_messages", "inbox", user?.id || undefined],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages")
        .select("*")
        .eq("receiver_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InternalMessage[];
    },
    enabled: !!user?.id,
  });

  // جلب الرسائل المرسلة
  const { data: sentMessages = [], isLoading: isLoadingSent } = useQuery<InternalMessage[]>({
    queryKey: ["internal_messages", "sent", user?.id || undefined],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages")
        .select("*")
        .eq("sender_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InternalMessage[];
    },
    enabled: !!user?.id,
  });

  // إرسال رسالة
  const sendMessage = useMutation({
    mutationFn: async (message: InternalMessageInsert) => {
      const { data, error } = await supabase
        .from("internal_messages")
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
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

  // تعليم رسالة كمقروءة
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from("internal_messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", messageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internal_messages"] });
    },
  });

  // عدد الرسائل غير المقروءة
  const unreadCount = inboxMessages.filter(m => !m.is_read).length;

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
