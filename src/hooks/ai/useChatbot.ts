import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatbotService, ChatMessage, QuickReply } from "@/services/chatbot.service";
import { UserService } from "@/services/user.service";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { QUERY_KEYS } from "@/lib/query-keys";

export type { ChatMessage, QuickReply } from "@/services/chatbot.service";

export interface QuickAction {
  label: string;
  icon: string;
  link: string;
  count?: number;
}

export function useChatbot() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  const userId = user?.id;

  // جلب أدوار المستخدم
  const { data: userRoles = [] } = useQuery({
    queryKey: QUERY_KEYS.USER_ROLES_CHATBOT(userId),
    queryFn: async () => {
      if (!userId) return [];
      return await UserService.getUserRoles(userId);
    },
    enabled: !!userId,
  });

  const isStaff = useMemo(() => 
    userRoles.some(r => ['admin', 'nazer', 'accountant', 'cashier', 'archivist'].includes(r)),
    [userRoles]
  );

  const isBeneficiary = useMemo(() => 
    userRoles.some(r => ['beneficiary', 'waqf_heir'].includes(r)),
    [userRoles]
  );

  // جلب سجل المحادثات
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.CHATBOT_CONVERSATIONS(userId),
    queryFn: async () => {
      if (!userId) return [];
      return await ChatbotService.getConversations(userId) as ChatMessage[];
    },
    enabled: !!userId,
  });

  // جلب الردود السريعة
  const { data: allQuickReplies = [] } = useQuery({
    queryKey: QUERY_KEYS.CHATBOT_QUICK_REPLIES,
    queryFn: () => ChatbotService.getQuickReplies() as Promise<QuickReply[]>,
  });

  // فلترة الردود السريعة حسب دور المستخدم
  const quickReplies = useMemo(() => {
    if (isStaff) {
      return allQuickReplies.filter(r => 
        ['financial', 'properties', 'requests', 'distributions', 'help'].includes(r.category)
      );
    } else if (isBeneficiary) {
      return allQuickReplies.filter(r => 
        ['beneficiary', 'general'].includes(r.category)
      );
    }
    return allQuickReplies;
  }, [allQuickReplies, isStaff, isBeneficiary]);

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
      
      const data = await ChatbotService.sendMessage(userId, message, quickReplyId);
      
      // تحديث الإجراءات السريعة
      if (data.quickActions && data.quickActions.length > 0) {
        setQuickActions(data.quickActions);
      }
      
      return data;
    },
    onSuccess: () => {
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATBOT_CONVERSATIONS(userId) });
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
      await ChatbotService.clearConversations(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATBOT_CONVERSATIONS(userId) });
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
