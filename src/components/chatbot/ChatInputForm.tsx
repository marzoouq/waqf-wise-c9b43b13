import { memo, FormEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatInputFormProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSubmit: () => void;
  isTyping: boolean;
  compact?: boolean;
}

export const ChatInputForm = memo(function ChatInputForm({
  message,
  onMessageChange,
  onSubmit,
  isTyping,
  compact = false,
}: ChatInputFormProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={cn(
      "border-t bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm",
      compact ? "p-4" : "p-6"
    )}>
      <form onSubmit={handleSubmit} className={cn("flex", compact ? "gap-2" : "gap-3")}>
        <Input
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={compact ? "✨ اكتب سؤالك هنا..." : "✨ اكتب سؤالك هنا وسأساعدك فوراً..."}
          disabled={isTyping}
          className={cn(
            "flex-1 border-2 border-border/50 focus:border-primary",
            "bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-300 focus:shadow-md",
            compact 
              ? "h-11 px-4 text-sm rounded-lg" 
              : "h-12 px-5 text-base rounded-xl focus:shadow-lg"
          )}
        />
        <Button
          type="submit"
          disabled={isTyping || !message.trim()}
          size="icon"
          className={cn(
            "shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
            "bg-gradient-to-br from-primary to-primary/90",
            compact ? "h-11 w-11 rounded-lg" : "h-12 w-12 rounded-xl shadow-lg hover:shadow-xl"
          )}
        >
          {isTyping ? (
            <Loader2 className={cn("animate-spin", compact ? "h-4 w-4" : "h-5 w-5")} />
          ) : (
            <Send className={compact ? "h-4 w-4" : "h-5 w-5"} />
          )}
        </Button>
      </form>
      <p className={cn(
        "text-xs text-muted-foreground text-center",
        compact ? "mt-2" : "mt-3"
      )}>
        {compact ? "اضغط Enter للإرسال" : "اضغط Enter للإرسال • يعمل بتقنية الذكاء الاصطناعي 🤖"}
      </p>
    </div>
  );
});
