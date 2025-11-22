import { useState, useMemo } from "react";
import { Search, Wrench, Edit, Trash2, Printer } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type MaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { ExportButton } from "@/components/shared/ExportButton";

interface Props {
  onEdit: (request: MaintenanceRequest) => void;
}

export const MaintenanceTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<MaintenanceRequest | null>(null);
  const { requests, isLoading, deleteRequest } = useMaintenanceRequests();

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
      {/* Search and Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="البحث عن طلب صيانة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">إجمالي الطلبات</div>
          <div className="text-2xl font-bold">{requests?.length || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">مكتملة</div>
          <div className="text-2xl font-bold text-success">{completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">قيد التنفيذ</div>
          <div className="text-2xl font-bold text-warning">{pending}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">التكلفة الإجمالية</div>
          <div className="text-2xl font-bold text-primary">
            {totalCost.toLocaleString()} ر.س
          </div>
        </Card>
      </div>

      {/* Maintenance Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">لا توجد طلبات صيانة</div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">رقم الطلب</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">العقار</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">العنوان</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">الفئة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">الأولوية</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden lg:table-cell">التاريخ</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">التكلفة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الحالة</TableHead>
                <TableHead className="text-right text-xs sm:text-sm whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap">{request.request_number}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">{request.properties?.name || '-'}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{request.title}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden md:table-cell">{request.category}</TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell">
                    <Badge className={getPriorityBadge(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm hidden lg:table-cell whitespace-nowrap">
                    {format(new Date(request.requested_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-medium text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                    {(Number(request.actual_cost || request.estimated_cost || 0)).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <Badge className={getStatusBadge(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(request)}
                        title="تعديل"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      {(request.status === "جديد" || request.status === "ملغي") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(request)}
                          title="حذف"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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