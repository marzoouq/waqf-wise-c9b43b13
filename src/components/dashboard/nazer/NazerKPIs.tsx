import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Home, 
  CreditCard,
  Wallet,
  PieChart
} from "lucide-react";
import { useNazerKPIs } from "@/hooks/useNazerKPIs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function NazerKPIs() {
  const { data, isLoading, isError, error } = useNazerKPIs();

  if (isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          حدث خطأ في جلب البيانات: {error instanceof Error ? error.message : 'خطأ غير معروف'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpiCards = [
    {
      title: "إجمالي الأصول",
      value: data.totalAssets,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      description: "قيمة الأصول الكلية",
      trend: "+8.3%"
    },
    {
      title: "إجمالي الإيرادات",
      value: data.totalRevenue,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      description: "الإيرادات المحققة",
      trend: "+5.2%"
    },
    {
      title: "المستفيدون النشطون",
      value: data.activeBeneficiaries,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
      description: "عدد المستفيدين",
      trend: "+2.1%"
    },
    {
      title: "الميزانية المتاحة",
      value: data.availableBudget,
      icon: Wallet,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
      description: "الأرصدة البنكية",
      trend: "+15.7%"
    },
    {
      title: "العقارات النشطة",
      value: data.activeProperties,
      icon: Home,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      description: "العقارات المسجلة",
      trend: "0"
    },
    {
      title: "العقارات المؤجرة",
      value: data.occupiedProperties,
      icon: Building2,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/50",
      description: "عقود الإيجار النشطة",
      trend: "+12.5%"
    },
    {
      title: "القروض المستحقة",
      value: data.pendingLoans,
      icon: CreditCard,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      description: "القروض النشطة",
      trend: "+3.2%"
    },
    {
      title: "العائد الشهري",
      value: data.monthlyReturn,
      icon: PieChart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      description: "إيرادات الشهر الحالي",
      trend: "+6.8%"
    }
  ];

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground mb-1">إحصائيات العائلات</h2>
        <p className="text-sm text-muted-foreground">نظرة شاملة على جميع أنشطة النظام</p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi, index) => (
          <Card 
            key={index} 
            className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${kpi.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                {kpi.trend && kpi.trend !== "0" && (
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    kpi.trend.startsWith('+') 
                      ? 'bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400' 
                      : 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                  }`}>
                    {kpi.trend}
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {typeof kpi.value === 'number' 
                    ? kpi.value.toLocaleString('ar-SA')
                    : kpi.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {kpi.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
