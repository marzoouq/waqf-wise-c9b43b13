import { memo, useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (quickReplies.length === 0) return null;

  // عرض 3 اختصارات فقط عند الإغلاق
  const visibleReplies = isExpanded ? quickReplies : quickReplies.slice(0, 3);
  const hasMore = quickReplies.length > 3;

  return (
    <div className={cn(
      "border-t bg-muted/30",
      compact ? "px-3 py-2" : "px-4 py-2.5"
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary" />
          <p className="text-[10px] font-medium text-muted-foreground">
            اختصارات:
          </p>
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 ms-0.5" />
                أقل
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 ms-0.5" />
                المزيد ({quickReplies.length - 3})
              </>
            )}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleReplies.map((reply) => (
          <button
            key={reply.id}
            onClick={() => onQuickReply(reply)}
            disabled={isDisabled}
            className={cn(
              "bg-background hover:bg-primary hover:text-primary-foreground",
              "transition-all duration-200 border border-border hover:border-primary",
              "shadow-sm hover:shadow text-[11px] px-2 py-1 rounded-md",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <span className="ms-1">{reply.icon}</span>
            {reply.text}
          </button>
        ))}
      </div>
    </div>
  );
});