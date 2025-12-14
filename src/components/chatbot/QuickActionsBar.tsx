import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: string;
  link: string;
  count?: number;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
}

export const QuickActionsBar = memo(function QuickActionsBar({ actions }: QuickActionsBarProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (actions.length === 0) return null;

  // عرض 2 فقط عند الإغلاق
  const visibleActions = isExpanded ? actions : actions.slice(0, 2);
  const hasMore = actions.length > 2;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <ExternalLink className="h-3 w-3 text-primary" />
          <p className="text-[10px] font-medium text-muted-foreground">انتقل إلى:</p>
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
                <ChevronUp className="h-3 w-3 ml-0.5" />
                أقل
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 ml-0.5" />
                +{actions.length - 2}
              </>
            )}
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {visibleActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => navigate(action.link)}
            className={cn(
              "h-6 px-2 text-[11px]",
              "bg-background hover:bg-primary hover:text-primary-foreground",
              "border-primary/30 hover:border-primary"
            )}
          >
            <span className="ml-1">{action.icon}</span>
            {action.label}
            {action.count !== undefined && (
              <Badge 
                variant="secondary" 
                className="me-1 h-4 px-1 text-[9px] bg-primary/20"
              >
                {action.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
});