/**
 * مكون الإجراءات السريعة الموحد
 * يستخدم في لوحات التحكم المختلفة (الناظر، المحاسب، المستفيد)
 * 
 * @version 2.9.0
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNewAuditLogsCount, useCriticalAuditLogsCount } from "@/hooks/system/useNewAuditLogsCount";
import { ReactNode } from "react";

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  bgColor: string;
  showBadge?: boolean;
  badgeType?: 'count' | 'critical';
}

interface UnifiedQuickActionsGridProps {
  actions: QuickAction[];
  title?: string;
  columns?: 2 | 3 | 4;
  variant?: 'card' | 'button';
  className?: string;
}

// مكون الـ Badge الديناميكي
function ActionBadge({ action }: { action: QuickAction }) {
  const { data: newCount = 0 } = useNewAuditLogsCount();
  const { data: criticalCount = 0 } = useCriticalAuditLogsCount();

  if (!action.showBadge) return null;

  const count = action.badgeType === 'critical' ? criticalCount : newCount;
  if (count === 0) return null;

  return (
    <Badge 
      variant={action.badgeType === 'critical' ? "destructive" : "secondary"}
      className={cn(
        "absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold",
        action.badgeType === 'critical' && count > 0 && "animate-pulse"
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

export function UnifiedQuickActionsGrid({ 
  actions,
  title = "الإجراءات السريعة",
  columns = 4,
  variant = 'button',
  className,
}: UnifiedQuickActionsGridProps) {
  const navigate = useNavigate();

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  if (variant === 'card') {
    return (
      <div className={cn("grid gap-3 sm:gap-4", gridCols[columns], className)}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.path}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative"
              onClick={() => navigate(action.path)}
            >
              <ActionBadge action={action} />
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className={cn("p-3 rounded-full", action.bgColor)}>
                  <Icon className={cn("h-6 w-6", action.color)} />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className={cn("grid gap-2 sm:gap-3 md:gap-4", gridCols[columns])}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.path} className="relative">
                <ActionBadge action={action} />
                <Button
                  variant="outline"
                  className="h-auto w-full flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all"
                  onClick={() => navigate(action.path)}
                >
                  <div className={cn("p-2 sm:p-3 rounded-full shrink-0", action.bgColor)}>
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6", action.color)} />
                  </div>
                  <div className="text-center w-full">
                    <p className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">
                      {action.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
