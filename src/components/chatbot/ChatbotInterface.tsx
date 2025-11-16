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
import { QuickActionsBar } from "./QuickActionsBar";

interface ChatbotInterfaceProps {
  compact?: boolean;
}

export function ChatbotInterface({ compact = false }: ChatbotInterfaceProps) {
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


  if (compact) {
    return (
      <div className="w-full h-full flex flex-col bg-card rounded-lg overflow-hidden">
        {/* منطقة الرسائل */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4 bg-muted/30">
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

            {/* مؤشر الكتابة */}
            {isTyping && (
              <div className="flex gap-3 justify-start mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-pulse">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs text-muted-foreground mr-2">المساعد يكتب...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* شريط الإجراءات السريعة */}
        {quickActions.length > 0 && (
          <div className="px-4 pt-3 pb-2 bg-muted/30">
            <QuickActionsBar actions={quickActions} />
          </div>
        )}

        {/* الردود السريعة */}
        {quickReplies.length > 0 && (
          <div className="px-4 py-3 border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <p className="text-xs font-semibold text-foreground">اختصارات ذكية:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply)}
                  disabled={isTyping}
                  className="group px-3 py-2 text-xs rounded-lg bg-gradient-to-br from-background to-background/80 hover:from-primary hover:to-primary/90 hover:text-primary-foreground transition-all duration-300 border border-border hover:border-primary shadow-sm hover:shadow-md hover:scale-105 animate-in fade-in slide-in-from-bottom-2 duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="ml-1 group-hover:scale-110 inline-block transition-transform">{reply.icon}</span>
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* حقل الإدخال */}
        <div className="p-4 border-t bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
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
              placeholder="✨ اكتب سؤالك هنا..."
              disabled={isTyping}
              className="flex-1 h-11 px-4 text-sm rounded-lg border-2 border-border/50 focus:border-primary bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 focus:shadow-md"
            />
            <Button
              type="submit"
              disabled={isTyping || !message.trim()}
              size="icon"
              className="h-11 w-11 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary to-primary/90"
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
      </div>
    );
  }

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

            {/* مؤشر الكتابة المحسّن */}
            {isTyping && (
              <div className="flex gap-3 justify-start mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-pulse">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-sm px-6 py-4 shadow-sm border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    <span className="text-xs text-muted-foreground mr-2">المساعد يكتب...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* شريط الإجراءات السريعة */}
        {quickActions.length > 0 && (
          <div className="px-4 pt-4">
            <QuickActionsBar actions={quickActions} />
          </div>
        )}

        {/* الردود السريعة المحسّنة */}
        {quickReplies.length > 0 && (
          <div className="px-6 py-4 border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <p className="text-sm font-semibold text-foreground">اختصارات ذكية:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <button
                  key={reply.id}
                  onClick={() => handleQuickReply(reply)}
                  disabled={isTyping}
                  className="group px-4 py-2.5 text-sm rounded-xl bg-gradient-to-br from-background to-background/80 hover:from-primary hover:to-primary/90 hover:text-primary-foreground transition-all duration-300 border-2 border-border hover:border-primary shadow-sm hover:shadow-lg hover:scale-105 animate-in fade-in slide-in-from-bottom-2 duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="ml-2 group-hover:scale-110 inline-block transition-transform">{reply.icon}</span>
                  {reply.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* حقل الإدخال المحسّن */}
        <div className="p-6 border-t bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3"
          >
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="✨ اكتب سؤالك هنا وسأساعدك فوراً..."
              disabled={isTyping}
              className="flex-1 h-12 px-5 text-base rounded-xl border-2 border-border/50 focus:border-primary bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 focus:shadow-lg"
            />
            <Button
              type="submit"
              disabled={isTyping || !message.trim()}
              size="icon"
              className="h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary to-primary/90"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            اضغط Enter للإرسال • يعمل بتقنية الذكاء الاصطناعي 🤖
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
