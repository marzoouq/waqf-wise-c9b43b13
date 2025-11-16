import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, Sparkles } from "lucide-react";
import { useChatbot } from "@/hooks/useChatbot";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { ChatbotActions } from "./ChatbotActions";
import { WelcomeMessage } from "./WelcomeMessage";

export function ChatbotInterface() {
  const { conversations, quickReplies, isLoading, isTyping, sendMessage, clearConversations, hasConversations } = useChatbot();
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
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickReply = async (reply: any) => {
    try {
      await sendMessage({ 
        message: reply.prompt, 
        quickReplyId: reply.id 
      });
    } catch (error) {
      console.error('Error sending quick reply:', error);
    }
  };


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

      <CardContent className="flex-1 flex flex-col p-0 bg-muted/30">
        {/* منطقة الرسائل */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4 pb-4">
            {/* رسالة ترحيبية */}
            {conversations.length === 0 && !isLoading && <WelcomeMessage />}

            {/* الرسائل */}
            {conversations.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg.message}
                messageType={msg.message_type}
                createdAt={msg.created_at}
              />
            ))}

            {/* مؤشر "الروبوت يكتب..." */}
            {isTyping && (
              <div className="flex gap-2 items-start justify-start">
                <div className="p-2 bg-primary/10 rounded-full mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm p-4 max-w-[85%] flex items-center gap-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">يكتب الرد...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* الردود السريعة */}
        {quickReplies.length > 0 && (
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground mb-3 font-medium">ردود سريعة:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <Button
                  key={reply.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  disabled={isTyping}
                  className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors border-border/50"
                >
                  <span className="mr-1">{reply.icon}</span>
                  {reply.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* حقل الإدخال */}
        <div className="p-4 border-t border-border bg-background">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              disabled={isTyping}
              className="flex-1 bg-muted/50 border-border/50 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              disabled={isTyping || !message.trim()}
              size="icon"
              className="flex-shrink-0"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            اضغط Enter للإرسال
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
