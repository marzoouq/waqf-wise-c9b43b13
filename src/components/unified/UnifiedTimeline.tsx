import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, arLocale as ar } from "@/lib/date";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  icon?: LucideIcon;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  metadata?: Record<string, any>;
}

interface UnifiedTimelineProps {
  events: TimelineEvent[];
  variant?: "default" | "compact";
  showDate?: boolean;
  className?: string;
}

const colorClasses = {
  primary: "bg-primary border-primary",
  success: "bg-green-600 border-green-600",
  warning: "bg-yellow-600 border-yellow-600",
  danger: "bg-red-600 border-red-600",
  info: "bg-blue-600 border-blue-600",
};

const lineColorClasses = {
  primary: "border-primary/30",
  success: "border-green-600/30",
  warning: "border-yellow-600/30",
  danger: "border-red-600/30",
  info: "border-blue-600/30",
};

/**
 * مكون خط زمني موحد
 * يعرض الأحداث بترتيب زمني مع دعم الأيقونات والألوان
 * 
 * @example
 * <UnifiedTimeline
 *   events={[
 *     {
 *       id: "1",
 *       title: "تمت الموافقة على التوزيع",
 *       description: "تم اعتماد توزيع شهر يناير",
 *       date: new Date(),
 *       icon: Check,
 *       color: "success"
 *     }
 *   ]}
 * />
 */
export function UnifiedTimeline({
  events,
  variant = "default",
  showDate = true,
  className,
}: UnifiedTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = typeof a.date === "string" ? new Date(a.date) : a.date;
    const dateB = typeof b.date === "string" ? new Date(b.date) : b.date;
    return dateB.getTime() - dateA.getTime();
  });

  if (variant === "compact") {
    return (
      <div className={cn("space-y-4", className)}>
        {sortedEvents.map((event, index) => {
          const Icon = event.icon;
          const color = event.color || "primary";
          const date = typeof event.date === "string" ? new Date(event.date) : event.date;
          
          return (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full",
                  colorClasses[color],
                  "text-white"
                )}>
                  {Icon ? <Icon className="h-4 w-4" /> : <span className="text-xs">{index + 1}</span>}
                </div>
                {index < sortedEvents.length - 1 && (
                  <div className={cn("w-0.5 h-full min-h-8 border-r-2", lineColorClasses[color])} />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium">{event.title}</h4>
                  {showDate && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(date, "dd MMM yyyy", { locale: ar })}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {sortedEvents.map((event, index) => {
        const Icon = event.icon;
        const color = event.color || "primary";
        const date = typeof event.date === "string" ? new Date(event.date) : event.date;
        
        return (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                colorClasses[color],
                "text-white shadow-sm"
              )}>
                {Icon ? <Icon className="h-5 w-5" /> : <span>{index + 1}</span>}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className={cn("w-0.5 flex-1 min-h-12 border-r-2 mt-2", lineColorClasses[color])} />
              )}
            </div>
            <Card className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  {showDate && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(date, "dd MMMM yyyy - HH:mm", { locale: ar })}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
