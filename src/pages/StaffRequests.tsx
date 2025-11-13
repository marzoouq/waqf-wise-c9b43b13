import { useState } from "react";
import { useRequests } from "@/hooks/useRequests";
import { useRequestTypes } from "@/hooks/useRequests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { RequestApprovalDialog } from "@/components/requests/RequestApprovalDialog";
import { RequestCommentsDialog } from "@/components/requests/RequestCommentsDialog";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function StaffRequests() {
  const { requests, isLoading } = useRequests();
  const { requestTypes } = useRequestTypes();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);

  const filteredRequests = requests?.filter((request) => {
    const matchesSearch =
      request.beneficiary?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.request_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.request_type_id === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // إحصائيات
  const stats = {
    pending: requests?.filter((r) => r.status === "قيد المراجعة").length || 0,
    inProgress: requests?.filter((r) => r.status === "قيد المعالجة").length || 0,
    approved: requests?.filter((r) => r.status === "موافق عليه").length || 0,
    rejected: requests?.filter((r) => r.status === "مرفوض").length || 0,
    overdue: requests?.filter((r) => r.is_overdue).length || 0,
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          متأخر
        </Badge>
      );
    }

    switch (status) {
      case "قيد المراجعة":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            قيد المراجعة
          </Badge>
        );
      case "قيد المعالجة":
        return (
          <Badge variant="default" className="gap-1">
            <FileText className="h-3 w-3" />
            قيد المعالجة
          </Badge>
        );
      case "موافق عليه":
        return (
          <Badge className="gap-1 bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3" />
            موافق عليه
          </Badge>
        );
      case "مرفوض":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            مرفوض
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6 p-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold">لوحة إدارة الطلبات</h1>
        <p className="text-muted-foreground mt-2">
          إدارة ومتابعة طلبات المستفيدين
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد المراجعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد المعالجة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              موافق عليها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مرفوضة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">
              متأخرة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، رقم الطلب، أو الوصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                <SelectItem value="موافق عليه">موافق عليه</SelectItem>
                <SelectItem value="مرفوض">مرفوض</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                {requestTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول الطلبات */}
      <Card>
        <CardContent className="p-0">
          {filteredRequests?.length === 0 ? (
            <EmptyState
              title="لا توجد طلبات"
              description="لم يتم العثور على أي طلبات تطابق معايير البحث"
              icon={FileText}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>المستفيد</TableHead>
                  <TableHead>نوع الطلب</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الأولوية</TableHead>
                  <TableHead>تاريخ الإنشاء</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests?.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.request_number}
                    </TableCell>
                    <TableCell>{request.beneficiary?.full_name}</TableCell>
                    <TableCell>
                      {requestTypes?.find((t) => t.id === request.request_type_id)?.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.description}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status, request.is_overdue)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.priority === "عاجلة"
                            ? "destructive"
                            : request.priority === "عالية"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(request.submitted_at), {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </TableCell>
                    <TableCell>
                      {request.sla_due_at && (
                        <span
                          className={`text-xs ${
                            request.is_overdue
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                          }`}
                        >
                          {formatDistanceToNow(new Date(request.sla_due_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(request);
                            setApprovalDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRequest(request);
                            setCommentsDialogOpen(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* محاورات */}
      {selectedRequest && (
        <>
          <RequestApprovalDialog
            open={approvalDialogOpen}
            onOpenChange={setApprovalDialogOpen}
            requestId={selectedRequest.id}
            requestType={requestTypes?.find((t) => t.id === selectedRequest.request_type_id)?.name || ""}
            requestDescription={selectedRequest.description}
          />
          <RequestCommentsDialog
            open={commentsDialogOpen}
            onOpenChange={setCommentsDialogOpen}
            requestId={selectedRequest.id}
            requestNumber={selectedRequest.request_number}
          />
        </>
      )}
    </div>
  );
}
