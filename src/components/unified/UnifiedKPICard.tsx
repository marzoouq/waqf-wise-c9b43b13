import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  /** يمكن أن يكون اتجاه ('up' | 'down' | 'neutral') أو نص مثل '+5%' */
  trend?: 'up' | 'down' | 'neutral' | string;
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'default' | 'danger';
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
    border: 'border-l-[hsl(var(--chart-2))]',
    text: 'text-[hsl(var(--chart-2))]',
    bg: 'bg-[hsl(var(--chart-2))]/5 hover:bg-[hsl(var(--chart-2))]/10',
    icon: 'text-[hsl(var(--chart-2))] group-hover:scale-110'
  },
  warning: {
    border: 'border-l-[hsl(var(--chart-4))]',
    text: 'text-[hsl(var(--chart-4))]',
    bg: 'bg-[hsl(var(--chart-4))]/5 hover:bg-[hsl(var(--chart-4))]/10',
    icon: 'text-[hsl(var(--chart-4))] group-hover:scale-110'
  },
  info: {
    border: 'border-l-[hsl(var(--chart-1))]',
    text: 'text-[hsl(var(--chart-1))]',
    bg: 'bg-[hsl(var(--chart-1))]/5 hover:bg-[hsl(var(--chart-1))]/10',
    icon: 'text-[hsl(var(--chart-1))] group-hover:scale-110'
  },
  destructive: {
    border: 'border-l-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/5 hover:bg-destructive/10',
    icon: 'text-destructive group-hover:scale-110'
  },
  danger: {
    border: 'border-l-[hsl(var(--chart-3))]',
    text: 'text-[hsl(var(--chart-3))]',
    bg: 'bg-[hsl(var(--chart-3))]/5 hover:bg-[hsl(var(--chart-3))]/10',
    icon: 'text-[hsl(var(--chart-3))] group-hover:scale-110'
  },
  default: {
    border: 'border-l-muted-foreground',
    text: 'text-foreground',
    bg: 'bg-muted/30 hover:bg-muted/50',
    icon: 'text-muted-foreground group-hover:scale-110'
  }
};

/**
 * تحليل قيمة trend لتحديد الاتجاه والنص
 */
function parseTrend(trend?: string): { direction: 'up' | 'down' | 'neutral'; text: string } | null {
  if (!trend) return null;
  
  // إذا كان أحد القيم المحددة
  if (trend === 'up' || trend === 'down' || trend === 'neutral') {
    return { direction: trend, text: '' };
  }
  
  // إذا كان نص يحتوي على + أو أرقام موجبة
  if (trend.includes('+') || /^[0-9]/.test(trend)) {
    return { direction: 'up', text: trend };
  }
  
  // إذا كان نص يحتوي على -
  if (trend.includes('-')) {
    return { direction: 'down', text: trend };
  }
  
  // قيمة ثابتة أو نص آخر
  return { direction: 'neutral', text: trend };
}

/**
 * UnifiedKPICard - بطاقة KPI موحدة
 * بتصميم متسق وعصري مع دعم للحالات المختلفة
 */
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
  const parsedTrend = parseTrend(trend);

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
      <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 space-y-0 px-3 sm:px-4 pt-3 sm:pt-4">
        <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground truncate max-w-[80%]">
          {title}
        </CardTitle>
        <Icon className={cn(
          "h-3 w-3 sm:h-4 sm:w-4 transition-transform flex-shrink-0",
          styles.icon
        )} />
      </CardHeader>
      <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
        <div className={cn(
          "text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5 sm:mb-1 truncate",
          styles.text
        )}>
          {value}
        </div>
        {subtitle && (
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">
            {subtitle}
          </p>
        )}
        {parsedTrend && (
          <div className="flex items-center gap-1 mt-2">
            {parsedTrend.direction === 'up' && <TrendingUp className="h-3 w-3 text-[hsl(var(--chart-2))]" />}
            {parsedTrend.direction === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className="text-xs text-muted-foreground">
              {parsedTrend.text || trendValue || 'مقارنة بالشهر السابق'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
