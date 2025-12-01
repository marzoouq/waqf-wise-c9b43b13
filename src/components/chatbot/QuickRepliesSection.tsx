import { memo } from "react";
import { Sparkles } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type QuickReply = Database['public']['Tables']['chatbot_quick_replies']['Row'];

interface QuickRepliesSectionProps {
  quickReplies: QuickReply[];
  onQuickReply: (reply: QuickReply) => void;
  isDisabled?: boolean;
  compact?: boolean;
}

export const QuickRepliesSection = memo(function QuickRepliesSection({
  quickReplies,
  onQuickReply,
  isDisabled = false,
  compact = false,
}: QuickRepliesSectionProps) {
  if (quickReplies.length === 0) return null;

  return (
    <div className={cn(
      "border-t bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm",
      compact ? "px-4 py-3" : "px-6 py-4"
    )}>
      <div className={cn(
        "flex items-center gap-2",
        compact ? "mb-2" : "mb-3"
      )}>
        <Sparkles className={cn(
          "text-primary animate-pulse",
          compact ? "h-3 w-3" : "h-4 w-4"
        )} />
        <p className={cn(
          "font-semibold text-foreground",
          compact ? "text-xs" : "text-sm"
        )}>
          اختصارات ذكية:
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {quickReplies.map((reply, index) => (
          <button
            key={reply.id}
            onClick={() => onQuickReply(reply)}
            disabled={isDisabled}
            className={cn(
              "group bg-gradient-to-br from-background to-background/80",
              "hover:from-primary hover:to-primary/90 hover:text-primary-foreground",
              "transition-all duration-300 border hover:border-primary",
              "shadow-sm hover:shadow-md hover:scale-105",
              "animate-in fade-in slide-in-from-bottom-2 duration-500",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              compact 
                ? "px-3 py-2 text-xs rounded-lg border-border" 
                : "px-4 py-2.5 text-sm rounded-xl border-2 border-border hover:shadow-lg"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className={cn(
              "group-hover:scale-110 inline-block transition-transform",
              compact ? "ml-1" : "ml-2"
            )}>
              {reply.icon}
            </span>
            {reply.text}
          </button>
        ))}
      </div>
    </div>
  );
});
