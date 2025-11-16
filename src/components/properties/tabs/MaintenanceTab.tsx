import { useState, useMemo } from "react";
import { Search, Wrench, Edit } from "lucide-react";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { type MaintenanceRequest } from "@/hooks/useMaintenanceRequests";

interface Props {
  onEdit: (request: MaintenanceRequest) => void;
}

export const MaintenanceTab = ({ onEdit }: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { requests, isLoading } = useMaintenanceRequests();

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
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="البحث عن طلب صيانة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
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
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العقار</TableHead>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">التكلفة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.request_number}</TableCell>
                  <TableCell>{request.properties?.name || '-'}</TableCell>
                  <TableCell>{request.title}</TableCell>
                  <TableCell>{request.category}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(request.priority)}>
                      {request.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(request.requested_date), 'yyyy/MM/dd', { locale: ar })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(Number(request.actual_cost || request.estimated_cost || 0)).toLocaleString()} ر.س
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(request)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};