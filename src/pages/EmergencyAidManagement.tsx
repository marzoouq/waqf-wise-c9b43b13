import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { useEmergencyAid } from "@/hooks/useEmergencyAid";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function EmergencyAidManagement() {
  const { emergencyAids, isLoading } = useEmergencyAid();

  const stats = {
    total: emergencyAids.length,
    pending: emergencyAids.filter(a => a.status === 'pending').length,
    approved: emergencyAids.filter(a => a.status === 'approved').length,
    disbursed: emergencyAids.filter(a => a.status === 'disbursed').length,
    totalAmount: emergencyAids.reduce((sum, a) => sum + a.amount, 0),
  };

  const columns: Column<any>[] = [
    {
      key: "beneficiaries",
      label: "المستفيد",
      render: (_: any, row: any) => row.beneficiaries?.full_name || 'غير محدد'
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
        const variants: Record<string, any> = {
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
        const variants: Record<string, any> = {
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
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="إدارة الفزعات"
        description="إدارة طلبات الفزعات الطارئة للمستفيدين"
      />

      {/* الإحصائيات */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات موافق عليها</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات مصروفة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.disbursed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبالغ</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAmount.toLocaleString()} ر.س
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول الفزعات */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات الفزعات</CardTitle>
          <CardDescription>جميع طلبات الفزعات الطارئة</CardDescription>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={emergencyAids}
            loading={isLoading}
            emptyMessage="لا توجد طلبات فزعات"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
