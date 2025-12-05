import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SecurityEvent } from "@/types/security";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { format, arLocale as ar } from "@/lib/date";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { useSecurityDashboardData } from "@/hooks/security/useSecurityDashboardData";

export default function SecurityDashboard() {
  // استخدام Hook المخصص لجلب البيانات
  const { securityEvents, stats, isLoading } = useSecurityDashboardData();

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
        const variants: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
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
    <PageErrorBoundary pageName="لوحة الأمان">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="لوحة الأمان"
          description="مراقبة الأحداث الأمنية ومحاولات الدخول"
          icon={<Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
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
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
