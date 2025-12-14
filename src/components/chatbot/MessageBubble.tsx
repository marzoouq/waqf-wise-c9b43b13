import { useState, memo } from "react";
import { formatDate } from "@/lib/date";
import { Bot, Copy, Check, User, Users, DollarSign, Building2 } from "lucide-react";
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

const StatCard = memo(function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <Card className="p-3 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300">
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
});

interface MessageBubbleProps {
  message: string;
  messageType: "user" | "bot";
  createdAt: string;
}

export const MessageBubble = memo(function MessageBubble({ message, messageType, createdAt }: MessageBubbleProps) {
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
    } catch {
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
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
              : "bg-card rounded-bl-sm border border-border"
          )}
        >
          {messageType === "bot" ? (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // الفقرات
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                  ),
                  // القوائم
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-3 space-y-1.5 pr-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-3 space-y-1.5 pr-2">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground leading-relaxed">{children}</li>
                  ),
                  // النص العريض والمائل
                  strong: ({ children }) => (
                    <strong className="font-bold text-primary">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-muted-foreground">{children}</em>
                  ),
                  // الكود المضمن
                  code: ({ className, children, ...props }) => {
                    const isInline = !className;
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded-md bg-muted text-primary font-mono text-xs border border-border">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className={cn("font-mono text-sm", className)} {...props}>
                        {children}
                      </code>
                    );
                  },
                  // كتل الكود
                  pre: ({ children }) => (
                    <pre className="p-4 rounded-xl bg-muted/80 overflow-x-auto border border-border my-3 text-sm">
                      {children}
                    </pre>
                  ),
                  // العناوين
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-3 text-foreground border-b border-border pb-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold mb-2 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-bold mb-2 text-foreground">{children}</h3>
                  ),
                  // الروابط
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {children}
                    </a>
                  ),
                  // الجداول
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 rounded-lg border border-border">
                      <table className="min-w-full divide-y divide-border text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-right font-semibold text-foreground">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-right border-t border-border">{children}</td>
                  ),
                  // الاقتباسات
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-primary pr-4 my-3 text-muted-foreground italic bg-muted/30 py-2 rounded-l-lg">
                      {children}
                    </blockquote>
                  ),
                  // الخط الفاصل
                  hr: () => <hr className="my-4 border-border" />,
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
            {formatDate(createdAt, "h:mm a")}
          </span>
          
          {messageType === "bot" && (
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
              title="نسخ الرسالة"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
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
});
