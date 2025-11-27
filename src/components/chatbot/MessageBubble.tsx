import { useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Bot, Copy, Check, User, TrendingUp, Users, DollarSign, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/hooks/use-toast";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}

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

  // استخراج الإحصائيات من الرسالة
  const extractStats = (text: string) => {
    const stats = [];
    const beneficiariesMatch = text.match(/(\d+)\s*مستفيد/);
    const propertiesMatch = text.match(/(\d+)\s*عقار/);
    const amountMatch = text.match(/([\d,]+)\s*ريال/);
    
    if (beneficiariesMatch) {
      stats.push({
        icon: <Users className="h-4 w-4" />,
        label: "المستفيدون",
        value: beneficiariesMatch[1],
      });
    }
    if (propertiesMatch) {
      stats.push({
        icon: <Building2 className="h-4 w-4" />,
        label: "العقارات",
        value: propertiesMatch[1],
      });
    }
    if (amountMatch) {
      stats.push({
        icon: <DollarSign className="h-4 w-4" />,
        label: "المبلغ",
        value: amountMatch[1] + " ر.س",
      });
    }
    return stats;
  };

  const stats = messageType === "bot" ? extractStats(message) : [];

  return (
    <div 
      className={cn(
        "flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
        messageType === "user" ? "justify-end" : "justify-start"
      )}
    >
      {messageType === "bot" && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg animate-pulse">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex flex-col max-w-[85%] gap-2",
        messageType === "user" ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "rounded-2xl px-5 py-3 shadow-sm transition-all duration-300 hover:shadow-md",
            messageType === "user"
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-sm"
              : "bg-gradient-to-br from-muted to-muted/80 rounded-bl-sm border border-border/50"
          )}
        >
          {messageType === "bot" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="mb-1 text-foreground/90">{children}</li>,
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-foreground/80">{children}</em>,
                  code: ({ children }) => (
                    <code className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-xs">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-4 rounded-lg bg-muted/80 overflow-x-auto border border-border/50">
                      {children}
                    </pre>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-bold mb-2 text-foreground">{children}</h3>
                  ),
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
          )}
        </div>
        
        {/* عرض الإحصائيات إذا كانت موجودة */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 w-full max-w-md">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {format(new Date(createdAt), "h:mm a", { locale: ar })}
          </span>
          
          {messageType === "bot" && (
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
              title="نسخ الرسالة"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {messageType === "user" && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/30">
            <User className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
