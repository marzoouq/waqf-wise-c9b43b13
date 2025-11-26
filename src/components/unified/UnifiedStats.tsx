import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

interface UnifiedStatsProps {
  stats: StatItem[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "default" | "compact";
  className?: string;
}

const colorClasses = {
  primary: "text-primary",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

const bgColorClasses = {
  primary: "bg-primary/10",
  success: "bg-green-100 dark:bg-green-900/20",
  warning: "bg-yellow-100 dark:bg-yellow-900/20",
  danger: "bg-red-100 dark:bg-red-900/20",
  info: "bg-blue-100 dark:bg-blue-900/20",
};

/**
 * مكون بطاقات إحصائيات موحد
 * يعرض إحصائيات متعددة بتصميم موحد مع دعم الأيقونات والاتجاهات
 * 
 * @example
 * <UnifiedStats
 *   stats={[
 *     {
 *       title: "إجمالي المستفيدين",
 *       value: "150",
 *       icon: Users,
 *       trend: { value: 12, isPositive: true }
 *     }
 *   ]}
 *   columns={3}
 * />
 */
export function UnifiedStats({
  stats,
  columns = 3,
  variant = "default",
  className,
}: UnifiedStatsProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  if (variant === "compact") {
    return (
      <div className={cn("grid gap-4", gridCols[columns], className)}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const color = stat.color || "primary";
          
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <p className={cn(
                        "text-xs mt-1",
                        stat.trend.isPositive ? "text-green-600" : "text-red-600"
                      )}>
                        {stat.trend.isPositive ? "+" : "-"}{Math.abs(stat.trend.value)}%
                      </p>
                    )}
                  </div>
                  {Icon && (
                    <div className={cn(
                      "p-3 rounded-full",
                      bgColorClasses[color]
                    )}>
                      <Icon className={cn("h-6 w-6", colorClasses[color])} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const color = stat.color || "primary";
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {Icon && (
                <div className={cn(
                  "p-2 rounded-full",
                  bgColorClasses[color]
                )}>
                  <Icon className={cn("h-4 w-4", colorClasses[color])} />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <CardDescription className="mt-1">
                  {stat.description}
                </CardDescription>
              )}
              {stat.trend && (
                <p className={cn(
                  "text-xs mt-2",
                  stat.trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}% من الشهر الماضي
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
