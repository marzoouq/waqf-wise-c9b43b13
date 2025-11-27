import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useLoans, type Loan } from "@/hooks/useLoans";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import type { BadgeVariantMap } from "@/types/table-rows";

export default function LoansManagement() {
  const { loans, isLoading } = useLoans();

  // إحصائيات سريعة
  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    completed: loans.filter(l => l.status === 'paid').length,
    totalAmount: loans.reduce((sum, l) => sum + (l.loan_amount || 0), 0),
  };

  const columns: Column<Loan>[] = [
    {
      key: "loan_number",
      label: "رقم القرض",
      render: (value: string) => <span className="font-medium">{value || '-'}</span>
    },
    {
      key: "beneficiaries",
      label: "المستفيد",
      render: (_: unknown, row: Loan) => row.beneficiaries?.full_name || 'غير محدد'
    },
    {
      key: "loan_amount",
      label: "المبلغ",
      render: (value: number) => (
        <span className="font-bold">{(value || 0).toLocaleString()} ر.س</span>
      )
    },
    {
      key: "paid_amount",
      label: "المسدد",
      hideOnMobile: true,
      render: (value: number) => (
        <span className="text-muted-foreground">{(value || 0).toLocaleString()} ر.س</span>
      )
    },
    {
      key: "remaining_balance",
      label: "المتبقي",
      hideOnTablet: true,
      render: (value: number) => (
        <span className="text-destructive font-medium">{(value || 0).toLocaleString()} ر.س</span>
      )
    },
    {
      key: "term_months",
      label: "المدة",
      hideOnMobile: true,
      render: (value: number) => `${value} شهر`
    },
    {
      key: "status",
      label: "الحالة",
      render: (value: string) => {
        const variants: BadgeVariantMap = {
          'نشط': 'default',
          'مسدد': 'secondary',
          'متأخر': 'destructive',
        };
        return <Badge variant={variants[value] || 'outline'}>{value}</Badge>;
      }
    },
  ];

  return (
    <div className="container-custom py-6 space-y-6">
      <PageHeader
        title="إدارة القروض"
        description="إدارة قروض المستفيدين وجداول السداد"
      />

      {/* الإحصائيات */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="إجمالي القروض"
          value={stats.total}
          icon={DollarSign}
          variant="default"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="القروض النشطة"
          value={stats.active}
          icon={TrendingUp}
          variant="warning"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="القروض المسددة"
          value={stats.completed}
          icon={CheckCircle}
          variant="success"
          loading={isLoading}
        />
        <UnifiedKPICard
          title="إجمالي المبالغ"
          value={`${stats.totalAmount.toLocaleString()} ر.س`}
          icon={AlertCircle}
          variant="default"
          loading={isLoading}
        />
      </UnifiedStatsGrid>

      {/* جدول القروض */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>قائمة القروض</CardTitle>
              <CardDescription>إدارة جميع قروض المستفيدين</CardDescription>
            </div>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              قرض جديد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <UnifiedDataTable
            columns={columns}
            data={loans}
            loading={isLoading}
            emptyMessage="لا توجد قروض"
            showMobileScrollHint={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
