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
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      description: "قيمة الأصول الكلية"
    },
    {
      title: "إجمالي الإيرادات",
      value: data.totalRevenue,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      description: "الإيرادات المحققة"
    },
    {
      title: "المستفيدون النشطون",
      value: data.activeBeneficiaries,
      icon: Users,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      description: "عدد المستفيدين"
    },
    {
      title: "العقارات النشطة",
      value: data.activeProperties,
      icon: Home,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      description: "العقارات المسجلة"
    },
    {
      title: "العقارات المؤجرة",
      value: data.occupiedProperties,
      icon: Building2,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
      description: "عقود الإيجار النشطة"
    },
    {
      title: "القروض المستحقة",
      value: data.pendingLoans,
      icon: CreditCard,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950",
      description: "القروض النشطة"
    },
    {
      title: "الميزانية المتاحة",
      value: data.availableBudget,
      icon: Wallet,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      description: "الأرصدة البنكية"
    },
    {
      title: "العائد الشهري",
      value: data.monthlyReturn,
      icon: PieChart,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
      description: "إيرادات الشهر الحالي"
    }
  ];

  return (
    <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-2 lg:grid-cols-4 mb-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {kpi.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof kpi.value === 'number' && kpi.value >= 1000 
                ? kpi.value.toLocaleString('ar-SA')
                : kpi.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
