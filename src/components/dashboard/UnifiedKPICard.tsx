import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'default';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const variantStyles = {
  primary: {
    border: 'border-l-primary',
    text: 'text-primary',
    bg: 'bg-primary/5 hover:bg-primary/10',
    icon: 'text-primary group-hover:scale-110'
  },
  success: {
    border: 'border-l-success',
    text: 'text-success',
    bg: 'bg-success/5 hover:bg-success/10',
    icon: 'text-success group-hover:scale-110'
  },
  warning: {
    border: 'border-l-warning',
    text: 'text-warning',
    bg: 'bg-warning/5 hover:bg-warning/10',
    icon: 'text-warning group-hover:scale-110'
  },
  info: {
    border: 'border-l-info',
    text: 'text-info',
    bg: 'bg-info/5 hover:bg-info/10',
    icon: 'text-info group-hover:scale-110'
  },
  destructive: {
    border: 'border-l-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/5 hover:bg-destructive/10',
    icon: 'text-destructive group-hover:scale-110'
  },
  default: {
    border: 'border-l-muted-foreground',
    text: 'text-foreground',
    bg: 'bg-muted/30 hover:bg-muted/50',
    icon: 'text-muted-foreground group-hover:scale-110'
  }
};

export function UnifiedKPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  loading = false,
  onClick,
  className
}: UnifiedKPICardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "group transition-all duration-300",
        "border-l-4",
        styles.border,
        styles.bg,
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-3 w-3 sm:h-4 sm:w-4 transition-transform",
          styles.icon
        )} />
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-lg sm:text-xl md:text-2xl font-bold mb-1",
          styles.text
        )}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className="text-xs text-muted-foreground">
              {trendValue || 'مقارنة بالشهر السابق'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
