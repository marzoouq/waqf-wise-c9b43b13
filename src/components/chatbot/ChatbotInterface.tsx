import { useState, useRef, useEffect, memo } from "react";
import { Database } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Sparkles } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import { ChatbotActions } from "./ChatbotActions";
import { MessagesSection } from "./MessagesSection";
import { QuickRepliesSection } from "./QuickRepliesSection";
import { ChatInputForm } from "./ChatInputForm";
import { QuickActionsBar } from "./QuickActionsBar";

interface ChatbotInterfaceProps {
  compact?: boolean;
}

export const ChatbotInterface = memo(function ChatbotInterface({ compact = false }: ChatbotInterfaceProps) {
  const { conversations, quickReplies, quickActions, isLoading, isTyping, sendMessage, clearConversations, hasConversations } = useChatbot();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // التمرير التلقائي للأسفل عند إضافة رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || message;
    if (!messageToSend.trim()) return;

    try {
      await sendMessage({ message: messageToSend });
      setMessage("");
    } catch {
      // Error handled by useChatbot hook
    }
  };

  const handleQuickReply = async (reply: Database['public']['Tables']['chatbot_quick_replies']['Row']) => {
    try {
      await sendMessage({ 
        message: reply.prompt, 
        quickReplyId: reply.id 
      });
    } catch {
      // Error handled by useChatbot hook
    }
  };

  // المحتوى المشترك
  const renderContent = () => (
    <>
      {/* منطقة الرسائل */}
      <MessagesSection
        conversations={conversations}
        isLoading={isLoading}
        isTyping={isTyping}
        scrollRef={scrollRef}
        messagesEndRef={messagesEndRef}
        compact={compact}
      />

      {/* شريط الإجراءات السريعة */}
      {quickActions.length > 0 && (
        <div className={cn("px-4", compact ? "pt-3 pb-2 bg-muted/30" : "pt-4")}>
          <QuickActionsBar actions={quickActions} />
        </div>
      )}

      {/* الردود السريعة */}
      <QuickRepliesSection
        quickReplies={quickReplies}
        onQuickReply={handleQuickReply}
        isDisabled={isTyping}
        compact={compact}
      />

      {/* حقل الإدخال */}
      <ChatInputForm
        message={message}
        onMessageChange={setMessage}
        onSubmit={() => handleSendMessage()}
        isTyping={isTyping}
        compact={compact}
      />
    </>
  );

  // الوضع المصغر
  if (compact) {
    return (
      <div className="w-full h-full flex flex-col bg-card rounded-lg overflow-hidden">
        {renderContent()}
      </div>
    );
  }

  // الوضع الكامل
  return (
    <Card className="w-full h-[calc(100vh-12rem)] flex flex-col shadow-xl border-border/50 bg-card">
      <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                مساعد الوقف الذكي
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <p className="text-xs font-normal text-primary-foreground/80 mt-1">
                مدعوم بتقنية الذكاء الاصطناعي
              </p>
            </div>
          </CardTitle>
          
          <ChatbotActions
            conversations={conversations}
            onClearHistory={clearConversations}
            hasConversations={hasConversations}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 bg-muted/30 overflow-hidden">
        {renderContent()}
      </CardContent>
    </Card>
  );
});
