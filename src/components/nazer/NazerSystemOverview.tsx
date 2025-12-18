/**
 * نظرة شاملة على النظام للناظر
 * إحصائيات سريعة من جميع أقسام النظام
 * 
 * @version 2.8.91 - استخدام CSS Variables
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, Users, FileText, Wallet, 
  TrendingUp, AlertTriangle, Clock,
  Database, Shield, CheckCircle, Activity
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useNazerSystemOverview } from "@/hooks/dashboard/useNazerSystemOverview";
import { ErrorState } from "@/components/shared/ErrorState";

interface SystemStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  percentage?: number;
}

export function NazerSystemOverview() {
  const { data: stats, isLoading, error, refetch } = useNazerSystemOverview();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>نظرة شاملة على النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل نظرة النظام" message={(error as Error).message} onRetry={refetch} />;
  }

  const systemStats: SystemStat[] = [
    {
      label: "المستفيدون",
      value: `${stats?.beneficiaries.active}/${stats?.beneficiaries.total}`,
      icon: Users,
      color: "text-[hsl(var(--chart-1))]",
      percentage: stats?.beneficiaries.percentage,
    },
    {
      label: "العقارات المؤجرة",
      value: `${stats?.properties.occupied}/${stats?.properties.total}`,
      icon: Building2,
      color: "text-[hsl(var(--status-warning))]",
      percentage: stats?.properties.percentage,
    },
    {
      label: "العقود النشطة",
      value: stats?.contracts.active || 0,
      icon: FileText,
      color: "text-[hsl(var(--status-success))]",
    },
    {
      label: "القروض النشطة",
      value: stats?.loans.active || 0,
      icon: Wallet,
      color: "text-destructive",
    },
    {
      label: "إجمالي التحصيل",
      value: formatCurrency(stats?.payments.amount || 0),
      icon: TrendingUp,
      color: "text-[hsl(var(--status-success))]",
    },
    {
      label: "رصيد القروض",
      value: formatCurrency(stats?.loans.amount || 0),
      icon: AlertTriangle,
      color: "text-[hsl(var(--status-warning))]",
    },
    {
      label: "الطلبات المعلقة",
      value: stats?.requests.pending || 0,
      icon: Clock,
      color: "text-[hsl(var(--chart-4))]",
    },
    {
      label: "المستندات",
      value: stats?.documents || 0,
      icon: Database,
      color: "text-[hsl(var(--chart-5))]",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>نظرة شاملة على النظام</CardTitle>
        </div>
        <CardDescription>إحصائيات سريعة من جميع أقسام النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {systemStats.map((stat) => (
            <div 
              key={stat.label}
              className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("h-5 w-5", stat.color)} />
                {stat.percentage !== undefined && (
                  <Badge variant="outline" className="text-xs">
                    {stat.percentage}%
                  </Badge>
                )}
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {stat.percentage !== undefined && (
                <Progress value={stat.percentage} className="h-1 mt-2" />
              )}
            </div>
          ))}
        </div>

        {/* مؤشرات الصحة */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-[hsl(var(--status-success))] animate-pulse" />
            <span className="text-muted-foreground">النظام يعمل بشكل طبيعي</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-[hsl(var(--status-success))]" />
            <span className="text-muted-foreground">الأمان مفعّل</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-[hsl(var(--status-success))]" />
            <span className="text-muted-foreground">البيانات محدّثة</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
