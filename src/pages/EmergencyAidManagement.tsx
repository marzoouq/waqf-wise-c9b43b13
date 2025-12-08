import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEmergencyAid } from "@/hooks/useEmergencyAid";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { format, arLocale as ar } from "@/lib/date";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import type { EmergencyAid } from "@/types/loans";
import type { BadgeVariantMap } from "@/types/table-rows";

export default function EmergencyAidManagement() {
  const { emergencyAids, isLoading } = useEmergencyAid();

  const stats = {
    total: emergencyAids.length,
    pending: emergencyAids.filter(a => a.status === 'pending').length,
    approved: emergencyAids.filter(a => a.status === 'approved').length,
    disbursed: emergencyAids.filter(a => a.status === 'disbursed').length,
    totalAmount: emergencyAids.reduce((sum, a) => sum + a.amount, 0),
  };

  const columns: Column<EmergencyAid>[] = [
    {
      key: "beneficiaries",
      label: "المستفيد",
      render: (_: unknown, row: EmergencyAid) => row.beneficiaries?.full_name || 'غير محدد'
    },
    {
      key: "amount",
      label: "المبلغ",
      render: (value: number) => (
        <span className="font-bold">{value.toLocaleString()} ر.س</span>
      )
    },
    {
      key: "reason",
      label: "السبب",
      hideOnMobile: true,
    },
    {
      key: "urgency_level",
      label: "الأولوية",
      render: (value: string) => {
        const variants: BadgeVariantMap = {
          critical: 'destructive',
          high: 'default',
          medium: 'secondary',
          low: 'outline',
        };
        const labels: Record<string, string> = {
          critical: 'عاجل جداً',
          high: 'عاجل',
          medium: 'متوسط',
          low: 'عادي',
        };
        return <Badge variant={variants[value]}>{labels[value]}</Badge>;
      }
    },
    {
      key: "status",
      label: "الحالة",
      render: (value: string) => {
        const variants: BadgeVariantMap = {
          pending: 'outline',
          approved: 'default',
          rejected: 'destructive',
          disbursed: 'secondary',
        };
        const labels: Record<string, string> = {
          pending: 'معلق',
          approved: 'موافق',
          rejected: 'مرفوض',
          disbursed: 'مصروف',
        };
        return <Badge variant={variants[value]}>{labels[value]}</Badge>;
      }
    },
    {
      key: "requested_date",
      label: "تاريخ الطلب",
      hideOnTablet: true,
      render: (value: string) => format(new Date(value), 'dd/MM/yyyy', { locale: ar })
    },
  ];

  return (
    <PageErrorBoundary pageName="إدارة الفزعات">
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="إدارة الفزعات"
        description="إدارة طلبات الفزعات الطارئة للمستفيدين"
        icon={<AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
      />

      {/* الإحصائيات */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="طلبات معلقة"
          value={stats.pending}
          icon={Clock}
          variant="warning"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="طلبات موافق عليها"
          value={stats.approved}
          icon={CheckCircle}
          variant="success"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="طلبات مصروفة"
          value={stats.disbursed}
          icon={AlertCircle}
          variant="default"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="إجمالي المبالغ"
          value={`${stats.totalAmount.toLocaleString()} ر.س`}
          icon={XCircle}
          variant="default"
          loading={isLoading}
        />
      </UnifiedStatsGrid>

      {/* جدول الفزعات */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الفزعات</CardTitle>
          <CardDescription>جميع طلبات الفزعات الطارئة</CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={emergencyAids as EmergencyAid[]}
            loading={isLoading}
            emptyMessage="لا توجد طلبات فزعات"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
