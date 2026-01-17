import { useState } from "react";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { matchesStatus } from "@/lib/constants";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { AlertCircle, Clock, CheckCircle, XCircle, Edit, Trash2, MoreVertical, Eye } from "lucide-react";
import { useEmergencyAid } from "@/hooks/beneficiary/useEmergencyAid";
import { UnifiedDataTable, type Column } from "@/components/unified/UnifiedDataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, arLocale as ar } from "@/lib/date";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { ExportButton } from "@/components/shared/ExportButton";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import type { EmergencyAid } from "@/types/loans";
import type { BadgeVariantMap } from "@/types/table-rows";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function EmergencyAidManagement() {
  const { emergencyAids, isLoading, deleteEmergencyAid, isDeleting } = useEmergencyAid();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aidToDelete, setAidToDelete] = useState<EmergencyAid | null>(null);

  const stats = {
    total: emergencyAids.length,
    pending: emergencyAids.filter(a => matchesStatus(a.status, 'pending')).length,
    approved: emergencyAids.filter(a => matchesStatus(a.status, 'approved')).length,
    disbursed: emergencyAids.filter(a => matchesStatus(a.status, 'disbursed')).length,
    totalAmount: emergencyAids.reduce((sum, a) => sum + a.amount, 0),
  };

  const handleDeleteClick = (aid: EmergencyAid) => {
    setAidToDelete(aid);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (aidToDelete && deleteEmergencyAid) {
      await deleteEmergencyAid(aidToDelete.id);
      setDeleteDialogOpen(false);
      setAidToDelete(null);
    }
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
    {
      key: "actions",
      label: "الإجراءات",
      render: (_: unknown, row: EmergencyAid) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="ms-2 h-4 w-4" /> عرض التفاصيل
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="ms-2 h-4 w-4" /> تعديل
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => handleDeleteClick(row)}
            >
              <Trash2 className="ms-2 h-4 w-4" /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ];

  return (
    <PageErrorBoundary pageName="إدارة الفزعات">
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="إدارة الفزعات"
        description="إدارة طلبات الفزعات الطارئة للمستفيدين"
        icon={<AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          emergencyAids.length > 0 && (
            <ExportButton
              data={emergencyAids.map(a => ({
                'المستفيد': a.beneficiaries?.full_name || 'غير محدد',
                'المبلغ': a.amount.toLocaleString() + ' ر.س',
                'السبب': a.reason || '-',
                'الأولوية': a.urgency_level,
                'الحالة': a.status,
                'تاريخ الطلب': format(new Date(a.requested_date), 'dd/MM/yyyy', { locale: ar }),
              }))}
              filename="الفزعات_الطارئة"
              title="تقرير الفزعات الطارئة"
              headers={['المستفيد', 'المبلغ', 'السبب', 'الأولوية', 'الحالة', 'تاريخ الطلب']}
            />
          )
        }
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف طلب الفزعة"
        description="هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء."
        itemName={aidToDelete?.beneficiaries?.full_name || 'الطلب'}
        isLoading={isDeleting}
      />
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
