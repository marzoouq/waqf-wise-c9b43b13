import { RefObject, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { WelcomeMessage } from "./WelcomeMessage";
import { TypingIndicator } from "./TypingIndicator";
import { ChatMessage } from "@/hooks/ai/useChatbot";
import { cn } from "@/lib/utils";

interface MessagesSectionProps {
  conversations: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  messagesEndRef: RefObject<HTMLDivElement>;
  compact?: boolean;
}

export const MessagesSection = memo(function MessagesSection({
  conversations,
  isLoading,
  isTyping,
  scrollRef,
  messagesEndRef,
  compact = false,
}: MessagesSectionProps) {
  return (
    <ScrollArea ref={scrollRef} className={cn("flex-1", compact ? "p-4 bg-muted/30" : "p-4")}>
      <div className="space-y-4 pb-4">
        {/* رسالة ترحيبية */}
        {conversations.length === 0 && !isLoading && <WelcomeMessage compact={compact} />}

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
        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
});
