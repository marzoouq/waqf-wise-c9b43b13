import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedKPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  subtitle?: string;
  variant?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
}

const variantStyles = {
  default: {
    border: "border-l-primary",
    text: "text-primary",
    bg: "bg-primary/10",
  },
  success: {
    border: "border-l-green-500",
    text: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10",
  },
  warning: {
    border: "border-l-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  danger: {
    border: "border-l-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
  },
};

/**
 * UnifiedKPICard - بطاقة KPI موحدة
 * بتصميم متسق وعصري مع دعم للحالات المختلفة
 */
export function UnifiedKPICard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  subtitle,
  variant = "default",
  loading = false
}: UnifiedKPICardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-all duration-300",
      "border-l-4",
      styles.border
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Content */}
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className={cn(
              "text-2xl md:text-3xl font-bold tabular-nums",
              styles.text
            )}>
              {value}
            </p>
            {(trend || subtitle) && (
              <p className="text-xs text-muted-foreground">
                {trend || subtitle}
              </p>
            )}
          </div>

          {/* Icon */}
          <div className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            styles.bg
          )}>
            <Icon className={cn("h-7 w-7", styles.text)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
