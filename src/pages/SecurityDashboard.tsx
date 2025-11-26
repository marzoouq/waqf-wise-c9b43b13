import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SecurityEvent, LoginAttempt } from "@/types/security";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SecurityDashboard() {
  const { data: securityEvents = [], isLoading } = useQuery({
    queryKey: ["security-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as SecurityEvent[];
    },
  });

  const { data: loginAttempts = [] } = useQuery({
    queryKey: ["login-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("login_attempts_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as LoginAttempt[];
    },
  });

  const stats = {
    total: securityEvents.length,
    warning: securityEvents.filter(e => e.severity === 'warning').length,
    error: securityEvents.filter(e => e.severity === 'error').length,
    resolved: securityEvents.filter(e => e.resolved).length,
  };

  const columns: Column<SecurityEvent>[] = [
    {
      key: "event_type",
      label: "نوع الحدث",
      render: (value: string) => {
        const types: Record<string, string> = {
          failed_login_attempt: "محاولة دخول فاشلة",
          suspicious_activity: "نشاط مشبوه",
          password_change: "تغيير كلمة المرور",
          account_locked: "قفل حساب",
          successful_login: "دخول ناجح",
        };
        return types[value] || value;
      }
    },
    {
      key: "severity",
      label: "الخطورة",
      render: (value: string) => {
        const variants: Record<string, any> = {
          info: "secondary",
          warning: "default",
          error: "destructive",
          critical: "destructive",
        };
        const labels: Record<string, string> = {
          info: "معلومة",
          warning: "تحذير",
          error: "خطأ",
          critical: "حرج",
        };
        return <Badge variant={variants[value]}>{labels[value]}</Badge>;
      }
    },
    {
      key: "description",
      label: "الوصف",
      hideOnMobile: true,
    },
    {
      key: "resolved",
      label: "الحالة",
      render: (value: boolean) => (
        value ? 
          <Badge variant="secondary">تم الحل</Badge> : 
          <Badge variant="outline">معلق</Badge>
      )
    },
    {
      key: "created_at",
      label: "التاريخ",
      hideOnTablet: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ar })
    },
  ];

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="لوحة الأمان"
        description="مراقبة الأحداث الأمنية ومحاولات الدخول"
      />

      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأحداث</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.warning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أخطاء</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تم الحل</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* أحداث الأمان */}
      <Card>
        <CardHeader>
          <CardTitle>أحداث الأمان</CardTitle>
          <CardDescription>سجل الأحداث الأمنية الأخيرة</CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={securityEvents}
            loading={isLoading}
            emptyMessage="لا توجد أحداث أمنية"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
