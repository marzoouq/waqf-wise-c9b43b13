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
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";

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
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="إجمالي الأحداث"
          value={stats.total}
          icon={Shield}
          variant="default"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="تحذيرات"
          value={stats.warning}
          icon={AlertTriangle}
          variant="warning"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="أخطاء"
          value={stats.error}
          icon={XCircle}
          variant="danger"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="تم الحل"
          value={stats.resolved}
          icon={CheckCircle}
          variant="success"
          loading={isLoading}
        />
      </UnifiedStatsGrid>

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
