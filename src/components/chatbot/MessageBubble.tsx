import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Bot, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/hooks/use-toast";

interface MessageBubbleProps {
  message: string;
  messageType: "user" | "bot";
  createdAt: string;
}

export function MessageBubble({ message, messageType, createdAt }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الرسالة إلى الحافظة",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل نسخ الرسالة",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 items-start group",
        messageType === "user" ? "justify-end" : "justify-start"
      )}
    >
      {messageType === "bot" && (
        <div className="p-2 bg-primary/10 rounded-full mt-1 flex-shrink-0">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl p-4 break-words shadow-sm relative",
            messageType === "user"
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card border border-border rounded-bl-sm"
          )}
        >
          {messageType === "bot" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className={cn("block bg-muted p-3 rounded text-xs font-mono overflow-x-auto", className)}>
                        {children}
                      </code>
                    );
                  },
                  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
          )}
          
          {messageType === "bot" && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        
        <span
          className={cn(
            "text-xs px-2",
            messageType === "user" ? "text-left" : "text-right",
            "text-muted-foreground"
          )}
        >
          {format(new Date(createdAt), "HH:mm", { locale: ar })}
        </span>
      </div>

      {messageType === "user" && (
        <div className="p-2 bg-primary/10 rounded-full mt-1 flex-shrink-0">
          <div className="h-4 w-4 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
