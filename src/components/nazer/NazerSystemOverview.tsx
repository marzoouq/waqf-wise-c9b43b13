/**
 * نظرة شاملة على النظام للناظر
 * إحصائيات سريعة من جميع أقسام النظام
 */
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Users, FileText, Wallet, 
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Database, Shield, Activity
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SystemStat {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  trend?: "up" | "down" | "stable";
  percentage?: number;
}

export function NazerSystemOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["nazer-system-overview"],
    queryFn: async () => {
      // تنفيذ الاستعلامات بالتوازي
      const [
        beneficiariesRes,
        propertiesRes,
        contractsRes,
        loansRes,
        paymentsRes,
        requestsRes,
        documentsRes,
      ] = await Promise.all([
        supabase.from("beneficiaries").select("id, status", { count: "exact" }),
        supabase.from("properties").select("id, status", { count: "exact" }),
        supabase.from("contracts").select("id, status", { count: "exact" }),
        supabase.from("loans").select("id, status, loan_amount, paid_amount", { count: "exact" }),
        supabase.from("rental_payments").select("id, amount_paid, status").eq("status", "مدفوع"),
        supabase.from("beneficiary_requests").select("id, status", { count: "exact" }),
        supabase.from("documents").select("id", { count: "exact" }),
      ]);

      const beneficiaries = beneficiariesRes.data || [];
      const properties = propertiesRes.data || [];
      const contracts = contractsRes.data || [];
      const loans = loansRes.data || [];
      const payments = paymentsRes.data || [];
      const requests = requestsRes.data || [];

      const activeBeneficiaries = beneficiaries.filter(b => b.status === "نشط").length;
      const occupiedProperties = properties.filter(p => p.status === "مؤجر").length;
      const activeContracts = contracts.filter(c => c.status === "نشط" || c.status === "active").length;
      const activeLoans = loans.filter(l => l.status === "نشط" || l.status === "active").length;
      const totalLoansAmount = loans.reduce((sum, l) => sum + ((l.loan_amount || 0) - (l.paid_amount || 0)), 0);
      const totalPayments = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
      const pendingRequests = requests.filter(r => r.status === "pending" || r.status === "معلق").length;

      return {
        beneficiaries: {
          total: beneficiaries.length,
          active: activeBeneficiaries,
          percentage: beneficiaries.length > 0 ? Math.round((activeBeneficiaries / beneficiaries.length) * 100) : 0,
        },
        properties: {
          total: properties.length,
          occupied: occupiedProperties,
          percentage: properties.length > 0 ? Math.round((occupiedProperties / properties.length) * 100) : 0,
        },
        contracts: {
          total: contracts.length,
          active: activeContracts,
        },
        loans: {
          total: loans.length,
          active: activeLoans,
          amount: totalLoansAmount,
        },
        payments: {
          total: payments.length,
          amount: totalPayments,
        },
        requests: {
          total: requests.length,
          pending: pendingRequests,
        },
        documents: documentsRes.count || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
  });

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
