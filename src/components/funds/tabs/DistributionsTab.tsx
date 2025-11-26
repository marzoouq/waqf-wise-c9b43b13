import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckSquare, Calculator, Plus, Trash2 } from "lucide-react";
import { DistributionDetailsDialog } from "@/components/distributions/DistributionDetailsDialog";
import { ApprovalWorkflowDialog } from "@/components/distributions/ApprovalWorkflowDialog";
import { DistributionSimulator } from "@/components/distributions/DistributionSimulator";
import { CreateDistributionDialog } from "@/components/distributions/CreateDistributionDialog";
import { useDistributions, Distribution } from "@/hooks/useDistributions";
import { ExportButton } from "@/components/shared/ExportButton";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DistributionsTab() {
  const { distributions, isLoading, deleteDistribution } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [distributionToDelete, setDistributionToDelete] = useState<Distribution | null>(null);

  const handleDeleteClick = (distribution: Distribution) => {
    if (distribution.status === "معتمد") {
      return; // لا تفتح الحوار للتوزيعات المعتمدة
    }
    setDistributionToDelete(distribution);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (distributionToDelete) {
      deleteDistribution(distributionToDelete.id);
      setDeleteDialogOpen(false);
      setDistributionToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      "مسودة": "secondary",
      "معتمد": "default",
      "مرفوض": "destructive",
      "معلق": "secondary",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  // Define columns for UnifiedDataTable
  const columns = [
    {
      key: "month",
      label: "الشهر",
      render: (value: string) => <span className="font-medium">{value}</span>
    },
    {
      key: "total_amount",
      label: "إجمالي المبلغ",
      render: (value: number) => `${value?.toLocaleString() || 0} ر.س`
    },
    {
      key: "beneficiaries_count",
      label: "عدد المستفيدين",
    },
    {
      key: "status",
      label: "الحالة",
      render: (_: any, row: Distribution) => getStatusBadge(row.status)
    }
  ];

  // Actions for each row
  const renderActions = (distribution: Distribution) => (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedDistribution(distribution);
          setDetailsOpen(true);
        }}
        className="gap-1 text-xs"
      >
        <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">التفاصيل</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setSelectedDistribution(distribution);
          setApprovalOpen(true);
        }}
        className="gap-1 text-xs"
      >
        <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="hidden sm:inline">الموافقات</span>
      </Button>
      {distribution.status !== "معتمد" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteClick(distribution)}
          className="gap-1 text-xs text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">حذف</span>
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-3 justify-end">
        {distributions.length > 0 && (
          <ExportButton
            data={distributions.map(d => ({
              'الشهر': d.month,
              'إجمالي المبلغ': d.total_amount?.toLocaleString() || '0',
              'عدد المستفيدين': d.beneficiaries_count,
              'حصة الناظر': d.nazer_share?.toLocaleString() || '0',
              'تاريخ التوزيع': format(new Date(d.distribution_date), 'yyyy/MM/dd', { locale: ar }),
              'الحالة': d.status,
            }))}
            filename="التوزيعات"
            title="تقرير التوزيعات"
            headers={['الشهر', 'إجمالي المبلغ', 'عدد المستفيدين', 'حصة الناظر', 'تاريخ التوزيع', 'الحالة']}
            variant="outline"
            size="sm"
          />
        )}
        <Button onClick={() => setSimulatorOpen(true)} variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          محاكاة التوزيع
        </Button>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إنشاء توزيع جديد
        </Button>
      </div>

      {/* Unified Data Table */}
      <UnifiedDataTable
        title="التوزيعات السابقة"
        columns={columns}
        data={distributions}
        loading={isLoading}
        emptyMessage="لا توجد توزيعات"
        actions={renderActions}
        showMobileScrollHint={true}
      />

      <DistributionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        distribution={selectedDistribution}
      />

      <ApprovalWorkflowDialog
        open={approvalOpen}
        onOpenChange={setApprovalOpen}
        distribution={selectedDistribution}
      />

      <DistributionSimulator
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
      />

      <CreateDistributionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف التوزيع لشهر <span className="font-bold">{distributionToDelete?.month}</span> بمبلغ{" "}
              <span className="font-bold">{distributionToDelete?.total_amount?.toLocaleString()} ر.س</span>؟
              <br />
              <span className="text-destructive">هذا الإجراء لا يمكن التراجع عنه.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
