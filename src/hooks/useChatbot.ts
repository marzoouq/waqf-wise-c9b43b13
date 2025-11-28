import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ChatMessage {
  id: string;
  message: string;
  message_type: 'user' | 'bot';
  created_at: string;
  quick_reply_id?: string;
}

export interface QuickReply {
  id: string;
  text: string;
  icon: string;
  prompt: string;
  category: string;
  order_index: number;
  created_at: string;
  is_active: boolean;
}

export interface QuickAction {
  label: string;
  icon: string;
  link: string;
  count?: number;
}

export function useChatbot() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  // جلب معرف المستخدم الحالي
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const userId = session?.user?.id;

  // جلب سجل المحادثات
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["chatbot_conversations", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("chatbot_conversations")
        .select("id, message, message_type, created_at, quick_reply_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!userId,
  });

  // جلب الردود السريعة
  const { data: quickReplies = [] } = useQuery({
    queryKey: ["chatbot_quick_replies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chatbot_quick_replies")
        .select("id, text, icon, prompt, category, order_index, created_at, is_active")
        .eq("is_active", true)
        .order("order_index");

      if (error) throw error;
      return data as QuickReply[];
    },
  });

  // إرسال رسالة
  const sendMessage = useMutation({
    mutationFn: async ({ 
      message, 
      quickReplyId 
    }: { 
      message: string; 
      quickReplyId?: string 
    }) => {
      if (!userId) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      setIsTyping(true);
      
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { 
          message, 
          userId,
          quickReplyId 
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'فشل في الحصول على الرد');
      
      // تحديث الإجراءات السريعة
      if (data.quickActions && data.quickActions.length > 0) {
        setQuickActions(data.quickActions);
      }
      
      return data;
    },
    onSuccess: () => {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ["chatbot_conversations"] });
    },
    onError: (error: unknown) => {
      setIsTyping(false);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء إرسال الرسالة";
      toast({
        title: "خطأ في الإرسال",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // حذف سجل المحادثات
  const clearConversations = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      
      const { error } = await supabase
        .from("chatbot_conversations")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot_conversations"] });
      toast({
        title: "تم المسح",
        description: "تم مسح سجل المحادثات بنجاح",
      });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "فشل في مسح سجل المحادثات";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    conversations,
    quickReplies,
    quickActions,
    isLoading,
    isTyping,
    sendMessage: sendMessage.mutateAsync,
    clearConversations: clearConversations.mutateAsync,
    hasConversations: conversations.length > 0,
  };
}
