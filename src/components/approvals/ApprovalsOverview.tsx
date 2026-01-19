import { Clock, CheckCircle, XCircle, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useApprovalsOverview } from "@/hooks/approvals";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ApprovalsOverview() {
  const { data: stats, isLoading } = useApprovalsOverview();

  const cards = [
    {
      title: "إجمالي الموافقات",
      value: stats?.total || 0,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "قيد المراجعة",
      value: stats?.pending || 0,
      icon: Clock,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-100 dark:from-amber-950/50 dark:to-orange-900/30",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      trend: stats?.pending && stats.pending > 5 ? { direction: "up" as const, label: "يتطلب انتباه" } : null,
    },
    {
      title: "موافق عليها",
      value: stats?.approved || 0,
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-50 to-green-100 dark:from-emerald-950/50 dark:to-green-900/30",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "مرفوضة",
      value: stats?.rejected || 0,
      icon: XCircle,
      gradient: "from-rose-500 to-red-600",
      bgGradient: "from-rose-50 to-red-100 dark:from-rose-950/50 dark:to-red-900/30",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 w-8 bg-muted rounded-xl mb-3" />
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-4 w-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index}
            className={cn(
              "relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300",
              "bg-gradient-to-br",
              card.bgGradient
            )}
          >
            <CardContent className="p-4 sm:p-5">
              {/* أيقونة الخلفية الزخرفية */}
              <div className="absolute -top-4 -end-4 opacity-10">
                <Icon className="h-24 w-24" />
              </div>
              
              {/* المحتوى */}
              <div className="relative">
                <div className={cn(
                  "inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3",
                  card.iconBg
                )}>
                  <Icon className={cn("h-5 w-5", card.iconColor)} />
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {card.value.toLocaleString('ar-SA')}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {card.title}
                    </p>
                  </div>
                  
                  {card.trend && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                      card.trend.direction === "up" 
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" 
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {card.trend.direction === "up" ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">{card.trend.label}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}