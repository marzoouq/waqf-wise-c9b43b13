import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
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

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
  const navigate = useNavigate();

  if (actions.length === 0) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-2 mb-3">
        <ExternalLink className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold text-foreground">انتقل مباشرة إلى:</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => navigate(action.link)}
            className={cn(
              "group relative overflow-hidden",
              "bg-background hover:bg-primary hover:text-primary-foreground",
              "border-primary/30 hover:border-primary",
              "transition-all duration-300 hover:scale-105 hover:shadow-md",
              "animate-in fade-in slide-in-from-bottom duration-300"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-base ml-2 group-hover:scale-110 inline-block transition-transform">
              {action.icon}
            </span>
            <span className="font-medium">{action.label}</span>
            {action.count !== undefined && (
              <Badge 
                variant="secondary" 
                className="mr-2 bg-primary/20 group-hover:bg-primary-foreground/20 transition-colors"
              >
                {action.count}
              </Badge>
            )}
            
            {/* تأثير التمويج */}
            <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-3 text-center">
        💡 اضغط على أي قسم للانتقال إليه مباشرة
      </p>
    </Card>
  );
}
