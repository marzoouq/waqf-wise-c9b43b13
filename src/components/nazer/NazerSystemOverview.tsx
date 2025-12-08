/**
 * نظرة شاملة على النظام للناظر
 * إحصائيات سريعة من جميع أقسام النظام
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

interface SystemStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  percentage?: number;
}

export function NazerSystemOverview() {
  const { data: stats, isLoading } = useNazerSystemOverview();

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

  const systemStats: SystemStat[] = [
    {
      label: "المستفيدون",
      value: `${stats?.beneficiaries.active}/${stats?.beneficiaries.total}`,
      icon: Users,
      color: "text-blue-600",
      percentage: stats?.beneficiaries.percentage,
    },
    {
      label: "العقارات المؤجرة",
      value: `${stats?.properties.occupied}/${stats?.properties.total}`,
      icon: Building2,
      color: "text-amber-600",
      percentage: stats?.properties.percentage,
    },
    {
      label: "العقود النشطة",
      value: stats?.contracts.active || 0,
      icon: FileText,
      color: "text-green-600",
    },
    {
      label: "القروض النشطة",
      value: stats?.loans.active || 0,
      icon: Wallet,
      color: "text-red-600",
    },
    {
      label: "إجمالي التحصيل",
      value: formatCurrency(stats?.payments.amount || 0),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "رصيد القروض",
      value: formatCurrency(stats?.loans.amount || 0),
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      label: "الطلبات المعلقة",
      value: stats?.requests.pending || 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "المستندات",
      value: stats?.documents || 0,
      icon: Database,
      color: "text-purple-600",
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
        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-muted-foreground">النظام يعمل بشكل طبيعي</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-status-success" />
            <span className="text-muted-foreground">الأمان مفعّل</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-status-success" />
            <span className="text-muted-foreground">البيانات محدّثة</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
