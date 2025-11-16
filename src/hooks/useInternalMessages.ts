import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export interface InternalMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject: string;
  body: string;
  is_read: boolean;
  parent_message_id?: string;
  request_id?: string;
  created_at: string;
  read_at?: string;
}

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
  const { data: inboxMessages = [], isLoading: isLoadingInbox } = useQuery({
    queryKey: ["internal_messages", "inbox", user?.id || undefined],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages" as any)
        .select("*")
        .eq("receiver_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as InternalMessage[];
    },
    enabled: !!user?.id,
  });

  // جلب الرسائل المرسلة
  const { data: sentMessages = [], isLoading: isLoadingSent } = useQuery({
    queryKey: ["internal_messages", "sent", user?.id || undefined],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages" as any)
        .select("*")
        .eq("sender_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as InternalMessage[];
    },
    enabled: !!user?.id,
  });

  // إرسال رسالة
  const sendMessage = useMutation({
    mutationFn: async (message: Omit<InternalMessage, "id" | "created_at" | "is_read" | "read_at">) => {
      const { data, error } = await supabase
        .from("internal_messages" as any)
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
    onError: (error: any) => {
      toast({
        title: "خطأ في الإرسال",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // تعليم رسالة كمقروءة
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .from("internal_messages" as any)
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
