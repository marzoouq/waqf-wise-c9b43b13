import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
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
          <span className="text-sm sm:text-base text-muted-foreground mr-2">المساعد يكتب...</span>
        </div>
      </div>
    </div>
  );
}
