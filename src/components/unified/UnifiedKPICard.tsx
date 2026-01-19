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
  /** حجم البطاقة - compact للجوال، default للعادي، large للشاشات الكبيرة */
  size?: 'compact' | 'default' | 'large';
  loading?: boolean;
  onClick?: () => void;
}

const variantStyles = {
  primary: {
    border: 'border-s-primary',
    text: 'text-primary',
    bg: 'bg-primary/5 hover:bg-primary/10',
    icon: 'text-primary group-hover:scale-110'
  },
  success: {
    border: 'border-s-[hsl(var(--chart-2))]',
    text: 'text-[hsl(var(--chart-2))]',
    bg: 'bg-[hsl(var(--chart-2))]/5 hover:bg-[hsl(var(--chart-2))]/10',
    icon: 'text-[hsl(var(--chart-2))] group-hover:scale-110'
  },
  warning: {
    border: 'border-s-[hsl(var(--chart-4))]',
    text: 'text-[hsl(var(--chart-4))]',
    bg: 'bg-[hsl(var(--chart-4))]/5 hover:bg-[hsl(var(--chart-4))]/10',
    icon: 'text-[hsl(var(--chart-4))] group-hover:scale-110'
  },
  info: {
    border: 'border-s-[hsl(var(--chart-1))]',
    text: 'text-[hsl(var(--chart-1))]',
    bg: 'bg-[hsl(var(--chart-1))]/5 hover:bg-[hsl(var(--chart-1))]/10',
    icon: 'text-[hsl(var(--chart-1))] group-hover:scale-110'
  },
  destructive: {
    border: 'border-s-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/5 hover:bg-destructive/10',
    icon: 'text-destructive group-hover:scale-110'
  },
  danger: {
    border: 'border-s-[hsl(var(--chart-3))]',
    text: 'text-[hsl(var(--chart-3))]',
    bg: 'bg-[hsl(var(--chart-3))]/5 hover:bg-[hsl(var(--chart-3))]/10',
    icon: 'text-[hsl(var(--chart-3))] group-hover:scale-110'
  },
  default: {
    border: 'border-s-muted-foreground',
    text: 'text-foreground',
    bg: 'bg-muted/30 hover:bg-muted/50',
    icon: 'text-muted-foreground group-hover:scale-110'
  }
};

const sizeStyles = {
  compact: {
    card: 'min-h-[70px]',
    header: 'pb-1 px-2 pt-2',
    content: 'px-2 pb-2',
    title: 'text-[9px] sm:text-[10px]',
    value: 'text-sm sm:text-base font-bold',
    subtitle: 'text-[8px] sm:text-[9px]',
    icon: 'h-3 w-3',
    trend: 'text-[8px]'
  },
  default: {
    card: '',
    header: 'pb-1.5 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4',
    content: 'px-3 sm:px-4 pb-3 sm:pb-4',
    title: 'text-[10px] sm:text-xs md:text-sm',
    value: 'text-base sm:text-lg md:text-xl lg:text-2xl font-bold',
    subtitle: 'text-[9px] sm:text-[10px] md:text-xs',
    icon: 'h-3 w-3 sm:h-4 sm:w-4',
    trend: 'text-xs'
  },
  large: {
    card: 'min-h-[120px]',
    header: 'pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6',
    content: 'px-4 sm:px-6 pb-4 sm:pb-6',
    title: 'text-xs sm:text-sm md:text-base',
    value: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    subtitle: 'text-[10px] sm:text-xs md:text-sm',
    icon: 'h-4 w-4 sm:h-5 sm:w-5',
    trend: 'text-xs sm:text-sm'
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
 * 
 * ⚠️ API مغلق: لا يقبل className أو style أو children
 * استخدم variant و size للتخصيص
 */
export function UnifiedKPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  size = 'default',
  loading = false,
  onClick
}: UnifiedKPICardProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const parsedTrend = parseTrend(trend);

  if (loading) {
    return (
      <Card className={cn("animate-pulse", sizeStyle.card)}>
        <CardHeader className={sizeStyle.header}>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className={sizeStyle.content}>
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
        "border-s-4",
        variantStyle.border,
        variantStyle.bg,
        sizeStyle.card,
        onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0",
        sizeStyle.header
      )}>
        <CardTitle className={cn(
          "font-medium text-muted-foreground truncate max-w-[80%]",
          sizeStyle.title
        )}>
          {title}
        </CardTitle>
        <Icon className={cn(
          "transition-transform flex-shrink-0",
          sizeStyle.icon,
          variantStyle.icon
        )} />
      </CardHeader>
      <CardContent className={sizeStyle.content}>
        <div className={cn(
          "mb-0.5 sm:mb-1 truncate",
          sizeStyle.value,
          variantStyle.text
        )}>
          {value}
        </div>
        {subtitle && (
          <p className={cn(
            "text-muted-foreground truncate",
            sizeStyle.subtitle
          )}>
            {subtitle}
          </p>
        )}
        {parsedTrend && (
          <div className="flex items-center gap-1 mt-2">
            {parsedTrend.direction === 'up' && <TrendingUp className="h-3 w-3 text-[hsl(var(--chart-2))]" />}
            {parsedTrend.direction === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
            <span className={cn("text-muted-foreground", sizeStyle.trend)}>
              {parsedTrend.text || trendValue || 'مقارنة بالشهر السابق'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
