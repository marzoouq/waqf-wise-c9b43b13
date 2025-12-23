import { useState, useMemo } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/property/useMaintenanceRequests";
import { useMaintenanceSchedules } from "@/hooks/property/useMaintenanceSchedules";
import { Input } from "@/components/ui/input";
import { MaintenanceScheduleCalendar } from "@/components/maintenance/MaintenanceScheduleCalendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format, arLocale as ar } from "@/lib/date";
import { type MaintenanceRequest } from "@/hooks/property/useMaintenanceRequests";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";

interface Props {
  onEdit: (request: MaintenanceRequest) => void;
}

export const MaintenanceTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<MaintenanceRequest | null>(null);
  const { requests, isLoading, deleteRequest } = useMaintenanceRequests();
  const { schedules } = useMaintenanceSchedules();

  const handleDeleteClick = (request: MaintenanceRequest) => {
    if (request.status !== "جديد" && request.status !== "ملغي") {
      return; // يمكن حذف فقط الطلبات الجديدة أو الملغاة
    }
    setRequestToDelete(request);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (requestToDelete) {
      deleteRequest.mutate(requestToDelete.id);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    
    const query = searchQuery.toLowerCase();
    return requests?.filter(
      (r) =>
        r.request_number.toLowerCase().includes(query) ||
        r.title.toLowerCase().includes(query) ||
        r.properties?.name.toLowerCase().includes(query)
    ) || [];
  }, [requests, searchQuery]);

  const getStatusBadge = (status: string) => {
    const styles = {
      "جديد": "bg-primary/10 text-primary",
      "قيد المراجعة": "bg-warning/10 text-warning",
      "معتمد": "bg-info/10 text-info",
      "قيد التنفيذ": "bg-accent/10 text-accent",
      "مكتمل": "bg-success/10 text-success",
      "ملغي": "bg-muted text-muted-foreground",
    };
    return styles[status as keyof typeof styles] || "bg-muted";
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      "عاجلة": "bg-destructive/10 text-destructive",
      "عالية": "bg-warning/10 text-warning",
      "عادية": "bg-primary/10 text-primary",
      "منخفضة": "bg-muted text-muted-foreground",
    };
    return styles[priority as keyof typeof styles] || "bg-muted";
  };

  const totalCost = requests?.reduce((sum, r) => sum + Number(r.actual_cost || r.estimated_cost || 0), 0) || 0;
  const completed = requests?.filter(r => r.status === 'مكتمل').length || 0;
  const pending = requests?.filter(r => r.status === 'قيد التنفيذ').length || 0;

  return (
    <div className="space-y-6">
      {/* Maintenance Schedule Calendar */}
      <MaintenanceScheduleCalendar schedules={schedules} />

      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن طلب صيانة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        {filteredRequests.length > 0 && (
          <ExportButton
            data={filteredRequests.map(r => ({
              'رقم الطلب': r.request_number,
              'العقار': r.properties?.name || '-',
              'العنوان': r.title,
              'الفئة': r.category,
              'الأولوية': r.priority,
              'التاريخ': format(new Date(r.requested_date), 'yyyy/MM/dd', { locale: ar }),
              'التكلفة المقدرة': (r.estimated_cost || 0).toLocaleString(),
              'التكلفة الفعلية': (r.actual_cost || 0).toLocaleString(),
              'الحالة': r.status,
            }))}
            filename="طلبات_الصيانة"
            title="طلبات الصيانة"
            headers={['رقم الطلب', 'العقار', 'العنوان', 'الفئة', 'الأولوية', 'التاريخ', 'التكلفة المقدرة', 'التكلفة الفعلية', 'الحالة']}
            variant="outline"
            size="sm"
          />
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">إجمالي الطلبات</div>
          <div className="text-lg sm:text-2xl font-bold">{requests?.length || 0}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">مكتملة</div>
          <div className="text-lg sm:text-2xl font-bold text-success">{completed}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">قيد التنفيذ</div>
          <div className="text-lg sm:text-2xl font-bold text-warning">{pending}</div>
        </Card>
        <Card className="p-3 sm:p-4">
          <div className="text-xs sm:text-sm text-muted-foreground">التكلفة الإجمالية</div>
          <div className="text-lg sm:text-2xl font-bold text-primary">
            {totalCost.toLocaleString()} <span className="text-xs sm:text-sm">ر.س</span>
          </div>
        </Card>
      </div>

      {/* Maintenance Table */}
      <UnifiedDataTable
        title="طلبات الصيانة"
        columns={[
          {
            key: "request_number",
            label: "رقم الطلب",
            render: (value: string) => <span className="font-medium">{value}</span>
          },
          {
            key: "properties",
            label: "العقار",
            hideOnTablet: true,
            render: (_: unknown, row: MaintenanceRequest) => row.properties?.name || '-'
          },
          {
            key: "title",
            label: "العنوان"
          },
          {
            key: "category",
            label: "الفئة",
            hideOnMobile: true
          },
          {
            key: "priority",
            label: "الأولوية",
            hideOnTablet: true,
            render: (value: string) => (
              <Badge className={getPriorityBadge(value)}>
                {value}
              </Badge>
            )
          },
          {
            key: "requested_date",
            label: "التاريخ",
            hideOnTablet: true,
            render: (value: string) => (
              <span className="whitespace-nowrap">
                {format(new Date(value), 'yyyy/MM/dd', { locale: ar })}
              </span>
            )
          },
          {
            key: "cost",
            label: "التكلفة",
            hideOnMobile: true,
            render: (_: unknown, row: MaintenanceRequest) => (
              <span className="font-medium whitespace-nowrap">
                {(Number(row.actual_cost || row.estimated_cost || 0)).toLocaleString()} ر.س
              </span>
            )
          },
          {
            key: "status",
            label: "الحالة",
            render: (value: string) => (
              <Badge className={getStatusBadge(value)}>
                {value}
              </Badge>
            )
          }
        ]}
        data={filteredRequests}
        loading={isLoading}
        emptyMessage="لا توجد طلبات صيانة"
        actions={(request: MaintenanceRequest) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(request)}
              title="تعديل"
              className="hover:bg-primary/10"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            {(request.status === "جديد" || request.status === "ملغي") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteClick(request)}
                title="حذف"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        )}
        showMobileScrollHint={true}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="حذف طلب الصيانة"
        description="هل أنت متأكد من حذف هذا الطلب؟"
        itemName={requestToDelete ? `${requestToDelete.request_number} - ${requestToDelete.title}` : ""}
        isLoading={deleteRequest.isPending}
      />
    </div>
  );
};