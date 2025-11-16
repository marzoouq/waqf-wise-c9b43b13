import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-2 sm:gap-3 justify-start mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-pulse">
          <Bot className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-primary-foreground" />
        </div>
      </div>
      <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-bl-sm px-4 py-3 sm:px-5 sm:py-3.5 md:px-6 md:py-4 shadow-sm border border-border/50">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex gap-1 sm:gap-1.5">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-bounce" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
          <span className="text-xs sm:text-sm md:text-base text-muted-foreground mr-1 sm:mr-2">المساعد يكتب...</span>
        </div>
      </div>
    </div>
  );
}
